import dotenv from 'dotenv'; 
import { Router, Request, Response } from 'express';
import { mongodb } from './mongodb';
import { wss, wsServerIsRunning } from './websocket';
import { addLog, clearLogs, logs } from './logManager';
import { OpenAI } from "openai";
import WebSocket from 'ws';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const apiRouter = Router();

apiRouter.get('/health', async (req: Request, res: Response) => {
  const healthStatus = {
    mongodb: false,
    websocket: wsServerIsRunning,  // Usa direttamente la variabile wsServerIsRunning
    websocketClients: 0
  };

  try {
    if (mongodb) {
      await mongodb.command({ ping: 1 });
      healthStatus.mongodb = true;
    }

    if (wss) {
      healthStatus.websocketClients = wss.clients.size;
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
    if(mongodb) {
      const logCollection = mongodb.collection('logs');
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
        const analysisCollection = mongodb.collection('log-analysis');
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
  addLog({ message, type, timestamp });
  logs.push({ message, type, timestamp });

  if(mongodb) {
    const collection = mongodb.collection('logs');
    try {
      await collection.insertOne({ message, type, timestamp });
      console.log("Log inserito con successo");
    } catch (err) {
      console.error("Errore durante l'inserimento del log", err);
    }
    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(logs));
        }
      });
    }

    res.status(200).send('Log ricevuto');
  }
});

apiRouter.post('/clear', (req: Request, res: Response) => {
  clearLogs();
});

export default apiRouter;
