import dotenv from 'dotenv'; 
import express from 'express';
import http from 'http';
import cors from 'cors';
import { connectToMongoDB } from './mongodb';
import { initializeWebSocket } from './websocket';
import apiRouterHealth from './routes/health';
import apiRouterClear from './routes/clear';
import apiRouterLoggerLogAnalysisAi from './routes/logger/log-analysis/ai';
import apiRouterLoggerPostLogs from './routes/logger/post-logs';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(
  '/api',
  apiRouterHealth,
  apiRouterClear,
  apiRouterLoggerLogAnalysisAi,
  apiRouterLoggerPostLogs
);

const port = 3000;

connectToMongoDB();

const server: http.Server = http.createServer(app);

initializeWebSocket(server);

server.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
