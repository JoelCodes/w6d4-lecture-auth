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

