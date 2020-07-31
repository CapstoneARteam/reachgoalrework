import React, {Component} from 'react'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {Stitch, RemoteMongoClient, GoogleRedirectCredential} from "mongodb-stitch-browser-sdk"
import { ObjectId } from 'mongodb'



delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const Style = {
  position: "fixed",
  width: "60px",
  height: "60px",
  bottom: "40px",
  right: "40px",
  backgroundColor: "#0C9",
  color: "#FFF",
  textAlign: "center",
  boxShadow: "2px 2px 3px #999",
  zIndex: 1500
}
var greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

var myIcon = new L.divIcon({
  className: 'my-div-icon',
  html: '<img class="my-div-image" src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"/>'
})

const floatStyle = {
  position: "fixed",
  width: "60px",
  height: "60px",
  bottom: "40px",
  right: "40px",
  backgroundColor: "#0C9",
  color: "#FFF",
  borderRadius: "50px",
  textAlign: "center",
  boxShadow: "2px 2px 3px #999",
  zIndex: 1500,
};

class MapView extends Component{
  constructor(props){
    super(props)

    this.state ={
      currentLocation: {lat: 45.51, lng:-122.68},
      zoom: 13,
      userLocation:[],
      userLocationFound: false,
      modules: [],
      pin_array: [],
    }

  this.drawpins = this.drawpins.bind(this)
  this.getUserPosition = this.getUserPosition.bind(this)

  const appId = "capstonear_app-xkqng"
  this.client = Stitch.hasAppClient(appId)
  ? Stitch.getAppClient(appId)
  : Stitch.initializeDefaultAppClient(appId)
  const mongodb = this.client.getServiceClient(
  RemoteMongoClient.factory,
  "mongodb-atlas"
  );
  this.db = mongodb.db("APP"); 
  }
  

  getUserPosition(){
    navigator.geolocation.getCurrentPosition(position => {
      this.setState({ userLocation : [position.coords.latitude, position.coords.longitude], userLocationFound:true, currentLocation : [position.coords.latitude, position.coords.longitude]})
      
      console.log(this.state)
      
    })
  
  }

  componentDidMount(){
    this.getUserPosition()
    this.drawpins()
    
  }

  async drawpins() {
    if(!this.client.auth.isLoggedIn){
      return
    }
    await this.db.collection("MODULES")
      .find({
        owner_id: { $ne: this.client.auth.authInfo.userId},
        shared_with: { $ne: this.client.auth.authInfo.userProfile.data.email},
        public: true,
        pins: { $ne: []},
      },
      {
        pins: { $slice: [0, 1]}
      })
      .asArray()
      .then((res) => {
        this.setState({modules: res})
        console.log("Modules: ", res);
      })
  }

  render(){
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
        {this.state.pin_array.map((info,idx) => {
            return <Marker 
              key = {idx} position={info.pins[0].coords} 
              icon= {new L.divIcon({
                className: 'my-div-icon',
                html: '<img class="my-div-image" src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"/>' 
                + '<span style={Style} class="my-div-span">'+(idx+1)+'</span>'
              })} >
              <Popup>
              </Popup>
            </Marker>
          })}  
      </Map>
      </div>
    );
    }
}

export default MapView;