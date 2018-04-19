const express = require('express');
const cookieSession = require('cookie-session');
const userService = require('./user-svc');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('build'));

const COOKIE_SECRET = 'extraordinary machine';
const TOKEN_SECRET = 'the idler wheel';

app.use(cookieSession({
  secret: COOKIE_SECRET,
}));

app.use(bodyParser.json({}));

app.post('/token', async (req, res) => {
  const userId = req.session.userId;
  const user = await userService.getUserById(userId);
  if (user) {
    res.send(jwt.sign({ id: user.id, email: user.email }, TOKEN_SECRET));
  } else {
    res.sendStatus(401);
  }
});

app.get('/me', async (req, res) => {
  const user = await userService.getUserById(req.session.userId);
  if (user) {
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.sendStatus(401);
  }
});

app.route('/session')
  .post(async (req, res) => {
    const { password, email } = req.body;
    const user = await userService.authenticateUser(email, password);
    if (user) {
      req.session.userId = user.id;
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  })
  .delete((req, res) => {
    req.session = null;
    res.sendStatus(200);
  });

app.listen(3001, () => {
  console.log('Auth Server running on 3001');
});
