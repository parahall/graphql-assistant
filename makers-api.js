const {TextServiceClient} = require('@google-ai/generativelanguage').v1beta2;
const {GoogleAuth} = require('google-auth-library');
const {DiscussServiceClient} = require('@google-ai/generativelanguage');

const chat = async () => {
  const MODEL_NAME = 'models/chat-bison-001';
  const API_KEY = process.env.GOOGLE_PALM_API_KEY;

  const client = new DiscussServiceClient({
    authClient: new GoogleAuth().fromAPIKey(API_KEY),
  });

  const result = await client.generateMessage({
    model: MODEL_NAME,
    temperature: 0.5, // Optional. Value `0.0` always uses the highest-probability result.
    candidateCount: 1, // Optional. The number of candidate results to generate.
    prompt: {
      // optional, preamble context to prime responses
      context: 'Respond to all questions with a rhyming poem.',
      // Optional. Examples for further fine-tuning of responses.
      examples: [
        {
          input: {content: 'What is the capital of California?'},
          output: {
            content:
                `If the capital of California is what you seek,
Sacramento is where you ought to peek.`,
          },
        },
      ],
      // Required. Alternating prompt/response messages.
      messages: [{content: 'How tall is the Eiffel Tower?'}],
    },
  });

  console.log(result[0].candidates[0].content);
  return result;
};

const prompt = async (prompt) => {
  const MODEL_NAME = 'models/text-bison-001';
  const API_KEY = process.env.GOOGLE_PALM_API_KEY;

  const client = new TextServiceClient({
    authClient: new GoogleAuth().fromAPIKey(API_KEY),
  });

  console.log('Calling GenerateText.');
  const result = await client.generateText({
    model: MODEL_NAME,
    prompt: {
      text: prompt,
    },
  });
  console.log('Result:', JSON.stringify(result));
  return result;
};

const embeddings = async (text) => {
  const MODEL_NAME = 'models/embedding-gecko-001';
  const API_KEY = process.env.GOOGLE_PALM_API_KEY;

  const client = new TextServiceClient({
    authClient: new GoogleAuth().fromAPIKey(API_KEY),
  });

  const result = await client.embedText({
    model: MODEL_NAME,
    text: text,
  });

  // console.log(JSON.stringify(result[0].embedding.value));
  return result[0].embedding;
};

module.exports = {
  prompt,
  embeddings,
  chat,
};
