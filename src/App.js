import React, { Component } from 'react';

import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import MapView from './components/MapView.js'
import Menu from './components/Menu/Menu.js'
import { Stitch , ObjectID} from 'mongodb-stitch-browser-sdk'
import Login from './components/Login'
import DropPin from './components/DropPin';
import NavMenu from './components/Menu/NavMenu'


import {
  Switch,
  Route,
  HashRouter,
  Link
} from "react-router-dom";
import { thisExpression } from '@babel/types';


export default class App extends Component {

  constructor() {
    super()
    const appId = "capstonear_app-xkqng"
    this.client = Stitch.hasAppClient(appId)
      ? Stitch.getAppClient(appId)
      : Stitch.initializeDefaultAppClient(appId)
      
    if (this.client.auth.hasRedirectResult()) {
      console.log("has results")

      this.client.auth.handleRedirectResult().then(user => {
        window.location.reload()
      }
      )
    }
    else {

      //window.location.replace('#/login')

    }
    this.state = {
      isLoggedIn : false,
    }

    this.NavMenu = this.NavMenu.bind(this)
  }

  componentDidMount() {

  }

  handleStitchClient(){
    this.setState(
      {
        stitchClient : this.client,
        userProfile : this.client.auth.userProfile,
        isLoggedIn : true,
      }
    )

  }

  Home = () => {
    if (this.client.auth.isLoggedIn) {
      return (
        <div className="App">
          <MapView />
        </div>
      );
    }
    else {
      return (
        <div className="Login">
          <Login />
        </div>
      );
    }
  }

  NavMenu = () => {
    if (this.client.auth.isLoggedIn) {
      return (
        <NavMenu />
      );
    }
  }

  

  render() {
    return (
      <HashRouter basename="/">

        <div className="">
          <div>
          {this.NavMenu()}
          </div>

          <div>
          <Switch>
            <Route exact path="/">{this.Home}</Route>
            <Route exact path="/menu" component={Menu} />
            <Route exact path="/droppin">
              <DropPin />
            </Route>
            <Route exact path="/create_module" component={Create_Modules} />
            <Route exact path="/view_module" component={View_Modules} />
          </Switch>
          </div>
        </div>
      </HashRouter>
    );
  }
}



const Create_Modules = () => {
  return <h2>Admin</h2>;
}

const View_Modules = () => {
  return <h2>Student</h2>;
}


