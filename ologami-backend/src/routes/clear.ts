import { Router, Request, Response } from 'express';
import { clearLogs } from '../logManager';

const apiRouterClear = Router();

apiRouterClear.post('/clear', (req: Request, res: Response) => {
  clearLogs();
});

export default apiRouterClear;
