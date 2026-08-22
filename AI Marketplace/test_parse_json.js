const acorn = require('acorn');
const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');
const lines = content.split('\n');

// Test with a few more lines of parseJsonFromContent
for (let endLine = 110; endLine <= 120; endLine++) {
  const chunk = lines.slice(0, endLine).join('\n');
  try {
    acorn.parse(chunk, { ecmaVersion: 2022, sourceType: 'module' });
    console.log(`Lines 1-${endLine}: OK`);
  } catch(e) {
    console.log(`Lines 1-${endLine}: ERROR - ${e.message} at ${JSON.stringify(e.loc)}`);
  }
}