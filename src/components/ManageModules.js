import React, { Component } from 'react'
import {  Form, FormGroup, Input, Row, Col, Button} from 'reactstrap';
import {Stitch, RemoteMongoClient} from "mongodb-stitch-browser-sdk"

export default class ManageModules extends Component {
    constructor(props) {
        super(props)
        this.state = {modules: []}

        this.list_modules = this.list_modules.bind(this)
        this.add_module = this.add_module.bind(this)
        this.save_modules = this.save_modules.bind(this)
        this.load_modules = this.load_modules.bind(this)

        // Setting up DB with Stitch
        const appId = "capstonear_app-xkqng"
        const client = Stitch.hasAppClient(appId)
        ? Stitch.getAppClient(appId)
        : Stitch.initializeDefaultAppClient(appId)
        const mongodb = client.getServiceClient(
          RemoteMongoClient.factory,
          "mongodb-atlas"
        )
        this.db = mongodb.db("APP")

        this.load_modules()
    }

    load_modules() {
        this.db.collection("MODULES").find()
        .toArray()
        .then(modules => {
            this.setState({modules: modules})
            console.log("Modules: ", modules)
        })
    }

    list_modules() {
        const update_module = (event, idx) => {
            event.preventDefault()
            this.state.modules[idx].name = event.target.value
        }

        const mds= this.state.modules.map((module,idx) => {  
            return (
                <div key={idx}>
                    <Row form>
                        <Col  sm={{ size: 4, offset: 3 }}>
                            <FormGroup>
                                <Input type="text" defaultValue={module.name} onChange={(event) => {
                                    update_module(event, idx)
                                }}/>
                            </FormGroup>
                        </Col>
                        <Col>
                            <Button>Edit</Button>
                        </Col>
                    </Row>
                </div>
            )
        })
        return mds
    }

    add_module() {

    }

    save_modules() {
        this.state.modules.map((module, idx) => {
            const query = {"_id": module._id}
            const update = {"$set": {
                    "name": module.name
                }
            };
            const options = { "upsert": false };


            console.log(module)
            
            this.db.collection("MODULES").updateOne(query, update, options).then()
            return null
        })

    }

    render(){
        return (
            <div style={{
                top: '50px',
                bottom: '0px',
                position: 'relative',
            }}
                className="container"
            >
                <Form onSubmit={this.save_modules()}>
                    {this.list_modules()}
                    <Row>
                        <Col sm={{size: 'auto', offset: 3}}>
                            <Button onClick={this.save_modules}>Add Module</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={{size: 'auto', offset: 3}}>
                            <Button onClick={this.save_modules}>Save</Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        );
    }
}