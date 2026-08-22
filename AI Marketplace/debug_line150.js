const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');
const lines = content.split('\n');
const line = lines[149]; // line 150 (0-indexed)

console.log('Line 150:', JSON.stringify(line));
console.log('Chars:');
for (let i = 0; i < line.length; i++) {
  const c = line[i];
  const code = c.charCodeAt(0);
  console.log(`  [${i}] "${c}" (U+${code.toString(16).toUpperCase().padStart(4, '0')})`);
}