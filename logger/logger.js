const express = require('express');
const axios = require('axios');

const app = express();
const port = 3001;

const logMessage = (message) => {
  console.log(message);
};

app.get('/', (req, res) => {
  res.send('Logger');
});

app.use(async (req, res, next) => {
  const errorMessage = `Errore 404: Pagina ${req.url} non trovata`;
  logMessage(errorMessage);

  try {
    await axios.post('http://ologami-backend/api/logger/post-logs', {
      message: errorMessage,
      type: 'error',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Errore durante l\'invio del log:', error);
  }

  res.status(404).send(errorMessage);
});

app.listen(port, () => {
  const startupMessage = `Server in ascolto sulla porta ${port}`;
  logMessage(startupMessage);
});
