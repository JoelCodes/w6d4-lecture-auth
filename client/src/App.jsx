import React, { Component } from 'react';
import Axios from 'axios';
import logo from './logo.svg';
import './App.css';
import Login from './Login';
import Game from './Game';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { checking: true };
    this.tryLogin = this.tryLogin.bind(this);
    this.checkLoggedIn = this.checkLoggedIn.bind(this);
  }
  async componentDidMount() {
    this.checkLoggedIn();
  }
  async checkLoggedIn() {
    try {
      const result = await Axios.get('/me');
      this.setState({ checking: false, me: result.data });
    } catch (e) {
      this.setState({ checking: false });
    }
  }
  async tryLogin(email, password) {
    this.setState({ checking: true });
    try {
      await Axios.post('/session', { email, password });
      this.checkLoggedIn();
    } catch (e) {
      this.setState({ checking: false });
    }
  }
  render() {
    const loginSection = this.state.checking ?
      <h2>Checking Login...</h2> :
      (this.state.me) ? <Game /> : <Login tryLogin={this.tryLogin} />;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        {loginSection}
      </div>
    );
  }
}

export default App;
