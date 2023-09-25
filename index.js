require('dotenv').config();
const express = require('express');
const makersAPI = require('./makers-api');
const vectorDbApi = require('./vector-db-api');
const graphqlAssistantAgent = require('./graphql-assistant-agent');
const app = express();
app.use(express.json());
const port = process.env.PORT;

app.post('/generate_description', async (req, res) => {
  const result = await graphqlAssistantAgent.generateDescription();
  res.status(200).json(result);
});

app.post('/fill_index_with_vectors', async (req, res) => {
  const result = await graphqlAssistantAgent.fillIndexWithVectors()
  res.status(200).json(result);
});


app.get('/search', async (req, res) => {
  const result = await graphqlAssistantAgent.getGraphQLQuery(req.body.text , true)
  res.status(200).json(result);
});
app.get('/search_no_data', async (req, res) => {
  const result = await graphqlAssistantAgent.getGraphQLQuery(req.body.text , false)
  res.status(200).json(result);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
