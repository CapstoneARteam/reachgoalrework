import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk"

const appId = "capstonear_app-xkqng";
export const client = Stitch.hasAppClient(appId)
    ? Stitch.getAppClient(appId)
    : Stitch.initializeDefaultAppClient(appId);
const mongodb = client.getServiceClient(
    RemoteMongoClient.factory,
    "mongodb-atlas"
);
export const db = mongodb.db("APP");
