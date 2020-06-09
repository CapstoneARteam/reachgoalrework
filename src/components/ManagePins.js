import React, { Component } from "react";
// import {
//     Form,
//     FormGroup,
//     Input,
//     Row,
//     Col,
//     Button,
//     Modal,
//     ModalHeader,
//     ModalBody,
//     ModalFooter,
// } from "reactstrap";
import { Row, Col, Form, Button, Modal, ListGroup } from "react-bootstrap";
import { List, arrayMove } from "react-movable";
import { ObjectId } from "mongodb";
import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";

export default class ManagePins extends Component {
    constructor(props) {
        super(props);
        this.state = {
            module_id: "",
            pins: [],
            modal: false,
            idx: -1,
        };

        this.fetch_userinfo = this.fetch_userinfo.bind(this);
        this.toggle = this.toggle.bind(this);
        this.modal_message = this.modal_message.bind(this);
        this.list_pins = this.list_pins.bind(this);
        this.delete_pin = this.delete_pin.bind(this);
        this.add_pin = this.add_pin.bind(this);
        this.save_pins = this.save_pins.bind(this);

        // Setting up DB with Stitch
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
                        console.log("Aggregate response: ", res);
                        this.setState({ pins: res });
                    });
            })
            .catch(console.error);
    }

    toggle() {
        var modal = !this.state.modal;
        this.setState({ modal: modal });
    }

    modal_message() {
        if (this.state.idx < 0) return <p>Nothing to delete</p>;
        else
            return (
                <p>
                    Are you sure you want to delete{" "}
                    <b>{this.state.pins[this.state.idx].title}</b>?
                </p>
            );
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
                    <ListGroup {...props}>{children}</ListGroup>
                )}
                renderItem={({ value, index, props }) => (
                    <ListGroup.Item {...props}>
                        <Form.Control
                            type="title"
                            value={this.state.pins[index].title}
                            onChange={(e) => {
                                e.preventDefault();
                                var pins = this.state.pins;
                                pins[index].title = e.target.value;
                                this.setState({ pins: pins });
                            }}
                        />
                    </ListGroup.Item>
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

    add_pin() {
        const query = {
            title: "title",
            owner_id: this.client.auth.authInfo.userId,
            description: "",
            address: "",
            audio: "",
            photo: "",
            coords: [0.1, 0.1],
        };

        this.db
            .collection("PINS")
            .insertOne(query)
            .then((res) => {
                console.log("Add response: ", res);

                // Just for testing
                var pins = this.state.pins;
                pins.push(query);
                this.setState({ pins: pins });

                // Later should redirect to drop pin map view
            })
            .catch(console.error);
    }

    save_pins() {
        Promise.all(
            this.state.pins.map((pin) => {
                const query = { _id: pin._id };
                const update = {
                    $set: {
                        title: pin.title,
                    },
                };
                const options = { upsert: false };

                return this.db
                    .collection("PINS")
                    .updateOne(query, update, options);
            })
        )
            .then((res) => {
                console.log("Save pins response: ", res);
            })
            .catch(console.error);
    }

    save_module() {
        const id = this.props.match.params.id;
        const pin_ids = this.state.pins.map((pin) => {
            return pin._id;
        });
        console.log("Save module pin ids: ", pin_ids);
        const query = { _id: ObjectId(id) };
        const update = {
            $set: {
                pins: pin_ids,
            },
        };
        const options = { upsert: false };

        this.db
            .collection("MODULES")
            .updateOne(query, update, options)
            .then((res) => {
                console.log("Save module response: ", res);

                window.location.assign("#/modules/module/edit/" + id);
            })
            .catch(console.error);
    }

    render() {
        return (
            <div
                style={{
                    top: "10px",
                    position: "relative",
                    marginLeft: "auto",
                    marginRight: "auto",
                    height: "100%",
                    overflow: "hidden",
                    display: "flex",
                    justifyContent: "center",
                }}
                className="container"
            >
                <div
                    style={{
                        height: "100%",
                        overflow: "hidden",
                    }}
                >
                    <Form
                        style={{ height: "100%" }}
                        onSubmit={(event) => {
                            event.preventDefault();
                            this.save_pins();
                        }}
                    >
                        <div
                            style={{
                                maxHeight: "60%",
                                overflowY: "scroll",
                                overflowX: "hidden",
                            }}
                        >
                            {this.list_pins()}
                        </div>

                        <div style={{ marginTop: "10px" }}>
                            <Button
                                variant="primary"
                                size="lg"
                                block
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.add_pin();
                                }}
                            >
                                Drop Pins
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                block
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.save_pins();
                                    this.save_module();
                                }}
                            >
                                Save
                            </Button>
                        </div>
                    </Form>
                    <Modal
                        isOpen={this.state.modal}
                        toggle={(event) => {
                            event.preventDefault();
                            this.toggle();
                        }}
                        style={{
                            marginTop: "50px",
                        }}
                    >
                        <Modal.Header
                            toggle={(event) => {
                                event.preventDefault();
                                this.toggle();
                            }}
                        >
                            Confirm Deletion
                        </Modal.Header>
                        <Modal.Body>{this.modal_message()}</Modal.Body>
                        <Modal.Footer>
                            <Button
                                color="danger"
                                onClick={(event) => {
                                    event.preventDefault();
                                    if (this.state.idx > -1)
                                        this.delete_pin(this.state.idx);
                                    this.toggle();
                                }}
                            >
                                Delete
                            </Button>{" "}
                            <Button
                                color="secondary"
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.toggle();
                                }}
                            >
                                Cancel
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        );
    }
}
