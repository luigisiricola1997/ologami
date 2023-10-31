import dotenv from 'dotenv'; 
import express, { Request, Response } from 'express';
import WebSocket from 'ws';
import http from 'http';
import { MongoClient, Db } from 'mongodb';
import OpenAI from 'openai';
import cors from 'cors';

dotenv.config();

const app = express();
const apiRouter = express.Router();

app.use(cors());
app.use('/api', apiRouter);

const port = 3000;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let logs: any[] = [];
let db: Db | null = null;
let wsServerIsRunning = false;

let retryCount = 0;
const maxRetries = 3;

async function connectToMongoDB() {
  const uri = "mongodb://root:root@ologami-mongodb:27017";
  try {
    const client = await MongoClient.connect(uri); // Rimuovi { useUnifiedTopology: true } se non è supportato
    console.log("Connesso con successo a ologami-mongodb");
    db = client.db("logger");
    retryCount = 0;
  } catch (err) {
    console.error("Errore durante la connessione a ologami-mongodb", err);
    retryCount++;
    if (retryCount <= maxRetries) {
      setTimeout(connectToMongoDB, 2000 * retryCount);
    } else {
      console.error("Raggiunto il numero massimo di tentativi di riconnessione a ologami-mongodb");
    }
  }
}

connectToMongoDB();

apiRouter.use(express.json());

apiRouter.get('/health', async (req: Request, res: Response) => {
  const healthStatus = {
    mongodb: false,
    websocket: false,
    websocketClients: 0
  };

  try {
    if (db) {
      await db.command({ ping: 1 });
      healthStatus.mongodb = true;
    }

    // Assuming wss is your WebSocket.Server instance
    healthStatus.websocketClients = wss.clients.size;
    if (healthStatus.websocketClients > 0 && wsServerIsRunning) {
      healthStatus.websocket = true;
    }

    res.status(200).json(healthStatus);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ error: `Healthcheck fallito: ${e.message}`, ...healthStatus });
    }
  }
});

apiRouter.post('/logger/log-analysis/ai', async (req: Request, res: Response) => {
  try {
    // 1. Prendi tutti i log creati oggi da MongoDB
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if(db) {
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
        4. Give me some code tips.
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

      if (chatCompletion && chatCompletion.choices && chatCompletion.choices[0] && chatCompletion.choices[0].message && chatCompletion.choices[0].message.content) {
        const analysis = chatCompletion.choices[0].message.content.trim();

        // 4. Salva l'analisi in ologami-mongodb
        const analysisCollection = db.collection('log-analysis');
        await analysisCollection.insertOne({ analysis, date: today.toISOString() });

        // 5. Invia l'analisi al frontend
        res.status(200).json({ analysis });
      }
    }
  } catch (error) {
    console.error("Si è verificato un errore:", error);
    res.status(500).json({ error: "Si è verificato un errore interno del server" });
  }
});

apiRouter.post('/logger/post-logs', async (req: Request, res: Response) => {
  const { message, type, timestamp } = req.body;
  logs.push({ message, type, timestamp });

  if(db) {
    const collection = db.collection('logs');
    try {
      await collection.insertOne({ message, type, timestamp });
      console.log("Log inserito con successo");
    } catch (err) {
      console.error("Errore durante l'inserimento del log", err);
    }

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(logs));
      }
    });

    res.status(200).send('Log ricevuto');
  }
});

apiRouter.post('/clear', (req: Request, res: Response) => {
  logs = [];
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(logs));
    }
  });
  res.status(200).send('Logs cleared');
});

app.use(express.static('public'));

const server: http.Server = http.createServer(app);
const wss: WebSocket.Server = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
  ws.send(JSON.stringify(logs));
});

server.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
  wsServerIsRunning = true;
});
