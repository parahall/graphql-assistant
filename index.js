require('dotenv').config();
const express = require('express');
const makersAPI = require('./makers-api');
const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/generate', async (req, res) => {
  const result = await makersAPI.prompt();
  res.status(200).send(result);
});

app.post('/embeddings', async (req, res) => {
  const result = await makersAPI.embeddings();
  res.status(200).send(result);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
