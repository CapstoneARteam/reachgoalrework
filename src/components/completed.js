import React, { useState, useEffect, useRef } from "react";
import { db } from "./clientdb";
import { useParams } from "react-router-dom";
import { ObjectId } from "mongodb";

const imgsrc = pin => `https://capstoneusercontent.s3-us-west-2.amazonaws.com/${pin}.jpeg?versionid=latest&date=${Date.now()}`

const Completed = props => {
    const [ pin, setPin ] = useState();
    const [ username, setUsername ] = useState("user");
    const { module, userid } = useParams();
    useEffect(() => {
        db.collection("MODULES")
            .findOne({ _id: ObjectId(module) })
            .then(data => setPin(data.pins[0]))
        db.collection("USERS")
            .findOne({ user_id: userid })
            .then(data => setUsername(data?.username || username))
    }
    , []);
    return (
        <div className="container"
            style={{
                display: "block",
                width: "75%",
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "center"
            }}
        >
            <h1>
                {`${username} has completed this module`}
            </h1>
            <img 
                src={imgsrc(pin)}
                style={{
                    display: "block",
                    width: "75%",
                    marginLeft: "auto",
                    marginRight: "auto"
                }}
            />
        </div>)
}
export default Completed;