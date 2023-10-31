import WebSocket from 'ws';
import http from 'http';
import { getLogs } from './logManager'; 

export let wss: WebSocket.Server | null = null;
export let wsServerIsRunning = false;

export function initializeWebSocket(server: http.Server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws: WebSocket) => {
    ws.send(JSON.stringify(getLogs()));
  });

  wsServerIsRunning = true;
}
