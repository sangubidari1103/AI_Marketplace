const acorn = require('acorn');
const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');

// Extract parseJsonFromContent function
const start = content.indexOf('function parseJsonFromContent');
const end = content.indexOf('}\n\n// Core NVIDIA API call');
const funcCode = content.slice(start, end + 1);

console.log('Function length:', funcCode.length);
console.log('First 200 chars:', funcCode.slice(0, 200));
console.log('Last 50 chars:', funcCode.slice(-50));

try {
  acorn.parse(funcCode, { ecmaVersion: 2022, sourceType: 'module' });
  console.log('OK');
} catch(e) {
  console.log('ERROR:', e.message, 'at', JSON.stringify(e.loc));
}