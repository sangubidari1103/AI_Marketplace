const acorn = require('acorn');
const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');

try {
  const ast = acorn.parse(content, { 
    ecmaVersion: 2022, 
    sourceType: 'module',
    allowReturnOutsideFunction: true,
    allowImportExportEverywhere: true
  });
  console.log('acorn parse OK');
} catch(e) {
  console.log('acorn error:', e.message);
  console.log('Location:', e.loc);
  console.log('Pos:', e.pos);
  console.log('Raised at:', e.raisedAt);
  
  // Show context around error
  const start = Math.max(0, e.pos - 100);
  const end = Math.min(content.length, e.pos + 100);
  console.log('Context:', JSON.stringify(content.slice(start, end)));
}