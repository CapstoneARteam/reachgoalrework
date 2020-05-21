import React, {Component} from 'react'
import {Stitch, RemoteMongoClient, GoogleRedirectCredential} from "mongodb-stitch-browser-sdk"

export default class Login extends Component{
    constructor(){
        super()
         //init mongodb stitch
 
 
    }

    async componentDidMount(){
        const appId = "capstonear_app-xkqng"
         if(Stitch.hasAppClient(appId)){
            this.client = Stitch.getAppClient(appId)
            const mongodb = this.client.getServiceClient(
            RemoteMongoClient.factory,
            "mongodb-atlas"
            );
            //select the db in our mongdb atlas cluster
            //this.db = mongodb.db("APP");
            if (this.client.auth.isLoggedIn) {
              this.setState(
                  {
                  username : this.client.auth.authInfo.userProfile.data.name,
                  useremail: this.client.auth.authInfo.userProfile.data.email,
                  userID: this.client.auth.authInfo.userId,
                  } 
              )
              //window.location.replace('/menu')
            } 
            else {
                
                //login using google redirect
                const credential = new GoogleRedirectCredential(process.env.PUBLIC_URL + "/Login");
                this.client.auth.loginWithRedirect(credential)   

            }

            if (this.client.auth.hasRedirectResult()) {
                console.log("has results")
          
                this.client.auth.handleRedirectResult().then(user =>{
                    this.setState(
                        {
                          username : this.client.auth.authInfo.userProfile.data.name,
                          useremail: this.client.auth.authInfo.userProfile.data.email,
                          userID: this.client.auth.authInfo.userId,
                        } 
                    )
                    //window.location.replace('/menu')
                }  
              );   
            }
          }




         //window.location.href = window.location.href.replace("/#","/");
        

         

    }

    render(){
        return(
        <div>
            {console.log(this.state)}
        </div>
        )
    }
}