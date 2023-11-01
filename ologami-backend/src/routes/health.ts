import { Router, Request, Response } from 'express';
import { mongodb } from '../mongodb';
import { wss, wsServerIsRunning } from '../websocket';

const apiRouterHealth = Router();

apiRouterHealth.get('/health', async (req: Request, res: Response) => {
  const healthStatus = {
    mongodb: false,
    websocket: wsServerIsRunning,
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

export default apiRouterHealth;
