import React, {Component} from 'react';

import { render } from 'react-dom'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'

class MapView extends Component{
  constructor(props){
    super(props)
  
  this.state ={
    currentLocation: {lat:45.51, lng:-122.67}
  }

}


render(){
const position = [51.505, -0.09]
return (
  <Map center={position} zoom={13}>
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
    />
    <Marker position={position}>
      <Popup>A pretty CSS3 popup.<br />Easily customizable.</Popup>
    </Marker>
  </Map>
);
}

}

export default MapView;