const acorn = require('acorn');

const code = `
function foo() {
    return 1
}

function bar() {
`;

try {
  acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module' });
  console.log('OK');
} catch(e) {
  console.log('ERROR:', e.message, 'at', JSON.stringify(e.loc));
}