import React, { Component } from 'react';

import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import MapView from './components/MapView.js'
import Menu from './components/Menu/Menu.js'
import { Stitch} from 'mongodb-stitch-browser-sdk'
import Login from './components/Login'
import DropPin from './components/DropPin';
import NavMenu from './components/Menu/NavMenu'
import {Navbar} from 'react-bootstrap'
import ViewModules, {View_Modules} from './components/ViewModules'
import {
  Switch,
  Route,
  HashRouter,
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

    //refs
   
    this.center_container = React.createRef()

    
    

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
        <div>
          <MapView />
        </div>
      );
    }
    else {
      return (
          <Login />
      );
    }
  }

  NavMenu = () => {
    if (this.client.auth.isLoggedIn) {
      

      return (
        <NavMenu center_container={this.center_container}/>
      );
    }
  }

  

  render() {
    return (
      <HashRouter basename="/">

        <div className="" style={{
          height:'100vh'
        }}>
          <div>
          <Navbar className="navbar bg-dark navbar-dark" style={{
            position:'fixed',
            width:'100%',
            height: '50px',
            zIndex:1500,
          }}>
            <Navbar.Brand href='#/'>
              CS Capstone
            </Navbar.Brand>
          
            
          </Navbar>
          {this.NavMenu()}
          </div>

          <div ref={this.center_container} className='mid_container' style={{
              postion: 'fixed',
              top: '50px',
             
          }}>
          <Switch>
            <Route exact path="/">{this.Home}</Route>
            <Route exact path="/menu" component={Menu} />
            <Route exact path="/droppin">
              <DropPin />
            </Route>
            <Route exact path="/create_module" component={Create_Modules} />
            <Route exact path="/viewmodules" component={ViewModules} />
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




