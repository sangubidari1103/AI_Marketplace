const acorn = require('acorn');
const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');

// Binary search for the syntax error
function testChunk(endLine) {
  const lines = content.split('\n');
  const chunk = lines.slice(0, endLine).join('\n');
  try {
    acorn.parse(chunk, { ecmaVersion: 2022, sourceType: 'module', allowReturnOutsideFunction: true });
    return { ok: true };
  } catch(e) {
    return { ok: false, error: e.message, loc: e.loc, pos: e.pos };
  }
}

// Test various endpoints
const testLines = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 587];
for (const line of testLines) {
  const result = testChunk(line);
  console.log(`Lines 1-${line}:`, result.ok ? 'OK' : `ERROR - ${result.error} at ${JSON.stringify(result.loc)}`);
}