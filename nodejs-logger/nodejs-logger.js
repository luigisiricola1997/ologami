const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Funzione per loggare su entrambi: file e console
const logMessage = (message) => {
  console.log(message);
  fs.appendFileSync(path.join(__dirname, 'logs', 'error.log'), message + '\n');
};

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use((req, res, next) => {
  const errorMessage = `Errore 404: Pagina ${req.url} non trovata`;
  logMessage(errorMessage);
  res.status(404).send(errorMessage);
});

app.listen(port, () => {
  const startupMessage = `Server in ascolto sulla porta ${port}`;
  logMessage(startupMessage);
});
