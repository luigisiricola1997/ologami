const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/log', (req, res) => {
  const { message, type, timestamp } = req.body;
  console.log(`Log ricevuto: ${message}, Tipo: ${type}, Timestamp: ${timestamp}`);
  res.status(200).send('Log ricevuto');
});

app.listen(port, () => {
  console.log(`Server di log in ascolto sulla porta ${port}`);
});
