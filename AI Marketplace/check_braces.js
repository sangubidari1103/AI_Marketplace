const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');

let braceDepth = 0;
let parenDepth = 0;
let bracketDepth = 0;
let inSingleQuote = false;
let inDoubleQuote = false;
let inTemplate = false;
let inTemplateExpr = false;
let templateExprDepth = 0;

for (let i = 0; i < content.length; i++) {
  const c = content[i];
  const next = content[i+1];
  
  if (inTemplate) {
    if (c === '`' && content[i-1] !== '\\') {
      inTemplate = false;
    } else if (c === '$' && next === '{') {
      inTemplateExpr = true;
      templateExprDepth = 1;
      i++;
    }
    continue;
  }
  if (inTemplateExpr) {
    if (c === '{') templateExprDepth++;
    else if (c === '}') {
      templateExprDepth--;
      if (templateExprDepth === 0) inTemplateExpr = false;
    }
    continue;
  }
  if (inSingleQuote) {
    if (c === "'" && content[i-1] !== '\\') inSingleQuote = false;
    continue;
  }
  if (inDoubleQuote) {
    if (c === '"' && content[i-1] !== '\\') inDoubleQuote = false;
    continue;
  }
  
  if (c === "'") { inSingleQuote = true; continue; }
  if (c === '"') { inDoubleQuote = true; continue; }
  if (c === '`') { inTemplate = true; continue; }
  
  if (c === '{') braceDepth++;
  else if (c === '}') braceDepth--;
  else if (c === '(') parenDepth++;
  else if (c === ')') parenDepth--;
  else if (c === '[') bracketDepth++;
  else if (c === ']') bracketDepth--;
  
  if (braceDepth < 0) { console.log('Negative brace at', i); break; }
  if (parenDepth < 0) { console.log('Negative paren at', i); break; }
  if (bracketDepth < 0) { console.log('Negative bracket at', i); break; }
  
  if (i > 19000 && content.slice(i, i+6) === 'export') {
    console.log('At export - brace:', braceDepth, 'paren:', parenDepth, 'bracket:', bracketDepth);
  }
}
console.log('Final - brace:', braceDepth, 'paren:', parenDepth, 'bracket:', bracketDepth);