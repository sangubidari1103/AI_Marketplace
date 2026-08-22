const acorn = require('acorn');

const code = `
function foo() {
    return 1
}

function bar() {
    return 2
}
`;

try {
  acorn.parse(code, { ecmaVersion: 2022, sourceType: 'script' });
  console.log('OK script');
} catch(e) {
  console.log('ERROR script:', e.message);
}

try {
  acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module' });
  console.log('OK module');
} catch(e) {
  console.log('ERROR module:', e.message);
}