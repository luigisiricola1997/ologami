import { Router, Request, Response } from 'express';
import { mongodb } from '../../../mongodb';
import { OpenAI } from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const apiRouterLoggerLogAnalysisAi = Router();

apiRouterLoggerLogAnalysisAi.post('/logger/log-analysis/cgpt', async (req: Request, res: Response) => {
    try {
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

            const chatCompletion = await openai.chat.completions.create({
                messages: [
                    { role: "user", content: prompt }
                ],
                model: `${process.env.OPENAI_MODEL}`
            });

            console.log("Valore di logMessages:", logMessages);
            console.log("Prompt inviato:", prompt);

            if (chatCompletion && chatCompletion.choices && chatCompletion.choices[0] && chatCompletion.choices[0].message && chatCompletion.choices[0].message.content) {
                const analysis = chatCompletion.choices[0].message.content.trim();

                const analysisCollection = mongodb.collection('log-analysis');
                await analysisCollection.insertOne({ analysis, date: today.toISOString() });

                res.status(200).json({ analysis });
            }
        }
    } catch (error) {
        console.error("Si è verificato un errore:", error);
        res.status(500).json({ error: "Si è verificato un errore interno del server" });
    }
});

export default apiRouterLoggerLogAnalysisAi;
