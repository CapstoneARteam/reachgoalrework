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
            user: {
                _id: '',
                user_id: '',
                accessed_links: [],
            },
        }

        this.getUserPosition = this.getUserPosition.bind(this)
        this.fetch_userinfo = this.fetch_userinfo.bind(this)
        this.update_user = this.update_user.bind(this);

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

        const query = {
            user_id: this.client.auth.authInfo.userId,
        };
        await this.db
            .collection("USERS")
            .findOne(query)
            .then((res) => {
                console.log("User: ", res);

                this.setState({ user: res });
            })
            .catch(console.error);

        this.update_user();
    }

    getUserPosition(){
        navigator.geolocation.getCurrentPosition(position => {
          this.setState({ userLocation : [position.coords.latitude, position.coords.longitude], userLocationFound:true, currentLocation : [position.coords.latitude, position.coords.longitude]})
          
          console.log(this.state)
          
        })
    }

    update_user() {
        if(
            this.client.auth.authInfo.userId != this.state.module_info.owner_id && this.state.module_info.public == true && !this.state.module_info.shared_with.includes(this.client.auth.authInfo.userProfile.email)){
            const query = {
                _id: this.state.user._id,
                user_id: this.client.auth.authInfo.userId,
            };
            const update = { $addToSet: { accessed_links: ObjectId(this.state.module_info._id) } };
    
            this.db
                .collection("USERS")
                .findOneAndUpdate(query, update)
                .then((res) => {
                    console.log("Update response: ", res);
                })
                .catch(console.error);
        }
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