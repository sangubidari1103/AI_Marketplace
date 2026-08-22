const acorn = require('acorn');
const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');
const lines = content.split('\n');

// Test parsing exactly up to line 56 (where EXTRACTION_PROMPT closes)
for (let endLine of [56, 57, 58, 59, 60, 70, 80, 90, 93, 94, 95]) {
  const chunk = lines.slice(0, endLine).join('\n');
  try {
    acorn.parse(chunk, { ecmaVersion: 2022, sourceType: 'module', allowReturnOutsideFunction: true });
    console.log(`Lines 1-${endLine}: OK`);
  } catch(e) {
    console.log(`Lines 1-${endLine}: ERROR - ${e.message} at ${JSON.stringify(e.loc)}`);
  }
}