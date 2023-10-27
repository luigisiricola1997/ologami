require('dotenv').config();

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const { MongoClient } = require('mongodb');
const OpenAI = require('openai');

const app = express();
const port = 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  db = client.db("logger");
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Ologami');
});

app.get('/logger', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/logger/log-analysis/ai', async (req, res) => {
  try {
    // 1. Prendi tutti i log creati oggi da MongoDB
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const logCollection = db.collection('logs');
    const logs = await logCollection.find({
      timestamp: {
        $gte: today.toISOString(),
        $lt: tomorrow.toISOString()
      }
    }).toArray();

    // 2. Prepara il prompt per ChatGPT
    const logMessages = logs.map(log => log.message);
    const prompt = `
      I have an app in nodejs.
      I have these error logs:
      - ${logMessages.join('\n- ')}

      Answer these questions:

      1. Why do I have this error?
      2. What should I evaluate in order to solve it?
      3. Give me some predictive analysis of what might happen if I ignore this error.
    `;

    // 3. Invia il prompt a ChatGPT
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo"
    });

    console.log("Valore di logMessages:", logMessages);
    console.log("Prompt inviato:", prompt);

    const analysis = chatCompletion.choices[0].message.content.trim();

    // 4. Salva l'analisi in MongoDB
    const analysisCollection = db.collection('log-analysis');
    await analysisCollection.insertOne({ analysis, date: today.toISOString() });

    // 5. Invia l'analisi al frontend
    res.status(200).json({ analysis });

  } catch (error) {
    console.error("Si è verificato un errore:", error);
    res.status(500).json({ error: "Si è verificato un errore interno del server" });
  }
  res.status(200).json({ analysis });
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
