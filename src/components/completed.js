import React, { useState, useEffect } from "react";
import { db } from "./clientdb";
import { useParams } from "react-router-dom";
import { ObjectId } from "mongodb";

const imgSrc = pin => `https://capstoneusercontent.s3-us-west-2.amazonaws.com/${pin}.jpeg?versionid=latest`;

const Completed = props => {
    const [ pin, setPin ] = useState();
    const [ username, setUsername ] = useState("User");
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
        <div 
            className="container"
            style={{
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "center"
            }}
        >
            <h1> {`${username} has completed this module`} </h1>
            <img src={imgSrc(pin)} style={{ width: "90%" }} />
        </div>
    );
}
export default Completed;
