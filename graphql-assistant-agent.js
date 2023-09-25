const {promisify} = require('util');
const makersApi = require('./makers-api');

const fs = require('fs');
const csv = require('csv-parser');

const inputFile = 'assets/pre-process.csv';
const outputFile = 'assets/post-process.csv';
const writeFileAsync = promisify(fs.writeFile);

function createPrompt(query) {
  return 'You\'re an expert in GraphQL and intimately familiar with the monday.com API. \n' +
      'I have a GraphQL query from the monday.com API that I\'d like you to explain. \n' +
      'Please cover the query\'s purpose, the arguments it accepts, and the output it generates.\n' +
      '\n' +
      'Here is the GraphQL query:\n' +
      '\n' +
      '```graphql\n' +
      `${query}\n`;
}

// Function to sanitize the description for CSV
function sanitizeForCSV(description) {
  // Escape double quotes and enclose in double quotes
  return `"${description.replace(/"/g, '""')}"`;
}

async function generateDescription() {
  const rows = await readCSV(inputFile);
  const outputData = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const query = row.query;
    try {
      console.log(`Processing row ${i + 1} out of ${rows.length}`);
      const prompt = createPrompt(query);
      const result = await makersApi.prompt(prompt);
      const candidates = result[0].candidates;
      const sanitizedDesc = sanitizeForCSV(candidates[0].output);
      const sanitizedQuery = sanitizeForCSV(row.query);
      outputData.push({description: sanitizedDesc, query: sanitizedQuery});
    } catch (error) {
      console.error(`Error processing row with query: ${query}`, '\n', error);
    }
  }

  // Write the processed data to the output CSV file
  const csvData = outputData.map(
      (row) => `${row.description},${row.query}`).join('\n');
  try {
    await writeFileAsync(outputFile, csvData);
    console.log('Output file has been written successfully.');
  } catch (error) {
    console.error('Error writing to output file:', error);
  }
}

async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath).pipe(csv()).on('data', (row) => {
      rows.push(row);
    }).on('end', () => {
      resolve(rows);
    }).on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = {
  generateDescription,
};
