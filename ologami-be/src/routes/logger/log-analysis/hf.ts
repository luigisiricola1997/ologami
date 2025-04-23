import dotenv from 'dotenv';
import { Router, Request, Response } from 'express';
import { mongodb } from '../../../mongodb';
import axios, { AxiosResponse } from 'axios';

dotenv.config();

const HF_API_URL = `https://api-inference.huggingface.co/models/${process.env.HF_MODEL}`;
const HF_AUTH_TOKEN = process.env.HF_AUTH_TOKEN;

if (!HF_AUTH_TOKEN) {
  throw new Error("HF_AUTH_TOKEN non definito. Verifica il file .env o la configurazione delle variabili d'ambiente.");
}

if (!process.env.HF_MODEL) {
  throw new Error("HF_MODEL non definito. Verifica il file .env o la configurazione delle variabili d'ambiente.");
}

const apiRouterLoggerLogAnalysisHF = Router();
interface LogDocument {
  message: string;
  timestamp: string;
}

const generatePrompt = (logMessages: string[]): string => `
  I have an application, and I am encountering repeated error logs like these:
  - ${logMessages.join('\n- ')}

  What could be causing these errors? How can I debug and fix them?
`;

apiRouterLoggerLogAnalysisHF.post('/logger/log-analysis/hf', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (!mongodb) {
      console.error("Connessione al database non disponibile.");
      return res.status(500).json({ error: "Connessione al database non disponibile" });
    }

    const logCollection = mongodb.collection<LogDocument>('logs');
    const logs = await logCollection.find({
      timestamp: {
        $gte: today.toISOString(),
        $lt: tomorrow.toISOString(),
      },
    }).toArray();

    const logMessages = logs.slice(0, 10).map((log) => log.message);
    const prompt = generatePrompt(logMessages);

    console.log("Prompt inviato all'API Hugging Face:", prompt);

    const response: AxiosResponse = await axios.post(
      HF_API_URL,
      {
        inputs: prompt,
        parameters: {
          max_length: 1024,
          temperature: 0.7,
          top_p: 0.9,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_AUTH_TOKEN}`,
        },
        timeout: 30000,
      }
    );

    if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].generated_text) {
      const analysis = response.data[0].generated_text.trim();

      console.log("Risultato ricevuto dall'API Hugging Face:", analysis);

      const analysisCollection = mongodb.collection('log-analysis');
      await analysisCollection.insertOne({ analysis, date: today.toISOString() });

      return res.status(200).json({ analysis });
    } else {
      console.error("La risposta del modello è vuota o non valida:", response.data);
      return res.status(500).json({ error: "La risposta del modello è vuota o non valida" });
    }
  } catch (error: any) {
    console.error("Errore durante la richiesta:", error.message || error);

    if (axios.isAxiosError(error)) {
      console.error("Errore Axios:", error.response?.status, error.response?.data);
    }

    return res.status(500).json({ error: "Si è verificato un errore interno del server" });
  }
});

export default apiRouterLoggerLogAnalysisHF;
