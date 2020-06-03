import React, { Component } from 'react'

export default class ManageModules extends Component {
    constructor(props) {
        super(props)

        this.list_modules = this.list_modules.bind(this)
        this.add_module = this.add_module.bind(this)
        this.save_modules = this.save_modules.bind(this)
    }

    list_modules() {
        return (
            <ul>
                <li>
                    Test
                </li>
            </ul>
        )
    }

    add_module() {

    }

    save_modules() {

    }

    render(){
        return (
            <div>
                <h2>Manage Modules</h2>
                
                <div>
                    {this.list_modules()}
                </div>
            </div>
        )
    }
}