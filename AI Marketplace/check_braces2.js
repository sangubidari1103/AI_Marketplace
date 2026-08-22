const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');

let braceDepth = 0;
let inSingleQuote = false;
let inDoubleQuote = false;
let inTemplate = false;
let inTemplateExpr = false;
let templateExprDepth = 0;

const lines = content.split('\n');
let charIndex = 0;

lines.forEach((line, lineNum) => {
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    const next = line[i+1];
    
    if (inTemplate) {
      if (c === '`' && (i === 0 || line[i-1] !== '\\')) {
        inTemplate = false;
      } else if (c === '$' && next === '{') {
        inTemplateExpr = true;
        templateExprDepth = 1;
        i++;
      }
    } else if (inTemplateExpr) {
      if (c === '{') templateExprDepth++;
      else if (c === '}') {
        templateExprDepth--;
        if (templateExprDepth === 0) inTemplateExpr = false;
      }
    } else if (inSingleQuote) {
      if (c === "'" && (i === 0 || line[i-1] !== '\\')) inSingleQuote = false;
    } else if (inDoubleQuote) {
      if (c === '"' && (i === 0 || line[i-1] !== '\\')) inDoubleQuote = false;
    } else {
      if (c === "'") inSingleQuote = true;
      else if (c === '"') inDoubleQuote = true;
      else if (c === '`') inTemplate = true;
      else if (c === '{') braceDepth++;
      else if (c === '}') braceDepth--;
    }
    
    if (braceDepth < 0) console.log('Negative brace at line', lineNum+1, 'char', i);
  }
  
  if (line.includes('export')) {
    console.log('Line', lineNum+1, 'export - braceDepth:', braceDepth, line.trim());
  }
  if (braceDepth > 0 && lineNum < 100) {
    console.log('Line', lineNum+1, 'braceDepth:', braceDepth, line.trim().slice(0, 80));
  }
});

console.log('Final braceDepth:', braceDepth);