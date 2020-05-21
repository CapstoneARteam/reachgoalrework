import React, { Component } from 'react';
import './App.css';
import MapView from './components/MapView.js'
import Menu from './components/Menu.js'
import Login from './components/Login.js'
import { Stitch } from 'mongodb-stitch-browser-sdk'

import {
  Switch,
  Route,
  BrowserRouter as Router,
  HashRouter,
  Link
} from "react-router-dom";
import Stitch_init from './components/Stitch';

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
        this.setState(
          {
            username: this.client.auth.authInfo.userProfile.data.name,
            useremail: this.client.auth.authInfo.userProfile.data.email,
            userID: this.client.auth.authInfo.userId,
          }
        )
        //window.location.replace('/menu')
      }
      )
    }
  }


  render() {
    return (
      <HashRouter basename={process.env.PUBLIC_URL}>
        <div className="">
          <nav className="bg-dark" style={{ zIndex: 1500 }}>
            <ul className="list-inline text-center" style={{ marginBottom: 0 }}>
              <li className="list-inline-item">
                <Link className="text-light" to="/">Home</Link>
              </li>
              <li className="list-inline-item">
                <Link className="text-light" to="/admin">Admin</Link>
              </li>
              <li className="list-inline-item">
                <Link className="text-light" to="/student">Student</Link>
              </li>
              <li className="list-inline-item">
                <Link className="text-light" to="/menu">Menu</Link>
              </li>
            </ul>
          </nav>

          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route exact path="/" component={MapView} />
            <Route exact path="/menu" component={Menu} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/admin" component={Admin} />
            <Route exact path="/student" component={Student} />
          </Switch>
        </div>
      </HashRouter>
    );
  }
}

const Home = () => {
  return (
    <div className="App">
      <MapView />
    </div>
  );
}

const Admin = () => {
  return <h2>Admin</h2>;
}

const Student = () => {
  return <h2>Student</h2>;
}


