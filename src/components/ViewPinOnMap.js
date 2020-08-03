import React, {Component} from 'react'
import { Map, Marker, Popup, TileLayer,Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {Stitch, RemoteMongoClient, GoogleRedirectCredential} from "mongodb-stitch-browser-sdk"
import { ObjectId } from 'mongodb'
import './ViewPinOnMap.css'

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

class ViewPinOnMap extends Component{
  constructor(props){
    super(props)

    this.state ={
      currentLocation: {lat: 45.51, lng:-122.68},
      zoom: 13,
      userLocation:[],
      userLocationFound: false,
      username:"",
      useremail:"",
      userID:"",
      stitch_res:[],
      pin:[],
      pins_line:[],
      pins_array:[],
    }
  this.getUserPosition = this.getUserPosition.bind(this)
  this.drawpins = this.drawpins.bind(this)
  this.drawlines = this.drawlines.bind(this)
  this.openGoogle = this.openGoogle.bind(this)
  this.centerMap = this.centerMap.bind(this)
  this.bounds = undefined;

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
      
      //console.log(this.state)
      
    })
  
  }

  boundingRect(coords) {
    return coords
      .reduce((acc, curr) => {
        const [lat, lng] = curr;
        acc[0][0] = lat < acc[0][0] ? lat : acc[0][0];
        acc[0][1] = lng < acc[0][1] ? lng : acc[0][1];
        acc[1][0] = lat > acc[1][0] ? lat : acc[1][0];
        acc[1][1] = lng > acc[1][1] ? lng : acc[1][1];
        return acc;
      }, [[90, 180], [-90, -180]]);
  }

  AddPaddingToRect(rect, percent=0.10){
    const [latMin, lngMin] = rect[0];
    const [latMax, lngMax] = rect[1];
    const lngPad = (lngMax - lngMin) * percent;
    const latPad = (latMax - latMin) * percent;
    return [
      [latMin - latPad, lngMin - lngPad],
      [latMax + latPad, lngMax + lngPad]
    ];
  }

  componentDidMount(){
    this.getUserPosition()
    this.drawpins()
  }

  async drawpins() {
    if(!this.client.auth.isLoggedIn){
        return
    }
    const query ={_id: ObjectId(this.props.match.params.id) };
    await this.db.collection("MODULES").findOne(query)
    .then((stitch_res) => {this.setState({stitch_res})
      const pipeline = [
        { $match: { _id: { $in: stitch_res.pins } } },
        {
            $addFields: {
                __order: { $indexOfArray: [stitch_res.pins, "$_id"] },
            },
        },
        { $sort: { __order: 1 } },
    ];
    this.db.collection("PINS").aggregate(pipeline)
      .toArray()
      .then((res) => {
        this.bounds = this.AddPaddingToRect(
          this.boundingRect([...res.map(elem => elem.coords), this.state.currentLocation]));
        this.setState({ pins_array: res })
      });

    }
    )
  }
  drawlines(){
   
    if(this.state.pins_line.length>0)
    {
      return (
        <Polyline positions={this.state.pins_line} color ={'red'}>
      </Polyline>
      )
    }
    return
  } 
  openGoogle(coords)
  {
    var url= "http://maps.google.com?q="+coords[0]+","+coords[1]
    var win = window.open(url, '_blank');
    return
  }
  centerMap(obj,coords)
  {
    console.log("center Map function")
    const map = this.refs.map.leafletElement
    map.doubleClickZoom.disable();
    setTimeout(function() {
         map.doubleClickZoom.enable();
    }, 1000);
    map.setView(coords)
  }
  render(){
    const userLocation = this.state.userLocationFound ? (
      <Marker  position={this.state.userLocation}  icon= {myIcon} >
        <Popup>You are here</Popup>
      </Marker>
    ) : null
   
    return (
      <div>
      <Map ref='map' center={this.state.currentLocation} zoom={13} maxBounds={this.bounds} bounds={this.bounds}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        />
        {userLocation}
         
        {this.state.pins_array.map((info,idx) => {
            return <Marker 
                           key = {idx} position={info.coords} 
                           icon= {new L.divIcon({
                                                  className: 'my-div-icon',
                                                  html: '<img class="my-div-image" src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"/>' 
                                                  + '<span style={Style} class="my-div-span">'+(idx+1)+'</span>'
                                                })} >
                        <Popup>
                              <h1>{info.title}</h1>
                              <p>{info.description}</p>
                              <p>{info.hint}</p>
                              <p>{info.destination}</p>
                              <img style={{
                                  height: '100px',
                                  width : '150px'
                              }} src={"https://capstoneusercontent.s3-us-west-2.amazonaws.com/" + info._id.toString() + ".jpeg?versionid=latest&date=" + Date.now() }></img>
                              <button onClick={()=>this.openGoogle(info.coords)} >Open Google Map</button>
                        </Popup>
                    </Marker>
          })}
          <button style={floatStyle} onClick={()=>this.centerMap(this,this.state.currentLocation)} >
                <div style={{ fontSize: "10px" }} >Center</div>
          </button>
      </Map>
      </div>
    );
    }
}

export default ViewPinOnMap;

//this.db.collection("PINS").find({_id: ObjectId("5ebed1bc5992681f357d7948")} )
//this.db.collection("PINS").find({owner_id: this.client.auth.authInfo.userId} )
