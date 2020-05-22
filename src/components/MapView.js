import React, {Component} from 'react'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'



delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});



class MapView extends Component{
  constructor(props){
    super(props)

    this.state ={
      currentLocation: {lat: 45.51, lng:-122.68},
      zoom: 13,
      userLocation:[],
      userLocationFound: false,
    }
  this.getUserPosition = this.getUserPosition.bind(this)
  }
  

  getUserPosition(){
    navigator.geolocation.getCurrentPosition(position => {
      this.setState({ userLocation : [position.coords.latitude, position.coords.longitude], userLocationFound:true, currentLocation : [position.coords.latitude, position.coords.longitude]})
      
      console.log(this.state)
      
    })
  
  }

  componentDidMount(){
    this.getUserPosition()

    
  }

  render(){
    const userLocation = this.state.userLocationFound ? (
      <Marker position={this.state.userLocation}>
        <Popup >Your location</Popup>
      </Marker>
    ) : null

    return (
      <Map center={this.state.currentLocation} zoom={13} maxZoom={18} >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        />
        {userLocation}     
      </Map>
    );
    }
}

export default MapView;