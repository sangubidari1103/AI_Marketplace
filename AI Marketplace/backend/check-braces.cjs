const fs = require('fs');
const content = fs.readFileSync('src/services/nemotron.js', 'utf8');
let openBraces = 0;
let openParens = 0;
let openBrackets = 0;
let inString = false;
let escape = false;
for (let i = 0; i < content.length; i++) {
  const c = content[i];
  if (!inString) {
    if (c === '"' || c === "'") { inString = true; escape = false; }
    else if (c === '{') openBraces++;
    else if (c === '}') openBraces--;
    else if (c === '(') openParens++;
    else if (c === ')') openParens--;
    else if (c === '[') openBrackets++;
    else if (c === ']') openBrackets--;
  } else {
    if (escape) { escape = false; }
    else if (c === '\\') escape = true;
    else if (c === '"' || c === "'") inString = false;
  }
  if (openBraces < 0) console.log('Unmatched } at', i);
  if (openParens < 0) console.log('Unmatched ) at', i);
  if (openBrackets < 0) console.log('Unmatched ] at', i);
}
console.log('Final: braces', openBraces, 'parens', openParens, 'brackets', openBrackets);