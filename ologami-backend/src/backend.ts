import dotenv from 'dotenv'; 
import express from 'express';
import http from 'http';
import cors from 'cors';
import apiRouter from './routes';
import { connectToMongoDB } from './mongodb';
import { initializeWebSocket } from './websocket';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', apiRouter);

const port = 3000;

connectToMongoDB();

const server: http.Server = http.createServer(app);

initializeWebSocket(server);

server.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
