import React, { Component } from "react";
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Tabs,
    Tab,
    Modal,
    FormControl,
    FormGroup,
} from "react-bootstrap";
import { List, arrayMove } from "react-movable";
import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";
import { ObjectId } from "mongodb";
import "./EditModule.css";

import { EditForm } from "./DropPin";

// @classdesc Used to make the Edit Module view.
export default class EditModule extends Component {
    // Creates a new EditModule
    // @param {Object} props
    // @class
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
                shared_with: [],
                public: false,
            },
            email: "",
            shared_with: [],
            pins: [],
            idx: -1,
            ind: -1,
            modal: null,
            modal2: null,
            copied: false,
            link: "",
        };

        this.fetch_userinfo = this.fetch_userinfo.bind(this);

        this.show_modal = this.show_modal.bind(this);
        this.show_modal2 = this.show_modal2.bind(this);
        this.hide_modal = this.hide_modal.bind(this);
        this.hide_modal2 = this.hide_modal2.bind(this);
        this.delete_pin_modal = this.delete_pin_modal.bind(this);
        this.share_modal = this.share_modal.bind(this);
        this.list_shared = this.list_shared.bind(this);
        this.add_email = this.add_email.bind(this);
        this.delete_email = this.delete_email.bind(this);
        this.delete_email_modal = this.delete_email_modal.bind(this);
        this.copy_clipboard = this.copy_clipboard.bind(this);

        this.save_pin = this.save_pin.bind(this);
        this.delete_pin = this.delete_pin.bind(this);
        this.list_pins = this.list_pins.bind(this);
        this.module_form = this.module_form.bind(this);
        this.save_pin_order = this.save_pin_order.bind(this);
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

        this.fetch_userinfo();
    }

    // Gets the module ID from the routing parameter and uses it to get the
    // associated module and pins for that module.
    // @return {Promise} Query to set state.module_info and state.pins
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

    // copies textarea to clipboard and sets copy state
    copy_clipboard() {
        const e = this.textArea;
        e.select();
        document.execCommand("copy");
        this.setState({ copy: true });
    }

    // Sets state.modal to true
    show_modal(id) {
        this.setState({ modal: id });
    }

    // Sets state.modal2 to true
    show_modal2(id) {
        this.setState({ modal2: id });
    }

    // Sets state.modal to false
    hide_modal() {
        this.setState({ modal: null });
    }

    // Sets state.modal2 to false
    hide_modal2() {
        this.setState({ modal2: null });
    }

    // @return {JSX.Element} Modal to confirm deletion
    delete_pin_modal() {
        var modal_message;
        if (this.state.idx < 0) modal_message = <p>Nothing to delete</p>;
        else
            modal_message = (
                <p>
                    Are you sure you want to delete{" "}
                    <b>{this.state.pins[this.state.idx].title}</b>?
                </p>
            );

        return (
            <Modal
                // size="sm"
                show={this.state.modal === "delete"}
                onHide={(e) => {
                    this.hide_modal();
                }}
                style={{
                    marginTop: "50px",
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modal_message}</Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="danger"
                        onClick={(e) => {
                            e.preventDefault();
                            if (this.state.idx > -1)
                                this.delete_pin(this.state.idx);
                            this.hide_modal();
                        }}
                    >
                        Delete
                    </Button>{" "}
                    <Button
                        variant="secondary"
                        onClick={(e) => {
                            e.preventDefault();
                            this.hide_modal();
                        }}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    // @return {JSX.Element} Modal to confirm deletion of email
    delete_email_modal() {
        var modal_message;
        if (this.state.ind < 0) modal_message = <p>Nothing to delete</p>;
        else
            modal_message = (
                <p>
                    Are you sure you want to delete{" "}
                    <b>{this.state.module_info.shared_with[this.state.ind]}</b>?
                </p>
            );

        return (
            <Modal
                // size="sm"
                show={this.state.modal2 === "delete_email"}
                onHide={(e) => {
                    this.hide_modal2();
                }}
                style={{
                    marginTop: "50px",
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modal_message}</Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="danger"
                        onClick={(e) => {
                            if (this.state.ind > -1)
                                this.delete_email(this.state.ind);
                            this.hide_modal2();
                        }}
                    >
                        Delete
                    </Button>{" "}
                    <Button
                        variant="secondary"
                        onClick={(e) => {
                            e.preventDefault();
                            this.hide_modal2();
                        }}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    // This function adds a email to MODULES.shared_with and avoids duplicates
    add_email() {
        const query = { _id: this.state.module_info._id };
        const update = {
            $addToSet: { shared_with: this.state.email },
        };
        const options = { upsert: false, returnNewDocument: true };

        this.db
            .collection("MODULES")
            .findOneAndUpdate(query, update, options)
            .then((res) => {
                var shared_with = res.shared_with;
                this.setState({ shared_with: shared_with });
                this.setState({ module_info: res });
                console.log("Save response: ", res);
            })
            .catch(console.error);
    }

    // This function will remove a email from MODULES.shared_with
    // @param {number} ind - The index of the email to delete
    delete_email(ind) {
        const query = { _id: this.state.module_info._id };
        const update = {
            $pull: { shared_with: this.state.shared_with[ind] },
        };
        const options = { multi: false, returnNewDocument: true };

        this.db
            .collection("MODULES")
            .findOneAndUpdate(query, update, options)
            .then((res) => {
                var shared_with = res.shared_with;
                this.setState({ shared_with: shared_with, ind: -1 });
                this.setState({ module_info: res });
                console.log("Save response: ", res);
            })
            .catch(console.error);
    }

    // Creates the list of emails in MODULES.shared_with
    // @return {JSX.Element} The list of emails.
    list_shared() {
        return this.state.module_info.shared_with.map((module_info, ind) => {
            return (
                <div key={ind}>
                    <Row form>
                        <Col xs="8">
                            <FormGroup>
                                <FormControl
                                    plaintext
                                    readOnly
                                    type="text"
                                    value={
                                        this.state.module_info.shared_with[ind]
                                    }
                                />
                            </FormGroup>
                        </Col>
                        <Col>
                            <Button
                                variant="danger"
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.setState({ ind: ind });
                                    this.show_modal2("delete_email");
                                }}
                            >
                                Delete
                            </Button>
                        </Col>
                    </Row>
                    {this.delete_email_modal()}
                </div>
            );
        });
    }

    // Modal to display MODULE.shared_with emails to allow adding and deleting
    share_modal() {
        return (
            <Modal
                sz="lg"
                show={this.state.modal === "share"}
                onHide={(event) => {
                    this.hide_modal();
                }}
                style={{
                    maxHeight: "100vh",
                    marginTop: "50px",
                }}
            >
                <Modal.Header closeButton>Shared With</Modal.Header>
                <Modal.Body>
                    <div
                        style={{
                            maxHeight: "calc(100vh - 450px)",
                            overflowY: "auto",
                            overflowX: "hidden",
                        }}
                    >
                        {this.list_shared()}
                    </div>
                </Modal.Body>
                <Modal.Footer
                    style={{
                        maxHeight: "calc(100vh - 450px)",
                        overflowY: "auto",
                        overflowX: "hidden",
                    }}
                >
                    <Form
                        style={{
                            position: "relative",
                            margin: "auto",
                        }}
                    >
                        <Form.Group>
                            <FormControl
                                id="email"
                                type="email"
                                value={this.state.email}
                                onChange={(e) => {
                                    var email = this.state.email;
                                    email = e.target.value;
                                    this.setState({ email: email });
                                }}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Button
                                variant="primary"
                                size="lg"
                                block
                                onClick={(event) => {
                                    event.preventDefault();
                                    if (this.state.email !== "")
                                        this.add_email();
                                }}
                            >
                                Add
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                block
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.hide_modal();
                                }}
                            >
                                Save
                            </Button>
                            <Form.Group
                                style={{
                                    marginTop: "15px",
                                }}
                            >
                                <textarea
                                    ref={(textarea) =>
                                        (this.textArea = textarea)
                                    }
                                    plaintext
                                    readOnly
                                    value={this.state.link}
                                    placeholder="Sharing This Module Requires They Be Set To Public!"
                                    style={{
                                        width: "100%",
                                        height: "80px",
                                    }}
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    block
                                    onClick={(event) => {
                                        event.preventDefault();
                                        this.setState({
                                            link:
                                                window.location.origin +
                                                "/ar-app/#/module/" +
                                                this.state.module_info._id,
                                        });
                                        this.copy_clipboard();
                                    }}
                                >
                                    Copy Link
                                </Button>
                                {this.state.copy ? (
                                    <div style={{ color: "green" }}>
                                        Copied to clipboard!
                                    </div>
                                ) : null}
                            </Form.Group>
                        </Form.Group>
                    </Form>
                </Modal.Footer>
            </Modal>
        );
    }

    // @return {JSX.Element} Form to fill out module title, description, and
    // public/private status
    module_form() {
        return (
            <Form>
                <Form.Group>
                    <Form.Label>Title</Form.Label>
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
                    <Form.Label>Description</Form.Label>
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

    // Creates the list of pins based on state.pins. Uses the react-movable
    // library to make the list of pins draggable.
    // @return {JSX.Element} The list of pins.
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
                renderItem={({ index, props }) => (
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
                                        this.setState({ idx: index });
                                        this.show_modal("edit_pin_" + index);
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
                                        this.setState({ idx: index });
                                        this.show_modal("delete");
                                    }}
                                >
                                    Delete
                                </Button>
                            </Col>
                        </Row>

                        <EditForm
                            pin={this.state.pins[index]}
                            show={this.state.modal === "edit_pin_" + index}
                            save={(pin) => {
                                this.save_pin(pin);
                            }}
                            cancel={() => this.hide_modal()}
                        />
                    </li>
                )}
            />
        );
    }

    save_pin(pin) {
        const query = { _id: pin._id };
        const update = {
            $set: pin,
        };
        // update a pin on the database
        this.db
            .collection("PINS")
            .findOneAndUpdate(query, update)
            .then((res) => {
                console.log("Pin update response: ", res);

                // Update pin list
                var pins = this.state.pins;
                pins[this.state.idx] = pin;
                this.setState({ pins: pins });
                this.hide_modal();
            });
    }

    // This function will remove a pin from the DB and state.pins
    // @param {number} idx - The index of the pin to delete
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

    // Converts state.pins to a list of ObjectIDs, then updates
    // state.module_info.pins based on the new list
    save_pin_order() {
        var module = this.state.module_info;
        const pin_ids = this.state.pins.map((pin) => {
            return pin._id;
        });
        module.pins = pin_ids;
        this.setState({ module_info: module });
    }

    // Saves the module to the DB
    save_module() {
        this.save_pin_order();
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

    // @return {JSX.Element} The EditModule componenet
    render() {
        return (
            <Container
                style={{
                    marginTop: "10px",
                    maxWidth: "540px",
                    height:"100vh",

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
                                <Form.Group>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    block
                                    onClick={(e) => {
                                        e.preventDefault();
                                        var id = this.state.module_info._id;
                                        window.location.assign(
                                            "#/module/" + id + "/pins/edit"
                                        );
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
                                var id = this.state.module_info._id;
                                window.location.assign(
                                    "#/module/" + id + "/pins/edit"
                                );
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
                        <Button
                            variant="primary"
                            size="lg"
                            block
                            onClick={(e) => {
                                e.preventDefault();
                                this.show_modal("share");
                            }}
                        >
                            Share
                        </Button>
                    </Form.Group>

                </Form>
                {this.delete_pin_modal()}
                {this.share_modal()}
            </Container>
        );
    }
}
