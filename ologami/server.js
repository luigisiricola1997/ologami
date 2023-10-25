const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const port = 3000;

let logs = [];

app.use(express.json());

app.get('/nodejs-logger', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify(logs));
});

app.post('/log', (req, res) => {
  const { message, type, timestamp } = req.body;
  logs.push({ message, type, timestamp });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(logs));
    }
  });
  res.status(200).send('Log ricevuto');
});

app.post('/clear', (req, res) => {
  logs = [];
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(logs));
    }
  });
  res.status(200).send('Logs cleared');
});

app.use(express.static('public'));

server.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
