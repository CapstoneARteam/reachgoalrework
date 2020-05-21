import React, { Component } from 'react'

import {Stitch} from 'mongodb-stitch-browser-sdk'
export default class Stitch_init extends Component {
    constructor() {
        super()
    }

    componentDidMount() {
        const appId = "capstonear_app-xkqng"
        Stitch.initializeDefaultAppClient(appId)
    }

}