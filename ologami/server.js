const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

let logs = [];

// Connetti a MongoDB
let db;
const uri = "mongodb://root:root@mongodb-service:27017";
MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error("Errore durante la connessione a MongoDB", err);
    return;
  }
  console.log("Connesso con successo a MongoDB");
  db = client.db("nodejs-logger");
});

app.use(express.json());

app.get('/nodejs-logger', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify(logs));
});

app.post('/log', async (req, res) => {
  const { message, type, timestamp } = req.body;
  logs.push({ message, type, timestamp });

  // Salva il log in MongoDB
  if (db) {
    const collection = db.collection('logs');
    try {
      await collection.insertOne({ message, type, timestamp });
      console.log("Log inserito con successo");
    } catch (err) {
      console.error("Errore durante l'inserimento del log", err);
    }
  }

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
