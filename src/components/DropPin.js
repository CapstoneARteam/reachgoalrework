import React, { useState, useEffect } from "react";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";
import { Modal } from "react-bootstrap";
import { ObjectId } from "mongodb";

const appId = "capstonear_app-xkqng";
const client = Stitch.hasAppClient(appId)
    ? Stitch.getAppClient(appId)
    : Stitch.initializeDefaultAppClient(appId);
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
    zIndex: 1500,
};

const EditForm = (props) => {
    const objectID = props.objectID.insertedId;
    return (
        <Modal {...props} centered show={props.show} style={{ zIndex: "1600" }}>
            <Modal.Header>
                <Modal.Title>Edit a Pin</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <label className="d-block" htmlFor="title">
                    Title
                </label>
                <input
                    type="text"
                    className="w-100"
                    id="title"
                    required
                    defaultValue={props.title}
                />
                <label className="d-block" htmlFor="description">
                    Description
                </label>
                <textarea
                    className="w-100"
                    id="description"
                    defaultValue={props.description}
                    required
                />
                <label className="d-block" htmlFor="hint">
                    Hint
                </label>
                <textarea
                    className="w-100"
                    id="hint"
                    defaultValue={props.hint}
                    required
                />
                <label className="d-block" htmlFor="destination">
                    Destination
                </label>
                <textarea
                    className="w-100"
                    id="destination"
                    defaultValue={props.destination}
                    required
                />
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={props.cancel}>
                    Cancel
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        const title =
                            document.getElementById("title").value || "";
                        const hint =
                            document.getElementById("hint").value || "";
                        const description =
                            document.getElementById("description").value || "";
                        const destination =
                            document.getElementById("destination").value || "";
                        const query = { _id: objectID };
                        // update a pin on the database
                        db.collection("PINS")
                            .findOneAndUpdate(query, {
                                title: title,
                                description: description,
                                hint: hint,
                                destination: destination,
                            })
                            .then((objectID) => {
                                props.cancel();
                            });
                    }}
                >
                    Submit
                </button>
            </Modal.Footer>
        </Modal>
    );
};

const PinMarker = (props) => {
    const [modalShow, setModalShow] = useState(false);
    return (
        <Marker
            key={globalPosition}
            position={[props.lat, props.lng]}
            onClick={() => {
                setModalShow(!modalShow);
            }}
        >
            <EditForm
                description={props.description}
                hint={props.hint}
                destination={props.destination}
                title={props.title}
                objectID={props.objectID}
                lng={props.lng}
                lat={props.lat}
                show={modalShow}
                cancel={() => setModalShow(false)}
            />
        </Marker>
    );
};

const AddpinForm = (props) => {
    return (
        <Modal {...props} centered style={{ zIndex: "1600" }}>
            <Modal.Header>
                <Modal.Title>Add a Pin</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <label className="d-block" htmlFor="title">
                    Title
                </label>
                <input type="text" className="w-100" id="title" required />
                <label className="d-block" htmlFor="description">
                    Description
                </label>
                <textarea className="w-100" id="description" required />
                <label className="d-block" htmlFor="hint">
                    Hint
                </label>
                <textarea className="w-100" id="hint" required />
                <label className="d-block" htmlFor="destination">
                    Destination
                </label>
                <textarea className="w-100" id="destination" required />
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={props.onHide}>
                    Cancel
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        const title =
                            document.getElementById("title").value || "";
                        const hint =
                            document.getElementById("hint").value || "";
                        const description =
                            document.getElementById("description").value || "";
                        const destination =
                            document.getElementById("destination").value || "";
                        const { lng, lat } = globalPosition;
                        // insert a new pin on the database
                        db.collection("PINS")
                            .insertOne({
                                title: title,
                                owner_id: client.auth.authInfo.userId,
                                description: description,
                                hint: hint,
                                destination: destination,
                                coords: [lat, lng],
                            })
                            .then((objectID) => {
                                // add the new pin to the map on success of adding the pin to
                                // to the database
                                props.setMarkers([
                                    ...props.markers,
                                    <PinMarker
                                        description={description}
                                        hint={hint}
                                        destination={destination}
                                        title={title}
                                        objectID={objectID}
                                        lng={lng}
                                        lat={lat}
                                    />,
                                ]);
                            });
                        props.onHide();
                    }}
                >
                    Submit
                </button>
            </Modal.Footer>
        </Modal>
    );
};

const DropPin = (props) => {
    const [position, setPosition] = useState([45, 45]);
    const [markers, setMarkers] = useState([]);
    const [canPlacePin, setCanPlacePin] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            setPosition([latitude, longitude]);
        });
    }, []);

    const query = {
        _id: ObjectId(props.match.params.id),
    };
    db.collection("MODULES")
        .findOne(query)
        .then((res) => {
            console.log("Module: ", res);

            // Pipeline to ensure that the order of the pins stays the same after the query
            const pipeline = [
                { $match: { _id: { $in: res.pins } } },
                {
                    $addFields: {
                        __order: { $indexOfArray: [res.pins, "$_id"] },
                    },
                },
                { $sort: { __order: 1 } },
            ];

            db.collection("PINS")
                .aggregate(pipeline)
                .toArray()
                .then((res) => {
                    console.log("Pins: ", res);
                    setMarkers(
                        res.map((pin) => {
                            return (
                                <PinMarker
                                    description={pin.description}
                                    hint={pin.hint}
                                    destination={pin.destination}
                                    title={pin.title}
                                    objectID={pin._id}
                                    lng={pin.coords[1]}
                                    lat={pin.coords[0]}
                                />
                            );
                        })
                    );
                });
        })
        .catch(console.error);

    return (
        <Map
            center={position}
            zoom={13}
            onClick={(e) => {
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
            <button
                style={floatStyle}
                onClick={() => setCanPlacePin(!canPlacePin)}
            >
                <div style={{ fontSize: "40px" }}>+</div>
            </button>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
                <Popup>Your location</Popup>
            </Marker>
            {markers}
        </Map>
    );
};

export default DropPin;
