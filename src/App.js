import React from 'react';
import './App.css';
import MapView from './components/MapView.js'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function App() {
  return (
    <Router>
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
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/admin">
            <Admin />
          </Route>
          <Route path="/student">
            <Student />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
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

export default App;
