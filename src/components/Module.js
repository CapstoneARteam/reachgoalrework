import React, { Component} from 'react'

import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import {Container} from 'react-bootstrap'
import 'leaflet/dist/leaflet.css'
import {Stitch,RemoteMongoClient,BSON} from "mongodb-stitch-browser-sdk"
import {AwsServiceClient, AwsRequest } from 'mongodb-stitch-browser-services-aws'
import {ObjectId} from 'mongodb'
//const BSON = require('bson');

export default class Module extends Component {
    constructor(props){
        super(props)
        this.state = {
            current_position:[],
            module_info: {
                name:'',
                owner_email: '',
                owner_id: '',
                owner_name: '',
                description: '',
            },
            base64img:''
        }

        this.getUserPosition = this.getUserPosition.bind(this)
        this.fetch_userinfo = this.fetch_userinfo.bind(this)
        this.handleFileSelect = this.handleFileSelect.bind(this)
        this.buildFileSelector = this.buildFileSelector.bind(this)
        this.handleUpload = this.handleUpload.bind(this)
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

    componentDidMount(){
        this.fileSelector = this.buildFileSelector();
        this.getUserPosition()
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

    getUserPosition(){
        navigator.geolocation.getCurrentPosition(position => {
          this.setState({ userLocation : [position.coords.latitude, position.coords.longitude], userLocationFound:true, currentLocation : [position.coords.latitude, position.coords.longitude]})
          
          console.log(this.state)
          
        })
    }

    renderMap(){
        const userLocation = this.state.userLocationFound ? (
            <Marker position={this.state.userLocation}>
              <Popup >Your location</Popup>
            </Marker>
          ) : null

        return (
        <div id='leaflet-container'>
        <Map center={this.state.currentLocation} zoom={13} maxZoom={18} >
            <TileLayer
            
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            />
            {userLocation}     
        </Map>
        </div>
        )   
    }


    fileToBase64 = (filename, filepath) => {
        return new Promise(resolve => {
          var file = new File([filename], filepath);
          var reader = new FileReader();
          // Read file content on file loaded event
          reader.onload = function(event) {
            resolve(event.target.result);
          };
          
          // Convert data to base64 
          reader.readAsDataURL(file);
        });
      };

    buildFileSelector(){
        const fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.setAttribute('multiple', 'multiple');
        fileSelector.onchange = this.handleFileChange;
        return fileSelector;
      }

    handleFileSelect = (e) => {
        e.preventDefault();
        this.fileSelector.click();
    }

    handleFileChange = (e) => {
        console.log(e.target.files)
       
        let fileReader = new FileReader();
        fileReader.readAsDataURL(e.target.files[0])
        fileReader.onloadend = (e) => {
            var base64data = fileReader.result;
            this.setState({
                base64img: base64data
            })
            console.log(this.state)
        }
        
       
    }

    handleUpload(){
    
        console.log(window.context)
        // Convert the base64 encoded image string to a BSON Binary object
       
        var basestring = this.state.base64img.replace(/^data:image\/\w+;base64,/, '');
        var fileBuffer = new Buffer(basestring, 'base64');
        const binaryImageData = new BSON.Binary(new Uint8Array(fileBuffer), 0)

        const aws = this.client.getServiceClient(AwsServiceClient.factory, "capstoneusercontent");
        // These are the arguments specifically for the s3 service PutObject function
        const args = {
            ACL: 'public-read',
            Bucket: "capstoneusercontent",
            ContentType: "image/png",
            Key: "b4.png",
            ContentEncoding: 'base64',
            Body: binaryImageData,
            // or Body could be a BSON object
        };

        const request = new AwsRequest.Builder()
        .withService("s3")
        .withAction("PutObject")
        .withRegion("us-west-2") // this is optional
        .withArgs(args); // depending on the service and action, this may be optional as well

        console.log(request)

        aws.execute(request.build())
        .then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        });
        
    }


    render(){
      
        return(
            <Container>
                title: 
                <br />
                {this.state.module_info.title}
                <br />
                <br />

                owner_email: 
                <br />
                {this.state.module_info.owner_email}
                <br />
                <br />

                owner_name: 
                <br />
                {this.state.module_info.owner_name}
                <br />
                <br />

                owner_id: 
                <br />
                {this.state.module_info.owner_id}
                <br />
                <br />

                description: 
                <br />
                {this.state.module_info.description}
                <br />
                <br />
              
                filelink:
                {this.state.imgUpload}

                <br />
                <br />
                <img style={{
                    height: '200px',
                    width : '300px'
                }} src={this.state.base64img}></img>
                <br />
                <br />

                <button className='btn btn-primary' onClick={this.handleFileSelect}
                >
                choose file
                </button>

                <button className='btn btn-primary' onClick={this.handleUpload}
                >
                upload
                </button>
              


                <button className='btn btn-primary' 
                        onClick={() =>
                            window.location.assign(
                                "#/module/" + this.state.module_info._id+"/pins"
                        )}
                        >start module</button>
            </Container>
        )
    }
}