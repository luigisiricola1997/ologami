export let logs: any[] = [];

export function addLog(log: any) {
  logs.push(log);
}

export function clearLogs() {
  logs = [];
}

export function getLogs() {
  return logs;
}
