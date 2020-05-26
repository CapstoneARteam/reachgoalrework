import React, { Component } from 'react'
import {Card, CardGroup, CardDeck} from 'react-bootstrap'

export default class ViewModules extends Component{

    constructor(props){
        super(props)
        this.state ={
            modules : [{name:'OMSI'},{name:'PSU'},{name:'DOWNTOWN'}, {name:'DOWNTOWN2'}]
        }
        this.add_module_cards = this.add_module_cards.bind(this)
    }

    componentDidMount(){

    }

    add_module_cards(){
        const mds= this.state.modules.map(module => (
            <Card style={{
                top :'60px',
                margin : '.25rem',
                maxWidth:'23rem'
            }}>
                <Card.Body>
                    <Card.Img variant="top" src="https://www.interjet.com/images/img.jpg" />
                    <Card.Title>{module.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">by someone</Card.Subtitle>
                    <Card.Text>
                        this is the description of this OMSI module
                    </Card.Text>
                    <button className="btn btn-primary">View Module</button>
                </Card.Body>
            </Card>
        ))
        return(
            <div style={{
                overflow : 'visible'
            }}>
            <CardDeck>
                {mds}
            </CardDeck>
            </div>
               
        )
    }

    render(){
        return(
            this.add_module_cards()
        )
    }

}