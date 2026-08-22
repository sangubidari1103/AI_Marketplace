const acorn = require('acorn');
const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');
const lines = content.split('\n');

const chunk = lines.slice(0, 110).join('\n');
try {
  acorn.parse(chunk, { ecmaVersion: 2022, sourceType: 'module' });
  console.log('OK');
} catch(e) {
  console.log('ERROR:', e.message, 'at', JSON.stringify(e.loc));
}