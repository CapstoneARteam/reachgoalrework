import React, { Component } from 'react';

import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import MapView from './components/MapView.js'
import Menu from './components/Menu/Menu.js'
import { Stitch} from 'mongodb-stitch-browser-sdk'
import Login from './components/Login'
import DropPin from './components/DropPin';
import NavMenu from './components/Menu/NavMenu'
import Module from './components/Module'
import EditModule from './components/EditModule'
import {Navbar} from 'react-bootstrap'
import ViewModules from './components/ViewModules'
import ManageModules from './components/ManageModules'
import {
  Switch,
  Route,
  HashRouter,

} from "react-router-dom";



export default class App extends Component {

  constructor(props) {
    super(props)
    const appId = "capstonear_app-xkqng"
    this.client = Stitch.hasAppClient(appId)
      ? Stitch.getAppClient(appId)
      : Stitch.initializeDefaultAppClient(appId)
      
    if (this.client.auth.hasRedirectResult()) {
      console.log("has results")

      this.client.auth.handleRedirectResult().then(user => {
        window.location.assign('/')
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
      <HashRouter basename="/" >

       
          <div>
          <Navbar className="navbar bg-dark navbar-dark" style={{
            position:'fixed',
            width:'100%',
            height: '50px',
            zIndex:1500,
          }}>
            <Navbar.Brand href='#/'>
              Context AR
            </Navbar.Brand>
          </Navbar>
          {this.NavMenu()}
          </div>

          <div ref={this.center_container} className='center_container' style={{
              position: 'fixed',
              top: '50px',
              bottom: '0',
              width:"100%",
              height:'calc(100% - 50px)',
              
          }}>
          <Switch>
            <Route exact path="/">{this.Home}</Route>
            <Route exact path="/menu" component={Menu} />
            <Route exact path="/droppin">
              <DropPin />
            </Route>
            <Route exact path="/create_module" component={Create_Modules} />
            <Route exact path="/viewmodules" component={ViewModules} />
            <Route exact path="/modules/edit" component={ManageModules} />
            <Route exact path="/modules/module/edit/:id" component={EditModule} />
            <Route  path='/module/:id' component={Module}/>
          </Switch>
          </div>
       
      </HashRouter>
    );
  }
}



const Create_Modules = () => {
  return <h2>Admin</h2>;
}




