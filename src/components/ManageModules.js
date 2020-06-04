import React, { Component } from "react";
import { useHistory } from "react-router-dom";
import { Form, FormGroup, Input, Row, Col, Button } from "reactstrap";
import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";

export default class ManageModules extends Component {
    constructor(props) {
        super(props);
        this.state = { modules: [] };

        this.list_modules = this.list_modules.bind(this);
        this.load_modules = this.load_modules.bind(this);
        this.delete_module = this.delete_module.bind(this);
        this.add_module = this.add_module.bind(this);
        this.save_modules = this.save_modules.bind(this);

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

        this.load_modules();
    }

    list_modules() {
        return this.state.modules.map((module, idx) => {
            return (
                <div key={idx}>
                    <Row form>
                        <Col sm={{ size: 4, offset: 3 }}>
                            <FormGroup>
                                <Input
                                    type="text"
                                    value={this.state.modules[idx].name}
                                    onChange={(event) => {
                                        event.preventDefault();

                                        var modules = [...this.state.modules];
                                        modules[idx].name = event.target.value;
                                        this.setState({ modules });
                                    }}
                                />
                            </FormGroup>
                        </Col>
                        <Col sm={{ size: 1 }}>
                            <Button>Edit</Button>
                        </Col>
                        <Col sm={{ size: 1 }}>
                            <Button
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.delete_module(idx);
                                }}
                            >
                                Delete
                            </Button>
                        </Col>
                    </Row>
                </div>
            );
        });
    }

    load_modules() {
        this.db
            .collection("MODULES")
            .find()
            .toArray()
            .then((res) => {
                console.log("Load response: ", res);

                this.setState({ modules: res });
            })
            .catch(console.error);
    }

    delete_module(idx) {
        const query = { _id: this.state.modules[idx]._id };
        this.db
            .collection("MODULES")
            .deleteOne(query)
            .then((res) => {
                console.log("Delete response: ", res);

                // Update module list
                var modules = [...this.state.modules];
                modules.splice(idx, 1);
                this.setState({ modules });
            })
            .catch(console.error);
    }

    add_module() {
        const query = {
            name: "name",
            owner_id: this.client.auth.authInfo.userId,
            owner_name: this.client.auth.authInfo.userProfile.name,
            owner_email: this.client.auth.authInfo.userProfile.email,
            description: "",
            pins: [],
            shared_with: [],
            public: false,
        };

        this.db
            .collection("MODULES")
            .insertOne(query)
            .then((res) => {
                console.log("Add response: ", res);

                // Update module list
                var modules = [...this.state.modules];
                modules.push(query);
                this.setState({ modules });
            })
            .catch(console.error);
    }

    save_modules() {
        Promise.all(
            this.state.modules.map((module) => {
                const query = { _id: module._id };
                const update = {
                    $set: {
                        name: module.name,
                    },
                };
                const options = { upsert: false };

                return this.db
                    .collection("MODULES")
                    .updateOne(query, update, options);
            })
        )
            .then((res) => {
                console.log("Save response: ", res);
            })
            .catch(console.error);
    }

    render() {
        return (
            <div
                style={{
                    top: "50px",
                    bottom: "0px",
                    position: "relative",
                }}
                className="container"
            >
                <Form
                    onSubmit={(event) => {
                        event.preventDefault();
                        this.save_modules();
                    }}
                >
                    {this.list_modules()}
                    <Row>
                        <Col sm={{ size: "auto", offset: 3 }}>
                            <Button
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.add_module();
                                    //this.props.history.push(#/editmodule)
                                }}
                            >
                                Add Module
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={{ size: "auto", offset: 3 }}>
                            <Button
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.save_modules();
                                    this.props.history.goBack();
                                }}
                            >
                                Save
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        );
    }
}
