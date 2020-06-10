import React, { Component} from 'react'

import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import {Container} from 'react-bootstrap'
import 'leaflet/dist/leaflet.css'
import {Stitch,RemoteMongoClient } from "mongodb-stitch-browser-sdk"
import {ObjectId} from 'mongodb'

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
        }

        this.getUserPosition = this.getUserPosition.bind(this)
        this.fetch_userinfo = this.fetch_userinfo.bind(this)

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
              


                <button className='btn btn-primary'>start module</button>
            </Container>
        )
    }
}