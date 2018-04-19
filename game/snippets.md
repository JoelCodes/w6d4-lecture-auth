```js
  const result = /token=([0-9a-zA-Z._]+)/.exec(req.url);
  if (!result) {
    console.log('Token Missing');
    ws.terminate();
  }
  const token = result[1];
  console.log(token);
  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    console.log('Connection', decoded);
  } catch (e) {
    console.log('Token Failed');
    ws.terminate();
  }

```

```js
import React, { Component } from 'react';

import logo from './logo.svg';
import './App.css';

import LoginForm from './Login';
import Game from './Game';

class App extends Component {
  constructor() {
    super();
    this.state = { checking: true, loginOpen: false };
    this.openLogin = this.openLogin.bind(this);
    this.closeLogin = this.closeLogin.bind(this);
    this.onGetUser = this.onGetUser.bind(this);
  }
  componentDidMount() {
  }
  onGetUser(user) {
    this.setState({ loginOpen: false, user, checking: false });
  }
  closeLogin() {
    this.setState({ loginOpen: false });
  }
  openLogin() {
    this.setState({ loginOpen: true });
  }
  render() {
    const login = this.state.loginOpen && <LoginForm
      closeLogin={this.closeLogin}
      onGetUser={this.onGetUser}
    />;
    const game = this.state.user && (<Game />);
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        { game }
        { login }
      </div>
    );
  }
}

export default App;
```


```js
import React from 'react';
import axios from 'axios';

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { step: 'CHECKING' };
    this.getToken = this.getToken.bind(this);
    this.tryLogin = this.tryLogin.bind(this);
  }
  componentDidMount() {
    this.getToken();
  }
  async getToken() {
    try {
      const result = await axios.post('/token');
      this.props.onToken(result.data);
    } catch (e) {
      if (/401/.test(e)) {
        this.setState({ step: 'NOT_LOGGED_IN' });
      }
    }
  }
  async tryLogin(email, password) {
    this.setState({ step: 'LOGGING_IN' });
    try {
      await axios.post('/session', { email, password });
      this.setState({ step: 'CHECKING' });
      this.getToken();
    } catch (e) {
      console.log(e);
      this.setState({ step: 'NOT_LOGGED_IN' });
    }
  }
  render() {
    const onSubmit = (e) => {
      e.preventDefault();
      const { email: { value: email }, password: { value: password } } = e.target.elements;
      this.tryLogin(email, password);
    };
    return (<div className="modal-bg">
      <div className="modal-box">
        <h2>Log In</h2>
        <form onSubmit={onSubmit}>
          <p>
            <input type="email" placeholder="Email" name="email" />
          </p>
          <p>
            <input type="password" placeholder="Password" name="password" />
          </p>
          <p>
            <button type="submit" disabled={this.state.step !== 'NOT_LOGGED_IN'}>Submit</button>
          </p>
        </form>
      </div>
    </div>);
  }
}

export default LoginForm;

```

[Async Patterns](https://www.youtube.com/watch?v=726eZyVtC0Y)