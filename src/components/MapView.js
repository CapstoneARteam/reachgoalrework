import React, {Component} from 'react'
import { render } from 'react-dom'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'


const getUserPosition = () =>navigator.geolocation.getCurrentPosition(position => {const { latitude, longitude } = position.coords
    })

    class MapView extends Component{
  constructor(props){
    super(props)

  

  this.state ={
    currentLocation: {lat: 45.51, lng:-122.68},
    zoom: 13,
    getUserPosition,
  }


}


render(){
const{currentLocation, zoom,getUserPosition}= this.state;

return (
  <Map center={currentLocation} zoom={zoom}>
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
    />
    <Marker position={currentLocation}>
      <Popup>A pretty CSS3 popup.<br />Easily customizable.</Popup>
    </Marker>
  </Map>
);
}

}

export default MapView;