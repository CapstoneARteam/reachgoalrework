import React, { useState, useEffect } from 'react'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

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
    zIndex: 1500
}

const DropPin = () => {
    const [position, setPosition] = useState([45, 45]);
    const [markers, setMarkers] = useState([]);
    const [canPlcaePin, setCanPlcaePin] = useState(false);
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            setPosition([latitude, longitude]);
        })
    }, []);
    return (
        <Map center={position} zoom={13}
            onClick={e => {
                if (canPlcaePin) {
                    setMarkers(
                        [...markers,
                        <Marker position={[e.latlng.lat, e.latlng.lng]}>
                            <Popup>testing</Popup>
                        </Marker>
                        ]
                    );
                    setCanPlcaePin(!canPlcaePin);
                }
            }}
        >
            <button style={floatStyle} onClick={()=>setCanPlcaePin(!canPlcaePin)}>
                <div style={{fontSize: "40px"}}>+</div>
            </button>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            />
            {markers}
        </Map>
    );
}

export default DropPin;
