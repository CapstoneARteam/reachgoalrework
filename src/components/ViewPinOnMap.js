import React, {Component} from 'react'
import { Map, Marker, Popup, TileLayer,Polyline } from 'react-leaflet'
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
  html: '<span  class="my-div-span">YOU ARE HERE </span>'+
        '<img class="my-div-image" src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"/>'
})

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
      console.log(this.state.stitch_res)
      var temp_array =[]
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
        console.log("Pins: ", res);
        this.setState ({ pins_array: res} )

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
  render(){
    const userLocation = this.state.userLocationFound ? (
      <Marker  position={this.state.userLocation}  icon= {myIcon} >
        <Popup>Your location</Popup>
      </Marker>
    ) : null
   
    return (
      <div>
      <Map center={this.state.currentLocation} zoom={13} maxZoom={18} >
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
                                                  html: '<span style={Style} class="my-div-span">'+(idx+1)+'</span>'+
                                                        '<img class="my-div-image" src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"/>'
                                                })} >
                        <Popup>
                              <h1>{info.desc}</h1>
                              <p>{info.description}</p>
                              <p>{info.hint}</p>
                              <p>{info.destination}</p>
                              <img style={{
                                  height: '100px',
                                  width : '150px'
                              }} src={"https://capstoneusercontent.s3-us-west-2.amazonaws.com/" + info._id.toString() + ".jpeg"}></img>
                              <button onClick={()=>this.openGoogle(info.coords)} >Open Google Map</button>
                        </Popup>
                    </Marker>
          })}
      </Map>
      </div>
    );
    }
}

export default ViewPinOnMap;

//this.db.collection("PINS").find({_id: ObjectId("5ebed1bc5992681f357d7948")} )
//this.db.collection("PINS").find({owner_id: this.client.auth.authInfo.userId} )
