const fs = require('fs');
const vm = require('vm');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');
const lines = content.split('\n');

const chunk = lines.slice(0, 110).join('\n');
try {
  new vm.Script(chunk);
  console.log('VM Script OK');
} catch(e) {
  console.log('VM Error:', e.message);
  console.log('Stack:', e.stack);
}