import React, { Component } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";
import { ObjectId } from "mongodb";

export default class EditModule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            module_info: {
                title: "",
                owner_email: "",
                owner_id: "",
                owner_name: "",
                description: "",
                pins: [],
                shared_array: [],
                public: false,
            },
        };

        this.fetch_userinfo = this.fetch_userinfo.bind(this);
        this.save_module = this.save_module.bind(this);

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
        await this.db
            .collection("MODULES")
            .find({
                _id: ObjectId(this.props.match.params.id),
            })
            .asArray()
            .then((module_info) => {
                if (module_info === undefined || module_info.length === 0) {
                    console.log(module_info);
                    return;
                }
                this.setState({ module_info: module_info[0] });
                console.log(module_info);
            })
            .catch((err) => {
                this.setState({ error: err });
                console.log(err);
            });
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

    render() {
        return (
            <div
                style={{
                    top: "10px",
                    position: "relative",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
                className="container"
            >
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
                        }}
                        as={Row}
                    >
                        <Col xs={4}>
                            <Form.Check
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
                        </Col>
                        <Col xs={4}>
                            <Form.Check
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
                        </Col>
                    </Form.Group>

                    <Form.Group>
                        <Button variant="primary" size="lg" block>
                            Add Pins
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            block
                            onClick={(event) => {
                                event.preventDefault();
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
            </div>
        );
    }
}
