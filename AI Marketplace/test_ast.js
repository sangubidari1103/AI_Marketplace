const acorn = require('acorn');
const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');
const lines = content.split('\n');

const chunk = lines.slice(0, 109).join('\n');
try {
  const ast = acorn.parse(chunk, { ecmaVersion: 2022, sourceType: 'module' });
  console.log('Parsed OK');
  console.log('Body length:', ast.body.length);
  ast.body.forEach((node, i) => {
    console.log(`  [${i}] ${node.type}: ${node.id?.name || node.declarations?.[0]?.id?.name || 'anonymous'}`);
  });
} catch(e) {
  console.log('ERROR:', e.message, 'at', JSON.stringify(e.loc));
}