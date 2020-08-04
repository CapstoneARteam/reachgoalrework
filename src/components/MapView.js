import React, {Component} from 'react'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {Stitch, RemoteMongoClient, GoogleRedirectCredential} from "mongodb-stitch-browser-sdk"
import { ObjectId } from 'mongodb'
import { map } from 'jquery'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStreetView } from '@fortawesome/free-solid-svg-icons'


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
      pins: [],
    }

  this.getpins = this.getpins.bind(this)
  this.getUserPosition = this.getUserPosition.bind(this)
  this.getDistance = this.getDistance.bind(this)
  this.toRadian = this.toRadian.bind(this)
  this.centerMap = this.centerMap.bind(this)

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
    this.getpins()
    
  }

  //find distance between two points in meters. Returns true for less than meters or false if not
  getDistance(origin, destination) {
    var lon1 = this.toRadian(origin[1]);
    var lat1 = this.toRadian(origin[0]);
    var lon2 = this.toRadian(destination[1]);
    var lat2 = this.toRadian(destination[0]);

    var deltaLat = lat2 - lat1;
    var deltaLon = lon2 - lon1;

    var a = Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon/2), 2);
    var c = 2 * Math.asin(Math.sqrt(a));
    var EARTH_RADIUS = 6371;
    var d = c * EARTH_RADIUS * 1000;

    // 24000 meters ~ 15 miles
    if(d < 24000)
      return true;
    else
      return false;
  }

  toRadian(degree) {
    return degree*Math.PI/180;
  }

  async getpins() {
    if(!this.client.auth.isLoggedIn){
      return
    }
    await this.db.collection("MODULES")
      .find({
        owner_id: { $ne: this.client.auth.authInfo.userId},
        shared_with: { $ne: this.client.auth.authInfo.userProfile.data.email},
        public: true,
        pins: { $ne: []},
      })
      .asArray()
      .then((res) => {
        this.setState({modules: res})
        res = res.map(curr => {
          curr = curr.pins[0];
          return curr;
        })
        this.setState({pin_array: res})
        console.log("Pin Array: ", res);
        console.log("Modules: ", this.state.modules);
      })

    await this.db
      .collection("PINS")
      .find({
        _id: { $in: [...this.state.pin_array]}
      })
      .toArray()
      .then((res) => {
        res = res.map(curr => {
          curr = curr.coords;
          return curr;
        })
        console.log("Pins: ", res);
        this.setState({ pins: res });
      });

    // limits pins to only those within specific miles of userlocation
    var pins = [...this.state.pins];
    var modules = [...this.state.modules];
    for(var i = 0; i < this.state.pins.length; i++) {
      if(!this.getDistance(this.state.userLocation, this.state.pins[i])) {
        if(i !== -1)
          delete pins[i];
          delete modules[i];
      }
    }
    this.setState({ pins: pins });
    this.setState({ modules: modules});
  }

  centerMap(obj,coords)
  {
    const map = this.refs.map.leafletElement;
    map.doubleClickZoom.disable();
    setTimeout(function() {
         map.doubleClickZoom.enable();
    }, 1000);
    map.setView(coords, 13);
  }

  render(){
    const userLocation = this.state.userLocationFound ? (
      <Marker position={this.state.userLocation} icon= {myIcon} >
        <Popup >Your location</Popup>
      </Marker>
    ) : null

    return (
      <div id='leaflet-container'>
      <Map ref='map' center={this.state.currentLocation} zoom={13} maxZoom={18} >
        <TileLayer
          
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        />
        {userLocation}   
        {this.state.pins.map((info,idx) => {
            return <Marker 
              key = {idx} position={info} 
              icon= {new L.divIcon({
                className: 'my-div-icon',
                html: '<img class="my-div-image" src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"/>' 
              })} >
              <Popup>
                <h1>{this.state.modules[idx].title}</h1>
                <p>{this.state.modules[idx].description}</p>
                <p>{this.state.modules[idx].owner_name}</p>
                <p>{this.state.modules[idx].owner_email}</p>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                  window.location.assign("#/module/" + this.state.modules[idx]._id)
                  }
                  >View Details</button>
              </Popup>
            </Marker>
          })}  
          <button style={floatStyle} onClick={()=>this.centerMap(this,this.state.userLocation)} >
            <div><FontAwesomeIcon icon={faStreetView} size="3x" /></div>
          </button>
      </Map>
      </div>
    );
    }
}

export default MapView;