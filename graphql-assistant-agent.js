const {promisify} = require('util');
const fs = require('fs');
const csv = require('csv-parser');

const makersApi = require('./makers-api');
const vectorDbApi = require("./vector-db-api");

const inputFile = 'assets/pre-process.csv';
const outputFile = 'assets/post-process.csv';
const writeFileAsync = promisify(fs.writeFile);

function getSearchGraphQLPrompt(text, similarQueries) {
    let similarQueriesText = ""
    if (similarQueriesText.length > 0) {
        similarQueriesText = 'For contextual understanding, consider the following known queries that have similar purpose: \n'
    }
    similarQueries.forEach((query, index) => {
        similarQueriesText += `#### Set ${index + 1}:\n` + `Query: '''\n${query.query}'''\n`
    });
    return 'Your task: Given the user\'s free-text sentence below, convert it into a valid GraphQL query using the monday.com API. ' +
        'Incorporate any specific parameters like \'board IDs\',\'column ids\', \'column values\', etc., mentioned in the user\'s description into the resulting GraphQL query. Output the query only, nothing else.\n'
        + '\n' + 'User\'s Query Description:\n' + `'''${text}'''` + '\n' + `${similarQueriesText}` + '\n' + 'REMEMBER, to return only a GraphQL valid query.\n' + '\n' + 'Your GraphQL query:';
}

async function getGraphQLQuery(text, shouldUseSimilarQueries) {
    let similarQueries = []
    if (shouldUseSimilarQueries) {
        const response = await vectorDbApi.queryVectors(text, 6);
        similarQueries = response.matches.map((vector) => {
            return {
                query: vector.metadata.query, description: vector.metadata.description,
            }
        });
    }

    const prompt = getSearchGraphQLPrompt(text, similarQueries);
    console.log("Prompt is:", prompt)
    const result = await makersApi.prompt(prompt, {temperature: 0.1});
    console.log("Result is:", JSON.stringify(result));
    if (result && result[0].candidates) {
        return {
            query: cleanFormattingCharacters(result[0].candidates[0].output)
        }
    } else {
        return {
            query: ""
        }
    }
}

function cleanFormattingCharacters(string) {
    return string.replace(/\s+/g, ' ');
}


function createPrompt(query) {
    return 'You\'re an expert in GraphQL and intimately familiar with the monday.com API. \n' + 'I have a GraphQL query from the monday.com API that I\'d like you to explain. \n' + 'Please cover the query\'s purpose, the arguments it accepts, and the output it generates.\n' + '\n' + 'Here is the GraphQL query:\n' + '\n' + '```graphql\n' + `${query}\n`;
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
    const csvData = outputData.map((row) => `${row.description},${row.query}`).join('\n');
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

async function fillIndexWithVectors() {
    const rows = await readCSV(outputFile)
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const item = {
            id: i, description: row.description, query: row.query
        }
        try {
            console.log(`Processing row ${i + 1} out of ${rows.length}`);
            const index = await vectorDbApi.addVectors([item]);
            console.log(`Vector added to DB for row ${i + 1}`)
        } catch (error) {
            console.error(`Error processing row with values: ${item}`, '\n', error);
        }
    }
    return 'Success';
}

module.exports = {
    generateDescription, fillIndexWithVectors, getGraphQLQuery
};
