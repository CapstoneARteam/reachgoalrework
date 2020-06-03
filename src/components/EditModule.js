import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import FormCheck from 'react-bootstrap/FormCheck'
import FormControl from 'react-bootstrap/FormControl'
import {Stitch, } from "mongodb-stitch-browser-sdk"

const EditModule = () => {
    return(
        <Form style={{
            top: '40px',
            position: 'relative',
            textAlign: 'center',
        }}>
            <Form.Group as={Row} controlId="formHorizontalName">
                <Form.Label column sm={2}>
                </Form.Label>
                <Form.Control type="name" placeholder="Module Name" 
                style={{ textAlign: 'center', width: '300px', margin: '0 auto',}} />
            </Form.Group>

            <Form.Group as={Row} controlId="formHorizontalTextarea1">
                <Form.Label column sm={2}>
                </Form.Label>
                <Form.Control as="textarea" rows="5" placeholder="Description"
                style={{ textAlign: 'center', width: '300px', margin: '0 auto',}}/>
            </Form.Group>
            <fieldset>
                <Form.Group as={Row}>
                    <Form.Label as="legend" column sm={2}>
                    </Form.Label>
                    <Col sm={10}>
                        <Form.Check
                        type="radio"
                        label="Public"
                        name="formHorizontalRadios"
                        id="formHorizontalRadios1"
                        />
                        <Form.Check
                        type="radio"
                        label="Private"
                        name="formHorizontalRadios"
                        id="formHorizontalRadios2"
                        />
                    </Col>
                </Form.Group>
            </fieldset>

            <Form.Group as={Row}>
                <Col sm={{ span: 10, offset: 2 }}>  
                    <Button variant="primary">Add Pins</Button>
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Col sm={{ span: 10, offset: 2 }}>
                    <Button variant="primary">Save</Button>
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Col sm={{ span: 10, offset: 2 }}>   
                    <Button variant="primary">Share</Button>
                </Col>
            </Form.Group>
        </Form>
    )
}

export default EditModule;