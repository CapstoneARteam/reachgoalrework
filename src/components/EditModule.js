import React, { Component, } from 'react'
import { Row, Col, Form, Button } from 'react-bootstrap'
import {Stitch, RemoteMongoClient} from "mongodb-stitch-browser-sdk" 
import {ObjectId} from 'mongodb'

export default class EditModule extends Component{

    constructor(props) {
        super(props)
        this.state = {
            modules: [],
            selected: false,
            module_info: {
                title:'',
                owner_email: '',
                owner_id: '',
                owner_name: '',
                description: '',
                pins: [],
                shared_array: [],
                public: false,
            },
        }

        this.fetch_userinfo = this.fetch_userinfo.bind(this)
        this.save_module = this.save_module.bind(this);

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

    componentDidMount(){
        
        this.fetch_userinfo()
        const appId = "capstonear_app-xkqng"
        if (Stitch.hasAppClient(appId)) {
            this.client = Stitch.getAppClient(appId)
            const mongodb = this.client.getServiceClient(
                RemoteMongoClient.factory,
                "mongodb-atlas"
              );
              //select the db in our mongdb atlas cluster
              this.db = mongodb.db("APP");
            console.log("client")
        }
        else{
            this.client = Stitch.initializeAppClient(appId)
            console.log("client init")
        }
    }

    async fetch_userinfo(){
        await this.db.collection("MODULES").find({
            _id: ObjectId(this.props.match.params.id)
        })
        .asArray()
        .then((module_info) => {
            if(module_info === undefined || module_info.length === 0)
            {
                console.log(module_info)
                return
            }
            this.setState({module_info: module_info[0]}
            )
          console.log(module_info)
        }
        )
        .catch((err) => {this.setState({error: err})
         console.log(err)
        }
        )
       
    }

    save_module() {
        const title = document.getElementById("title").value || "";
        const description = document.getElementById("description").value || "";
        const radiotype = this.state.selected;
        const query = { _id: this.state.module_info._id };
        const update = {
            $set: {
                title: title,
                description: description,
                //pins: [],
                //shared_array: [],
                public: radiotype,
            },
        };
        const options = { upsert: false };

        this.db.collection("MODULES").updateOne(query, update, options)
        .then((res) => {
            console.log("Save response: ", res);
        })
        .catch(console.error);
    }

    render(){
        return(
            <Form style={{
                top: '40px',
                position: 'relative',
                textAlign: 'center',
            }}>
                <Form.Group>
                    <Form.Control type="title" id="title" defaultValue={this.state.module_info.title} 
                    style={{ textAlign: 'center', width: '300px', margin: '0 auto',}} />
                </Form.Group>
    
                <Form.Group>
                    <Form.Control as="textarea" rows="5" id="description" defaultValue={this.state.module_info.description}
                    style={{ textAlign: 'center', width: '300px', margin: '0 auto',}}/>
                </Form.Group>
                <fieldset>
                    <Form.Group as={Row}>
                        <Form.Label as="legend" column sm={2}>
                        </Form.Label>
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
                            this.save_module();
                            window.location.assign('#/modules/edit/');
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