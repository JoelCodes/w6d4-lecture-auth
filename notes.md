# Auth with React

This was just a demo of auth techniques in React.  We connected a React App to an HTTP API with good, old-fashioned sessions, and used JWT to make an authenticated connection to a websocket.  We also had a couple of detours:

* Create React App
* Async / Await
* Proxies

## Async / Await

The ES6 keywords `async` and `await` are syntactic sugar that help us write more readable async code.  To use them, you must mark a function as `async`.  That means two things:

1. That it will return a promise
1. That you might use the `await` keyword within it.

So here's a non-async and async function together:

```js
const get3 = () => 3;
const get3Async = async () => 3;

console.log(get3()); // CONSOLE: 3
console.log(get3Async()); // CONSOLE: Promise { 3 }
```

The `await` lets us treat other async operations almost like sync operations, avoiding callbacks.

```js
// Without `async` syntax
const getUserName = (id) => {
  return getUserAsync(id)
    .then(user => user.name);
}

const getUserNameAsync = async (id) => {
  const user = await getUserAsync(id);
  return user.name;
}
```

These two do exactly the same thing, but the second is a little more readable.  Rather than transforming a promise into another promise with `.then`, it reads like this:

* Get a user object from a promise.
* Return that user's name.

Here's a longer example.  Let's take connecting to Mongo DB.

```js
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'w3d4';

// Use connect method to connect to the server
MongoClient.connect(url, (err, client) => {
  console.log('Connected successfully to server');

  const db = client.db(dbName);
  const instruments = db.collection('instruments');
  instruments
    .find({ family: 'String' })
    .toArray((queryErr, result) => {
      console.log(result);
    });
});
```

We know that these functions can return promises, so let's refactor into promises.

```js
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'w3d4';

// Use connect method to connect to the server
const connectionPrms = MongoClient.connect(url)

const queryPromise = connectionPrms
  .then((client) => {
  console.log('Connected successfully to server');

  const db = client.db(dbName);
  const instruments = db.collection('instruments');
  return instruments
    .find({ family: 'String' })
    .toArray();
});

queryPromise
  .then((result) => {
    console.log(result)
  });
```

Well, that gives us fewer levels of indentation.  Let's put that in an `async` function, and see if it simplifies anything.

```js
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'w3d4';

const connectQueryAndPrint = async () => {
  // Use connect method to connect to the server
  const client = await MongoClient.connect(url);

  const db = client.db(dbName);
  const instruments = db.collection('instruments');

  const result = await instruments
    .find({ family: 'String' })
    .toArray();

  console.log(result);
}

connectQueryAndPrint();
```

[Here's a great video from jsconf budapest](https://youtu.be/726eZyVtC0Y)

## Sessions

We are able to make sessions work, this time via AJAX calls.  We can now authenticate just as we did before, but using AJAX instead of regular HTTP.  Even though we are communicating JSON over HTTP, it's still the same logic.

```js
// Login Server / index.js

const express = require('express');
const cookieSession = require('cookie-session');
const userService = require('./user-svc');
const bodyParser = require('body-parser');

const app = express();

const COOKIE_SECRET = 'extraordinary machine';

app.use(cookieSession({
  secret: 'extraordinary machine',
}));

app.use(bodyParser.json({}));

// Get my info if I am logged in.
app.get('/me', async (req, res) => {
  const user = await userService.getUserById(req.session.userId);
  if (user) {
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.sendStatus(401);
  }
});

// Log me in (with email and password)
app.post('/session', async (req, res) => {
  const { password, email } = req.body;
  const user = await userService.authenticateUser(email, password);
  if (user) {
    req.session.userId = user.id;
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// Log Me out
app.delete('/session', (req, res) => {
  req.session = null;
  res.sendStatus(200);
});

app.listen(3001, () => {
  console.log('Auth Server running on 3001');
});
```

So, how do we set up a client app to communicate with this?

## Create-React-App

Create React App is a really convenient way of creating, well, a React app.  Obviously.  It's a command line utility that creates React apps, complete with Webpack, Babel, the Jest testing utility, and automatic inclusion of CSS and SVG.

Once we're in we can run `npm start` to run a development version of our client app. That means that it will refresh when files change, and generally give us good visibility for debugging.  It runs on `localhost:3000` by default.  We can also run `npm run build` to create a production-ready version of our app that can be included with our server.

[Create React App on Github](https://github.com/facebook/create-react-app)

## HTTP Proxy

Well, we now our React App running on `localhost:3000`, and our API running on `localhost:3001`.  That creates a bit of problem when we're talking about HTTP. After all, we can't really talk cross-domain very easily.  Eventually, our HTTP server and client app will be on the same domain, but for now they're different.

Luckily, Webpack, and `create-react-app` extension make it easy to create a *proxy* when you're in development mode.  In this case, the proxy means that the client app will make a request to `http://localhost:3000/me`, and the development server that actually serves up the client app will take that request, then make a request of its own to `http://localhost:3001/me`.  Once the client dev server has the results, it returns that to the client, and the client is none the wiser.

You can set this up automatically in the `package.json` with `create-react-app`.  You can just add the proxy like below:

```js
{
  /* Rest of the package.json */
  "proxy": "http://localhost:3001"
}
```

## Login Flow

Now, we can do a check to see if we're logged in when the app loads. It's actually pretty simple: usually, with most data-driven React apps, there's an initial data get.  We basically see if that get results in a 200 or 401.  If it's a 401, then we know we have to log in.  Once we log in, we try that inital get again.  In this case, the initial get is to `/me`.

```jsx
class App extends Component {
  constructor(props) {
    super(props);
    this.state = { checking: true };
    this.tryLogin = this.tryLogin.bind(this);
    this.checkLoggedIn = this.checkLoggedIn.bind(this);
  }
  componentDidMount() {
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
      ((this.state.me) ?
        <h2>I am {this.state.me.email}</h2> :
        <Login tryLogin={this.tryLogin} />);
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        {loginSection}
      </div>
    );
  }
}

export default App;
```

With this basic setup, we can now connect to an API with authentication, and with an authentication that can persist.

## JWT

So how can we share that authentication across servers?  For instance, we may have an HTTP API and a WebSocket.  How do we connect to a WebSocket securely?  Well, we can create a *JSON Web Token*.  The idea is that it will have a series of *claims*, and a *signature*.  The claims could be anything, like

* A user id
* A user name
* Roles (e.g. Admin)
* Groups

I can add the following route to the login:

```js
app.post('/token', async (req, res) => {
  const userId = req.session.userId;
  const user = await userService.getUserById(userId);
  if (user) {
    res.send(jwt.sign({ id: user.id, email: user.email }, TOKEN_SECRET));
  } else {
    res.sendStatus(401);
  }
});
```

The signature is based on a secret.  The secret should be only known to the services using this authentication.  So we do a simple two step process:

* Request a token from `/token`
* Use that token while connecting to the websocket.

```jsx
import React from 'react';
import Axios from 'axios';

class Game extends React.Component {
  constructor() {
    super();
    this.state = { connected: false };
  }
  async componentDidMount() {
    const result = await Axios.post('/token');
    console.log('Token', result.data);
    this.socket = new WebSocket(`ws://localhost:3002?token=${result.data}asdf`);
    this.socket.onopen = () => {
      this.setState({ connected: true });
    };
    this.socket.onclose = () => {
      this.setState({ connected: false });
    };
  }
  render() {
    if (!this.state.connected) {
      return <h2>Connecting...</h2>;
    }
    return <h2>Connected</h2>;
  }
}

export default Game;
```

In the websocket, I make sure that the request has that token.  If they don't, I boot them.

```js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const TOKEN_SECRET = 'the idler wheel';

const wss = new WebSocket.Server({ port: 3002 });

function userFromUrl(url) {
  const tokenEqTokenRegEx = /token=([0-9a-z._-]+)/i;
  const execResults = tokenEqTokenRegEx.exec(url);
  if (!execResults) return false;
  try {
    const token = execResults[1];
    return jwt.verify(token, TOKEN_SECRET);
  } catch (e) {
    return false;
  }
}
wss.on('connection', (ws, req) => {
  console.log('Connected');
  const user = userFromUrl(req.url);
  if (!user) {
    ws.terminate();
    return;
  }
  console.log(user, new Date(user.iat * 1000));
  ws.on('close', () => {
    console.log('Disconnected');
  });
});

```