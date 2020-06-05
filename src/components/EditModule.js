import React, { Component, } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import FormCheck from 'react-bootstrap/FormCheck'
import FormControl from 'react-bootstrap/FormControl'
import Alert from 'react-bootstrap/Alert'
import {Stitch, RemoteMongoClient} from "mongodb-stitch-browser-sdk"




export default class EditModule extends Component{

    constructor(props) {
        super(props)
        this.state = {
            selected: true
        }

        const appId = "capstonear_app-xkqng"
        this.client = Stitch.hasAppClient(appId)
            ? Stitch.getAppClient(appId)
            : Stitch.initializeDefaultAppClient(appId)
        const mongodb = this.client.getServiceClient(
            RemoteMongoClient.factory,
            "mongodb-atlas"
        )
        this.db = mongodb.db("APP")
    }

    render(){
        return(
            <Form style={{
                top: '40px',
                position: 'relative',
                textAlign: 'center',
            }}>
                <Form.Group>
                    <Form.Control type="title" id="title" placeholder="Module Title" 
                    style={{ textAlign: 'center', width: '300px', margin: '0 auto',}} />
                </Form.Group>
    
                <Form.Group>
                    <Form.Control as="textarea" rows="5" id="description" placeholder="Description"
                    style={{ textAlign: 'center', width: '300px', margin: '0 auto',}}/>
                </Form.Group>
                <fieldset>
                    <Form.Group as={Row}>
                        <Col sm={10}>
                            <Form.Check
                            type="radio"
                            label="Public"
                            name="formHorizontalRadios"
                            id="true"
                            checked={this.state.selected === true} onChange={(e) => this.setState({ selected: true })}
                            />
                            <Form.Check
                            type="radio"
                            label="Private"
                            name="formHorizontalRadios"
                            id="false"
                            checked={this.state.selected === false} onChange={(e) => this.setState({ selected: false })}
                            />
                        </Col>
                    </Form.Group>
                </fieldset>
    
                <Form.Group as={Row}>
                    <Col sm={{ span: 10, offset: 2 }}>  
                        <Button variant="primary">Add Pins</Button>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Col sm={{ span: 10, offset: 2 }}>
                        <Button className="btn btn-primary" onClick={(event) => {
                            event.preventDefault();
                            const title = document.getElementById("title").value || "";
                            const description = document.getElementById("description").value || "";
                            const radiotype = this.state.selected;
                            this.db.collection("MODULES")
                                .insertOne({
                                    title: title,
                                    owner_id: this.client.auth.authInfo.userId,
                                    owner_name: this.client.auth.authInfo.userProfile.name,
                                    owner_email: this.client.auth.authInfo.userProfile.email,
                                    description: description,
                                    pins: [],
                                    shared_array: [],
                                    public: radiotype,
                                })
                                .catch(console.error);
                                var save = window.confirm(
                                    'You have saved the module!'
                                );
                                this.props.history.goBack();
                        }}>
                            Save
                        </Button>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Col sm={{ span: 10, offset: 2 }}>   
                        <Button variant="primary">Share</Button>
                    </Col>
                </Form.Group>
            </Form>
        )
    }
}