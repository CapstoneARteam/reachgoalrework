import React, { Component, } from 'react'
import {Card, Tab, Tabs, CardDeck, Form, Button} from 'react-bootstrap'
import {Stitch,RemoteMongoClient,  } from "mongodb-stitch-browser-sdk"
//import {AwsServiceClient, AwsRequest} from 'mongodb-stitch-browser-services-aws'

export default class ViewModules extends Component{

    constructor(props){
        super(props)
        this.state ={
            //modules : [{name:'OMSI'},{name:'PSU'},{name:'DOWNTOWN'}, {name:'DOWNTOWN2'},{name:'OMSI'},{name:'PSU'},{name:'DOWNTOWN'}, {name:'DOWNTOWN2'},{name:'OMSI'},{name:'PSU'},{name:'DOWNTOWN'}, {name:'DOWNTOWN2'},],
            modules: [],
            my_modules: [],
            shared_modules:[],
            img1:'',
            stitch_res:[],
        
        }

        //refs
        this.goto_module_id = React.createRef()

        this.add_module_cards = this.add_module_cards.bind(this)
        this.fetch_modules = this.fetch_modules.bind(this)
        this.goto_module = this.goto_module.bind(this)
        
        const appId = "capstonear_app-xkqng"
        if (Stitch.hasAppClient(appId)) {
            this.client = Stitch.getAppClient(appId)
            const mongodb = this.client.getServiceClient(
                RemoteMongoClient.factory,
                "mongodb-atlas"
              );
              //select the db in our mongdb atlas cluster
              this.db = mongodb.db("APP");
        }
        else{
            this.client = Stitch.initializeAppClient(appId)
            //console.log("client init")
        }
        
        
    }

    componentDidMount(){
        this.fetch_modules()

        console.log(this.state)
    }

    async fetch_modules(){
        await this.db.collection("MODULES").find({
           owner_id: this.client.auth.authInfo.userId
        })
        .asArray()
        .then((my_modules) => {
            this.setState({
                my_modules : my_modules,
                modules: {
                    0: my_modules,
                    1: this.state.shared_modules
                }
            })


            console.log(this.state.my_modules)
        }
        )


        //fetch shared modules
        await this.db.collection("MODULES").find({
           shared_with : this.client.auth.authInfo.userProfile.data.email
        })
        .asArray()
        .then((shared_modules) => {this.setState({
            shared_modules : shared_modules,
            modules: {
                0: this.state.my_modules,
                1: shared_modules
            }
        })
            console.log(shared_modules)
        }
        )
        console.log(this.state.modules)




        
    }

  

    goto_module(id){
        window.location.assign('#/module/' + id)
    }

    add_module_cards(type){
        
        if(this.state.modules.length === 0)
            return

        const mds= this.state.modules[type].map(function(module,idx) {
            return (
                <div className="col-md-6 col-lg-4 " key={idx}>
                    <Card style={{
                        display: 'block',
                        Height: '20rem',
                        Width: '25rem',
                        margin: '0.25rem',
                    }} >
                        <Card.Body>
                            <Card.Img variant="top" src="https://capstoneusercontent.s3.amazonaws.com/ar.png" />
                            <Card.Title>{module.name}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">by {module.owner_name} ({module.owner_email})</Card.Subtitle>
                            <Card.Text>
                                {module.description}
                            </Card.Text>
                            <div className='btn-toolbar' style={{
                                
                            }}>
                                <div className='btn-group mr-2'>
                                    <button className="btn btn-primary" onClick={()=> window.location.assign('#/module/' + module._id)}>View Details</button>
                                </div>
                                <div className='btn-group mr-2'>
                                    <button className="btn btn-primary">Start Module</button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )
        })
        return (
            <div style={{
                top: '50px',
                bottom: '0px',
                position: 'relative',
            }}
                className="container"
            >
                <CardDeck style={{
                    top: '50px',
                }}>
                    {mds}
                </CardDeck>
            </div>
        )
    }

    render(){

        
        return(
            <div style={{
                position:'absolute',
                top: '0px',
                bottom:'0px',
                width: '100%',
                overflowY: 'scroll'
            }}>
            <div style={{
                top:'10px',
                position:'relative',
                marginLeft: 'auto',
                marginRight: 'auto',
                
            }
            }>

                <Tabs defaultActiveKey="My Modules" transition={false} style={{
                    textAlign:'center',
                    justifyContent:'center',
                }}>
                    <Tab eventKey="My Modules" title="My Modules">
                        {this.add_module_cards(0)}
                    </Tab>

                    <Tab eventKey="Shared Modules" title="Shared with me">
                        {this.add_module_cards(1)}
                    </Tab>

                    
                    <Tab eventKey="Go To" title="Go To">
                        <Form >
                            <Form.Group controlId="formModuleId">
                                <Form.Label>Module ID:</Form.Label>
                                <Form.Control required type="string" placeholder="Enter module id" ref={this.goto_module_id} />
                            </Form.Group>

                            <Button variant="primary" onClick={ ()=>{
                                window.location.assign('#/module/' + this.goto_module_id.current.value)
                            }
                            } >
                                View Module
                            </Button>
                        </Form>

                    </Tab>

                </Tabs>
            </div>
            </div>
        )
    }

}