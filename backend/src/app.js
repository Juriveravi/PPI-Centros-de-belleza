require('dotenv').config({
  path: require('path').resolve(
    __dirname,
    '../PPI-Centros-de-belleza/backend/documents/.env'
  )
});

const express = require('express');

const app = express();

app.use(express.json());

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});