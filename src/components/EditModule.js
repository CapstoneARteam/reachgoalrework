import React, { Component } from "react";
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Tabs,
    Tab,
    ListGroup,
} from "react-bootstrap";
import { List, arrayMove } from "react-movable";
import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";
import { ObjectId } from "mongodb";
import "./EditModule.css";

export default class EditModule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            module_info: {
                _id: "",
                title: "",
                owner_email: "",
                owner_id: "",
                owner_name: "",
                description: "",
                pins: [],
                shared_array: [],
                public: false,
            },
            pins: [],
        };

        this.fetch_userinfo = this.fetch_userinfo.bind(this);
        this.module_form = this.module_form.bind(this);
        this.save_module = this.save_module.bind(this);
        this.list_pins = this.list_pins.bind(this);
        this.delete_pin = this.delete_pin.bind(this);

        const appId = "capstonear_app-xkqng";
        this.client = Stitch.hasAppClient(appId)
            ? Stitch.getAppClient(appId)
            : Stitch.initializeDefaultAppClient(appId);
        const mongodb = this.client.getServiceClient(
            RemoteMongoClient.factory,
            "mongodb-atlas"
        );
        this.db = mongodb.db("APP");
    }

    componentDidMount() {
        this.fetch_userinfo();
        const appId = "capstonear_app-xkqng";
        if (Stitch.hasAppClient(appId)) {
            this.client = Stitch.getAppClient(appId);
            const mongodb = this.client.getServiceClient(
                RemoteMongoClient.factory,
                "mongodb-atlas"
            );
            //select the db in our mongdb atlas cluster
            this.db = mongodb.db("APP");
            console.log("client");
        } else {
            this.client = Stitch.initializeAppClient(appId);
            console.log("client init");
        }
    }

    async fetch_userinfo() {
        const query = {
            _id: ObjectId(this.props.match.params.id),
        };

        await this.db
            .collection("MODULES")
            .findOne(query)
            .then((res) => {
                console.log("Module: ", res);
                this.setState({ module_info: res });

                // Pipeline to ensure that the order of the pins stays the same after the query
                const pipeline = [
                    { $match: { _id: { $in: res.pins } } },
                    {
                        $addFields: {
                            __order: { $indexOfArray: [res.pins, "$_id"] },
                        },
                    },
                    { $sort: { __order: 1 } },
                ];

                this.db
                    .collection("PINS")
                    .aggregate(pipeline)
                    .toArray()
                    .then((res) => {
                        console.log("Pins: ", res);
                        this.setState({ pins: res });
                    });
            })
            .catch(console.error);
    }

    module_form() {
        return (
            <Form>
                <Form.Group>
                    <Form.Control
                        type="title"
                        id="title"
                        value={this.state.module_info.title}
                        onChange={(e) => {
                            var module_info = this.state.module_info;
                            module_info.title = e.target.value;
                            this.setState({ module_info: module_info });
                        }}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Control
                        as="textarea"
                        rows="5"
                        id="description"
                        value={this.state.module_info.description}
                        onChange={(e) => {
                            var module_info = this.state.module_info;
                            module_info.description = e.target.value;
                            this.setState({ module_info: module_info });
                        }}
                    />
                </Form.Group>

                <Form.Group
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "0",
                    }}
                >
                    <Form.Check
                        inline
                        type="radio"
                        label="Public"
                        name="formHorizontalRadios"
                        id="true"
                        checked={this.state.module_info.public}
                        onChange={(e) => {
                            var module_info = this.state.module_info;
                            module_info.public = true;
                            this.setState({
                                module_info: module_info,
                            });
                        }}
                    />
                    <Form.Check
                        inline
                        type="radio"
                        label="Private"
                        name="formHorizontalRadios"
                        id="false"
                        checked={!this.state.module_info.public}
                        onChange={(e) => {
                            var module_info = this.state.module_info;
                            module_info.public = false;
                            this.setState({
                                module_info: module_info,
                            });
                        }}
                    />
                </Form.Group>
            </Form>
        );
    }

    save_module() {
        const query = { _id: this.state.module_info._id };
        const update = {
            $set: this.state.module_info,
        };
        const options = { upsert: false };

        this.db
            .collection("MODULES")
            .updateOne(query, update, options)
            .then((res) => {
                console.log("Save response: ", res);

                // Go back to Manage Module view
                window.location.assign("#/modules/edit/");
            })
            .catch(console.error);
    }

    list_pins() {
        return (
            <List
                values={this.state.pins}
                onChange={({ oldIndex, newIndex }) => {
                    var pins = this.state.pins;
                    pins = arrayMove(pins, oldIndex, newIndex);
                    this.setState({ pins: pins });
                }}
                renderList={({ children, props }) => (
                    <ol
                        {...props}
                        style={{
                            display: "grid",
                            justifyContent: "center",
                            paddingLeft: "0px",
                        }}
                    >
                        {children}
                    </ol>
                )}
                renderItem={({ value, index, props }) => (
                    <li {...props}>
                        <Row style={{ marginTop: "5px", marginBottom: "5px" }}>
                            <Col
                                xs="4"
                                style={{
                                    marginTop: "auto",
                                    marginBottom: "auto",
                                }}
                            >
                                {this.state.pins[index].title}
                            </Col>
                            <Col>
                                <Button
                                    variant="link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // TODO: Pull up the Edit Pin modal
                                        // If you Can pull up Edit Pin modal, probably don't need editable title
                                    }}
                                >
                                    Edit
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    variant="danger"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.delete_pin(index);
                                    }}
                                >
                                    Delete
                                </Button>
                            </Col>
                        </Row>
                    </li>
                )}
            />
        );
    }

    delete_pin(idx) {
        const query = { _id: this.state.pins[idx]._id };
        this.db
            .collection("PINS")
            .deleteOne(query)
            .then((res) => {
                console.log("Delete response: ", res);

                // Update pin list
                var pins = this.state.pins;
                pins.splice(idx, 1);
                this.setState({ pins: pins, idx: -1 });
            })
            .catch(console.error);
    }

    render() {
        return (
            <Container
                style={{
                    marginTop: "10px",
                    maxWidth: "540px",
                    height: "100%",
                }}
            >
                <Form style={{ height: "100%" }}>
                    <Tabs
                        defaultActiveKey="Module Info"
                        transition={false}
                        style={{
                            textAlign: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Tab eventKey="Module Info" title="Module Info">
                            {this.module_form()}
                        </Tab>
                        <Tab
                            eventKey="Pins"
                            title="Pins"
                            style={{ height: "100%" }}
                        >
                            {this.list_pins()}
                        </Tab>
                    </Tabs>
                    <Form.Group>
                        <Button
                            variant="primary"
                            size="lg"
                            block
                            onClick={(e) => {
                                e.preventDefault();
                                window.location.assign("#/droppin");
                                // var id = this.state.module_info._id;
                                // window.location.assign("#/pins/edit/" + id);
                            }}
                        >
                            Pin Map
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            block
                            onClick={(e) => {
                                e.preventDefault();
                                this.save_module();
                            }}
                        >
                            Save
                        </Button>
                    </Form.Group>

                    <Form.Group
                        style={{
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Button variant="primary">Share</Button>
                    </Form.Group>
                </Form>
            </Container>
        );
    }
}
