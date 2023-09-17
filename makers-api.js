const {GooglePaLM} = require('langchain/llms/googlepalm');
const {GooglePaLMEmbeddings} = require('langchain/embeddings/googlepalm');

const prompt = async () => {
  const model = new GooglePaLM({
    apiKey: process.env.GOOGLE_PALM_API_KEY,
    temperature: 0.01, // OPTIONAL
    modelName: 'models/text-bison-001', // OPTIONAL
  });
  const res = await model.call(
      'What would be a good company name for a company that makes colorful socks?');
  console.log({res});
  return res;
};

const embeddings = async () => {
  const model = new GooglePaLMEmbeddings({
    apiKey: process.env.GOOGLE_PALM_API_KEY,
    modelName: 'models/embedding-gecko-001',
  });
  /* Embed queries */
  const res = await model.embedQuery(
      'What would be a good company name for a company that makes colorful socks?',
  );
  console.log({res});
  return res;
};

module.exports = {
  prompt,
  embeddings,
};
