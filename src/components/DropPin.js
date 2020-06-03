import React, { useState, useEffect } from 'react'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {Stitch, RemoteMongoClient, GoogleRedirectCredential} from "mongodb-stitch-browser-sdk"
import { Modal } from 'react-bootstrap'

const appId = "capstonear_app-xkqng"
const client = Stitch.hasAppClient(appId)
    ? Stitch.getAppClient(appId)
    : Stitch.initializeDefaultAppClient(appId)
const mongodb = client.getServiceClient(
    RemoteMongoClient.factory,
    "mongodb-atlas"
);
const db = mongodb.db("APP"); 
var globalPosition = {};

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

const AddpinForm = props => {
    return (
        <Modal
            {...props}
            centered
            style={{zIndex: "1600"}}
        >
            <Modal.Header>
                <Modal.Title>Add a Pin</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <label className="d-block" for="title">Title</label>
                <input type="text" className="w-100" id="title" required/>
                <label className="d-block" for="description">Description</label>
                <textarea className="w-100" id="description" required/>
                <label className="d-block" for="hint">Hint</label>
                <textarea className="w-100" id="hint" required/>
                <label className="d-block" for="destination">Destination</label>
                <textarea className="w-100" id="destination" required/>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={props.onHide}>
                    Cancel
                </button>
                <button className="btn btn-primary" onClick={() => {
                    const title = document.getElementById("title").value || "";
                    const hint = document.getElementById("hint").value || "";
                    const description = document.getElementById("description").value || "";
                    const destination = document.getElementById("destination").value || "";
                    const { lng, lat } = globalPosition;
                    db.collection("PINS")
                        .insertOne({
                            name: title,
                            description: description,
                            hint: hint,
                            destination: destination,
                            long: lng,
                            lat: lat
                        })
                    props.setMarkers(
                        [...props.markers,
                        <Marker key={globalPosition} position={[lat, lng]}>
                            <Popup>
                                <h1>{title}</h1>
                                <p>{description}</p>
                                <p>{hint}</p>
                                <p>{destination}</p>
                            </Popup>
                        </Marker>
                        ]
                    );
                    props.onHide();
                }}>
                    Submit
                </button>
            </Modal.Footer>
        </Modal>
    );
};

const DropPin = () => {
    const [position, setPosition] = useState([45, 45]);
    const [markers, setMarkers] = useState([]);
    const [canPlacePin, setCanPlacePin] = useState(false);
    const [ modalShow, setModalShow ] = useState(false);
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            setPosition([latitude, longitude]);
        })
    }, []);

    return (
        <Map center={position} zoom={13}
            onClick={e => {
                if (canPlacePin) {
                    globalPosition = e.latlng;
                    setModalShow(true);
                    setCanPlacePin(!canPlacePin);
                }
            }}
        >
            <AddpinForm 
                show={modalShow}
                onHide={() => setModalShow(false)}
                setMarkers={setMarkers}
                markers={markers}
            />
            <button style={floatStyle} onClick={()=>setCanPlacePin(!canPlacePin)}>
                <div style={{fontSize: "40px"}}>+</div>
            </button>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            />
            <Marker position={position}>
                <Popup >Your location</Popup>
            </Marker>
            {markers}
        </Map>
    );
}

export default DropPin;
