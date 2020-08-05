import React, { useState, useEffect, useRef } from "react";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import {Stitch,RemoteMongoClient,BSON} from "mongodb-stitch-browser-sdk"
import {AwsServiceClient, AwsRequest } from 'mongodb-stitch-browser-services-aws'

import { Button, Form, Modal, Dropdown } from "react-bootstrap";

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





var HandleFileChange = (props, e) => {
    console.log(e.target.files)
    console.log(e.target.files[0])
    let fileReader = new FileReader();
    fileReader.readAsDataURL(e.target.files[0])
    fileReader.onloadend = (e) => {
        props.setbase64data(e.target.result)
       
        return e.target.result
        
        
    }
    
    
}

const HandleUpload = (base64data, id) =>{
    console.log(base64data)
    console.log(id)
    // console.log(window.context)
    // Convert the base64 encoded image string to a BSON Binary object
    var basestring = base64data.replace(/^data:image\/\w+;base64,/, '');
    var fileBuffer = new Buffer(basestring, 'base64');
    const binaryImageData = new BSON.Binary(new Uint8Array(fileBuffer), 0)

    const aws = client.getServiceClient(AwsServiceClient.factory, "capstoneusercontent");
    // These are the arguments specifically for the s3 service PutObject function
    const args = {
        ACL: 'public-read',
        Bucket: "capstoneusercontent",
        ContentType: "image/jpeg",
        Key: id + '.jpeg',
        ContentEncoding: 'base64',
        Body: binaryImageData,
        // or Body could be a BSON object
    };

    const request = new AwsRequest.Builder()
    .withService("s3")
    .withAction("PutObject")
    .withRegion("us-west-2") // this is optional
    .withArgs(args); // depending on the service and action, this may be optional as well

    console.log(request)

    aws.execute(request.build())
    .then(result => {
        console.log(result)
    }).catch(err => {
        console.log(err)
    });
    
}

const OpenFile = (props) =>{
    console.log("open file")
   
    console.log(props.base64data)
    return(
        <div>
            <input type="file" multiple="single"  onChange={(e) => {
                HandleFileChange(props, e)
                }}></input>  
            <img style={{
                    height: '200px',
                    width : '300px'
                }} src={props.base64data}></img>
        </div>
        
    )
}



export const EditForm = (props) => {
    const [pin, setPin] = useState(props.pin);
    const handleInputChange = (e) => {
        setPin({ ...pin, [e.target.name]: e.target.value });
    };   
    const [imgurl, setimgurl] = useState("https://capstoneusercontent.s3-us-west-2.amazonaws.com/" + props.id + ".jpeg?versionid=latest&date=" + Date.now());
  

    return (
        <Modal {...props} centered show={props.show} style={{ zIndex: "1600" }}>
            <Modal.Header>
                <Modal.Title>Edit a Pin</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <Form>
                    <Form.Group>
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="title"
                            id="title"
                            name="title"
                            value={pin.title}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows="2"
                            id="description"
                            name="description"
                            value={pin.description}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Hint</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows="2"
                            id="hint"
                            name="hint"
                            value={pin.hint}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Destination</Form.Label>
                        <Form.Control
                            id="destination"
                            name="destination"
                            value={pin.destination}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Form.Group>
                        <OpenFile base64data={props.base64data} setbase64data={props.setbase64data} imgurl={imgurl} setimgurl={setimgurl}></OpenFile>
                        <img style={{
                            height: '200px',
                            width : '300px'
                        }} src={imgurl}></img>
                    </Form.Group>
                </Form>

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.cancel}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={() => {
      /*

                        const title =
                            document.getElementById("title").value || "";
                        const hint =
                            document.getElementById("hint").value || "";
                        const description =
                            document.getElementById("description").value || "";
                        const destination =
                            document.getElementById("destination").value || "";
                        const query = { _id: props.objectID };
                        const update = {
                            $set: {
                                title: title,
                                description: description,
                                hint: hint,
                                destination: destination,
                            },
                        };
                        // update a pin on the database
                        db.collection("PINS")
                            .findOneAndUpdate(query, update)
                            .then((objectID) => {
                                console.log(objectID._id.toString())
                                console.log(base64data)
                                if(base64data === "default")
                                {}
                                else{
                                    //upload image
                                    HandleUpload(base64data, objectID._id.toString())

                                }
                                
                                setDefaultValues({
                                    title: title,
                                    description: description,
                                    hint: hint,
                                    destination: destination
                                });
                                setimgurl("https://capstoneusercontent.s3-us-west-2.amazonaws.com/" + props.id + ".jpeg?versionid=latest&date=" + Date.now())
                                props.cancel();
                            });

*/
                        props.save(pin);
                    }}
                >
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const PinMarker = (props) => {
    const [modalShow, setModalShow] = useState(false);
    const [base64data, setbase64data] = useState("default");
  
    return (
        <Marker
            key={globalPosition}
            position={props.pin.coords}
            onClick={() => {
                setModalShow(!modalShow);
            }}
        >
            <EditForm

                pin={props.pin}
                id={props.pin._id}
                show={modalShow}
                save={(pin) => {
                    const query = { _id: pin._id };
                    const update = {
                        $set: pin,
                    };
                    // update a pin on the database
                    db.collection("PINS")
                        .findOneAndUpdate(query, update)
                        .then((objectID) => {
                            if(base64data === "default")
                            {}
                            else{
                                //upload image
                                HandleUpload(base64data, objectID._id.toString())

                            }
                            setModalShow(false);
                      
                        });
                }}
                cancel={() => setModalShow(false)}
                
                setbase64data={setbase64data}
                base64data={base64data}
            />
        </Marker>
    );
};

const AddpinForm = (props) => {
    const [placeholder, setPlaceHolder] = useState({
        hint: "",
        description: ""
    });
    const [categories, setCategories] = useState([]);
    useEffect(()=>{
       db.collection("CATEGORIES")
            .find({})
            .asArray()
            .then(setCategories);
    },[]);

    return (
        <Modal {...props} centered style={{ zIndex: "1600" }}>
            <Modal.Header>
                <Modal.Title>Add a Pin</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Dropdown
                        onSelect={(e) => {
                            setPlaceHolder(JSON.parse(e));
                        }}
                    >
                        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                            Dropdown Button
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {categories.map(curr => {
                                const placeholders = { description: curr.description, hint: curr.hint };
                                return (<Dropdown.Item
                                    eventKey={JSON.stringify(placeholders)}
                                >
                                    {curr.title}
                                </Dropdown.Item>)
                            }
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </Form.Group>
                <label className="d-block" htmlFor="title">
                    Title
                </label>
                <input type="text" className="w-100" id="title" required />
                <label className="d-block" htmlFor="description">
                    Description
                </label>
                <textarea className="w-100" id="description" placeHolder={placeholder.description} required />
                <label className="d-block" htmlFor="hint">
                    Hint
                </label>
                <textarea className="w-100" id="hint" placeHolder={placeholder.hint} required />
                <label className="d-block" htmlFor="destination">
                    Student Feedback
                </label>
                <textarea className="w-100" id="destination" required />
                <label className="d-block" htmlFor="pinImage">
                    Image
                </label>
                <OpenFile base64data={props.base64data} setbase64data={props.setbase64data}> </OpenFile>
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
                        const pin = {
                            title: title,
                            owner_id: client.auth.authInfo.userId,
                            description: description,
                            hint: hint,
                            destination: destination,
                            audio: "",
                            video: "",
                            coords: [lat, lng],
                        };
                        db.collection("PINS")
                            .insertOne(pin)
                            .then((res) => {
                                //console.log(res.insertedId.id)
                                
                                if(props.base64data === "default")
                                {}
                                else{
                                    //upload image
                                    HandleUpload(props.base64data, res.insertedId.toString())
                                }
                                // add the new pin to the map on success of adding the pin to
                                // to the database
                                props.setMarkers([
                                    ...props.markers,
                                    <PinMarker

                                        id={res.insertedId.toString()}
                                        description={description}
                                        hint={hint}
                                        destination={destination}
                                        title={title}
                                        objectID={res.insertedId}
                                        lng={lng}
                                        lat={lat}

                                        key={res.insertedId}
                                        pin={pin}

                                    />,
                                ]);

                                var module = props.module;
                                module.pins = [...module.pins, res.insertedId];
                                props.setModule(module);

                                const query = { _id: module._id };
                                const update = {
                                    $set: {
                                        pins: module.pins,
                                    },
                                };
                                const options = { upsert: false };
                                db.collection("MODULES")
                                    .findOneAndUpdate(query, update, options)
                                    .then((res) => {})
                                    .catch(console.error);
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
    const [base64data, setbase64data] = useState("default");
    const [module, setModule] = useState({
        _id: "",
        title: "",
        owner_email: "",
        owner_id: "",
        owner_name: "",
        description: "",
        pins: [],
        shared_array: [],
        public: false,
    });
   

    // Getting the users current location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            setPosition([latitude, longitude]);
        });
    }, []);

    // Getting the module and pins for the module
    useEffect(() => {
        const query = {
            _id: ObjectId(props.match.params.id),
        };
        db.collection("MODULES")
            .findOne(query)
            .then((res) => {
                setModule(res);

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
                        setMarkers(
                            res.map((pin) => {

                                return <PinMarker 
                                        key={pin._id} pin={pin}
                                        setbase64data={setbase64data}
                                        base64data={base64data}
                                    />;

                            })
                        );
                    });
            })
            .catch(console.error);
    }, [props.match.params.id]);

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
                setModule={setModule}
                module={module}
                
                setbase64data={setbase64data}
                base64data={base64data}
            />
            <button
                style={{
                    zIndex: 1500,
                    position: "fixed",
                    bottom: "10px",
                    left: "10px",
                    textAlign: "center",
                }}
                className="btn btn-primary"
                onClick={() => {
                    window.history.back();
                }}
            >
                Save
            </button>
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
