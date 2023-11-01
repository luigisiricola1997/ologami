import dotenv from 'dotenv'; 
import { Router, Request, Response } from 'express';
import { mongodb } from '../../mongodb';
import { wss } from '../../websocket';
import { addLog, logs } from '../../logManager';
import { OpenAI } from "openai";
import WebSocket from 'ws';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const apiRouterLoggerPostLogs = Router();

apiRouterLoggerPostLogs.post('/logger/post-logs', async (req: Request, res: Response) => {
  const { message, type, timestamp } = req.body;

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
          client.send(JSON.stringify({ message, type, timestamp }));
        }
      });
    }

    res.status(200).send('Log ricevuto');
  }
});

export default apiRouterLoggerPostLogs;
