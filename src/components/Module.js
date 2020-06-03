import React, { Component, createRef } from 'react'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import {Container} from 'react-bootstrap'
import 'leaflet/dist/leaflet.css'
import {Stitch,RemoteMongoClient,  } from "mongodb-stitch-browser-sdk"

export default class Module extends Component {
    constructor(){
        super()
        this.state = {
            current_position:[]
        }

        this.getUserPosition = this.getUserPosition.bind(this)
    }

    componentDidMount(){
        this.getUserPosition()
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
                info of the module
            </Container>
        )
    }
}