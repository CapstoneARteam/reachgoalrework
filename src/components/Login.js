import React, {Component} from 'react'
import {Stitch, RemoteMongoClient, GoogleRedirectCredential} from "mongodb-stitch-browser-sdk"

export default class Login extends Component{
    constructor(){
        super()
        const appId = "capstonear_app-xkqng"
        this.client = Stitch.getAppClient(appId)
        this.login = this.login.bind(this)
    }

    componentDidMount(){
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
        
       
    }


    async login(){
          
          //login using google redirect
          const credential = new GoogleRedirectCredential();
          await this.client.auth.loginWithRedirect(credential);
          console.log(this.state)
          
        
    }


    render(){
        return(
        <div>
            <button onClick={this.login}>Login with Google</button>
        </div>
        )
    }
}