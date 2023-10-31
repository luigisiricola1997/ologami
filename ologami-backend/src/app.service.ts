import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { OpenAI } from 'openai';
import { MongoClient, Db } from 'mongodb';
import { Server, WebSocket } from 'ws';

@Injectable()
export class AppService implements OnModuleInit {
  private openai: OpenAI;
  private logs: any[] = [];
  private db: Db;
  private retryCount = 0;
  private maxRetries = 3;
  private wss: Server;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({ apiKey: this.configService.get<string>('OPENAI_API_KEY') });
    this.wss = new Server({ noServer: true });
  }

  async onModuleInit() {
    await this.connectToMongoDB();
  }

  async connectToMongoDB() {
    const uri = 'mongodb://root:root@ologami-mongodb:27017';
    try {
      const client = await MongoClient.connect(uri);
      console.log('Successfully connected to MongoDB');
      this.db = client.db('logger');
      this.retryCount = 0;
    } catch (err) {
      console.error('Error connecting to MongoDB', err);
      this.retryCount++;
      if (this.retryCount <= this.maxRetries) {
        setTimeout(() => this.connectToMongoDB(), 2000 * this.retryCount);
      } else {
        console.error('Reached max number of retries to connect to MongoDB');
      }
    }
  }

  async checkHealth() {
    try {
      await this.db.command({ ping: 1 });
      return 'OK';
    } catch (e) {
      return 'MongoDB Disconnected';
    }
  }

  async analyzeLogs() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const logCollection = this.db.collection('logs');
      const logs = await logCollection.find().toArray();
      const logMessages = logs.map(log => log.message);
      const prompt = `Analyze these logs:\n${logMessages.join('\n')}`;
      const chatCompletion = await this.openai.chat.completions.create({
        messages: [
          { role: "user", content: prompt }
        ],
        model: "gpt-3.5-turbo"
      });
      const analysis = chatCompletion.choices[0].message.content.trim();
      const analysisCollection = this.db.collection('log-analysis');
      await analysisCollection.insertOne({ analysis, date: today.toISOString() });
      return { analysis };
    } catch (error) {
      console.error("An error occurred:", error);
      return { error: "An internal server error occurred" };
    }
  }

  async postLogs(logData: any) {
    this.logs.push(logData);
    const collection = this.db.collection('logs');
    await collection.insertOne(logData);
    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(this.logs));
      }
    });
    return 'Log received';
  }

  clearLogs() {
    this.logs = [];
    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(this.logs));
      }
    });
    return 'Logs cleared';
  }
}
