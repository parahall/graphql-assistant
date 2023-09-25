require('dotenv').config();
const express = require('express');
const makersAPI = require('./makers-api');
const vectorDbApi = require('./vector-db-api');
const graphqlAssistantAgent = require('./graphql-assistant-agent');
const app = express();
app.use(express.json());
const port = process.env.PORT;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/prompt', async (req, res) => {
  const prompt = req.body.prompt;
  const result = await makersAPI.prompt(prompt);
  res.status(200).json(result);
});

app.post('/generate_description', async (req, res) => {
  const result = await graphqlAssistantAgent.generateDescription();
  res.status(200).json(result);
});

app.post('/embeddings', async (req, res) => {
  const result = await makersAPI.embeddings(req.body.text);
  res.status(200).json(result);
});

app.post('/chat', async (req, res) => {
  const result = await makersAPI.chat();
  res.status(200).json(result);
});

app.post('/add-vectors', async (req, res) => {
  const result = await vectorDbApi.addVectors(req.body.data)
  res.status(200).json(result);
});

app.post('/search', async (req, res) => {
  const result = await vectorDbApi.queryVectors(req.body.text)
  res.status(200).json(result);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
