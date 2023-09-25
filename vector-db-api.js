const {Pinecone} = require('@pinecone-database/pinecone');
const makersAPI = require('./makers-api');

const addVectors = async (items) => {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }
  const pinecone = new Pinecone();
  const records = await Promise.all(
      items.map(async (item) => {
        const values = (await makersAPI.embeddings(item.description)).value;
        return {
          id: item.id.toString(),
          values: values,
          metadata: {
            ...item,
          },
        };
      }),
  );

  const index = pinecone.index('monday-com-graphql-query');
  await index.upsert(records);
};

const queryVectors = async (text) => {
  const pinecone = new Pinecone();
  const vector = (await makersAPI.embeddings(text)).value;
  const index = pinecone.index('monday-com-graphql-query');
  const results = await index.query({
    topK: 4,
    vector,
    includeMetadata: true,
  });
  console.log(JSON.stringify(results));
  return results;
};

module.exports = {
  addVectors,
  queryVectors,
};
