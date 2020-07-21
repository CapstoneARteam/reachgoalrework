import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";

export default class ManageModules extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modules: [],
            modal: false,
            idx: -1,
        };

        this.fetch_userinfo = this.fetch_userinfo.bind(this);

        this.toggle = this.toggle.bind(this);
        this.modal_message = this.modal_message.bind(this);
        this.list_modules = this.list_modules.bind(this);
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

        this.fetch_userinfo();
    }

    async fetch_userinfo() {
        const query = {
            owner_id: this.client.auth.authInfo.userId,
        };
        await this.db
            .collection("MODULES")
            .find(query)
            .toArray()
            .then((res) => {
                console.log("Modules loaded: ", res);

                this.setState({ modules: res });
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
                    <b>{this.state.modules[this.state.idx].title}</b>?
                </p>
            );
    }

    list_modules() {
        return this.state.modules.map((module, idx) => {
            return (
                <div key={idx} className="pt-1">
                    <div className="row">
                        <div className="col-6 offset-sm-2 col-sm-4">
                            <input
                                type="text"
                                value={this.state.modules[idx].title}
                                onChange={(event) => {
                                    event.preventDefault();

                                    var modules = [...this.state.modules];
                                    modules[idx].title = event.target.value;
                                    this.setState({ modules });
                                }}
                            />
                        </div>
                        <div className="col-6 col-sm-4">
                            <button
                                className="btn btn-link float-right"
                                onClick={(event) => {
                                    event.preventDefault();
                                    var id = this.state.modules[idx]._id;
                                    window.location.assign(
                                        "#/module/" + id + "/edit"
                                    );
                                }}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btn-danger float-right"
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.setState({ idx: idx });
                                    this.toggle();
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            );
        });
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
                this.setState({ modules: modules, idx: -1 });
            })
            .catch(console.error);
    }

    add_module() {
        const query = {
            title: "title",
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

                // Navigate to Edit Module view
                var id = res.insertedId;
                window.location.assign("#/module/" + id + "/edit");
            })
            .catch(console.error);
    }

    save_modules() {
        Promise.all(
            this.state.modules.map((module) => {
                const query = { _id: module._id };
                const update = {
                    $set: {
                        title: module.title,
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
            <div className="container">
                <form
                    style={{ height: "100%" }}
                    onSubmit={(event) => {
                        event.preventDefault();
                        this.save_modules();
                    }}
                >
                    <div
                        style={{
                            maxHeight: "70vh",
                            overflowY: "scroll",
                            overflowX: "hidden"
                        }}
                    >
                        {this.list_modules()}
                    </div>

                    <div style={{ marginTop: "10px" }}>
                        <button
                            className="btn btn-primary btn-lg btn-block"
                            onClick={(event) => {
                                event.preventDefault();
                                this.add_module();
                            }}
                        >
                            Add Module
                        </button>
                        <button
                            className="btn btn-secondary btn-lg btn-block"
                            onClick={(event) => {
                                event.preventDefault();
                                this.save_modules();
                                window.location.assign("#/");
                            }}
                        >
                            Save
                        </button>
                    </div>
                </form>
                <Modal
                    show={this.state.modal}
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
                        <button
                            className="btn btn-danger"
                            onClick={(event) => {
                                event.preventDefault();
                                if (this.state.idx > -1)
                                    this.delete_module(this.state.idx);
                                this.toggle();
                            }}
                        >
                            Delete
                        </button>{" "}
                        <button
                            className="btn btn-secondary"
                            onClick={(event) => {
                                event.preventDefault();
                                this.toggle();
                            }}
                        >
                            Cancel
                        </button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
