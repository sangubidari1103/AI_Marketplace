const acorn = require('acorn');
const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');

const start = content.indexOf('function parseJsonFromContent');
const end = content.indexOf('}\n\n// Core NVIDIA API call');
const funcCode = content.slice(start, end + 1);

const lines = funcCode.split('\n');
lines.forEach((line, i) => {
  console.log(`${String(i+1).padStart(3)}: ${line}`);
});