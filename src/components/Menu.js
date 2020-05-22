import React, {Component} from 'react'
import {Stitch, RemoteMongoClient, GoogleRedirectCredential} from "mongodb-stitch-browser-sdk"
import { ObjectId } from 'mongodb'

export default class Menu extends Component{
  constructor(){
      super()
      this.state ={
        username:"",
        useremail:"",
        userID:"",
        stitch_res:[]
      }

      //bind functions
      this.login = this.login.bind(this)
      this.logout = this.logout.bind(this)
      this.addamodule = this.addamodule.bind(this)
      this.listmymodules = this.listmymodules.bind(this)
  
  }

  componentDidMount(){

        //init mongodb stitch
        const appId = "capstonear_app-xkqng"
        this.client = Stitch.hasAppClient(appId)
        ? Stitch.getAppClient(appId)
        : Stitch.initializeDefaultAppClient(appId)
        const mongodb = this.client.getServiceClient(
          RemoteMongoClient.factory,
          "mongodb-atlas"
        );
        //select the db in our mongdb atlas cluster
        this.db = mongodb.db("APP"); 
        if (this.client.auth.isLoggedIn) {
          this.setState(
              {
              username : this.client.auth.authInfo.userProfile.data.name,
              useremail: this.client.auth.authInfo.userProfile.data.email,
              userID: this.client.auth.authInfo.userId,
              } 
          )
          //window.location.replace('#/menu')
        } 
   

  }



  //login button handler
  async login(){
    if (this.client.auth.isLoggedIn) {
        this.setState(
            {
              username : this.client.auth.authInfo.userProfile.data.name,
              useremail: this.client.auth.authInfo.userProfile.data.email,
              userID: this.client.auth.authInfo.userId,
            }
           
        )
      } else {
    
        
        //login using google redirect
        const credential = new GoogleRedirectCredential();
        this.client.auth.loginWithRedirect(credential);
        console.log(this.state)
        
      }
  }

  async logout(){
    await this.client.auth.logout()
    this.setState({
        username:"",
        useremail:"",
        userID:""
    })
    window.location.replace("#/")
  }

  addamodule(){
    this.db.collection("MODULES")
    .insertOne({
      userID: this.state.userID,
      name: this.state.temp_module_name,
      owner: this.state.useremail,
    })
    .catch(console.error);
  }

  listmymodules() {
    if(!this.client.auth.isLoggedIn){
        return
    }
    this.db.collection("PINS").find({_id: ObjectId("5ebed1bc5992681f357d7948")})
    .asArray()
    .then((stitch_res) => {this.setState({stitch_res})
      console.log(this.state.stitch_res[0])
    }
    )
  }

  render(){
    return(
      <div>
        <br />
        <br />
        <p>username:   {this.state.username} </p>
        <p>email:   {this.state.useremail}</p>
        <p>userid:   {this.state.userID}</p>
        {/* <button onClick={this.login}> Login with Google</button> */}
        <br />
        <button class="btn btn-primary"  onClick={this.logout}> Log out </button>
        <br />
        <br />
        <input type="text" id ="createmodule" placeholder="module name?" 
        onChange={(event)=> this.setState({temp_module_name: event.target.value})}/>
        <button class="btn btn-primary"  onClick={this.addamodule}>Add a Module</button> 
        <br />
        <button class="btn btn-primary" onClick={this.listmymodules}>List my modules</button>
        <ul>
          {this.state.stitch_res.map((info,idx) => {
            return <li key={idx}>{info.name}, created by {info.owner}</li>
          })}
        </ul>

      </div>
    )
  }
}