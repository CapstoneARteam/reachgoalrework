import React, { Component } from 'react';

import './App.css';
import MapView from './components/MapView.js'
import Menu from './components/Menu.js'
import { Stitch , ObjectID} from 'mongodb-stitch-browser-sdk'
import Login from './components/Login'



import {
  Switch,
  Route,
  HashRouter,
  Link
} from "react-router-dom";


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
        window.location.replace('#/')
      }
      )
    }
    else {

      //window.location.replace('#/login')

    }
    this.state = {

    }

  }

  componentDidMount() {



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

  

  render() {
    return (
      <HashRouter basename="/">
        <div className="">
          <nav className="bg-dark" style={{ zIndex: 1500 }}>
            <ul className="list-inline text-center" style={{ marginBottom: 0 }}>
              <li className="list-inline-item">
                <Link className="text-light" to="/">Home</Link>
              </li>
              {/* <li className="list-inline-item">
                <Link className="text-light" to="/admin">Admin</Link>
              </li>
              <li className="list-inline-item">
                <Link className="text-light" to="/student">Student</Link>
              </li> */}
              <li className="list-inline-item">
                <Link className="text-light" to="/menu">Menu</Link>
              </li> 
            </ul>
          </nav>

          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route exact path="/" component={this.Home} />
            <Route exact path="/menu" component={Menu} />
            <Route exact path="/create_module" component={Create_Modules} />
            <Route exact path="/view_module" component={View_Modules} />
          </Switch>
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


