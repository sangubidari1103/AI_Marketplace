const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');
const lines = content.split('\n');
const line = lines[149]; // line 150

let inSingleQuote = false;
let inDoubleQuote = false;
let inTemplate = false;
let inTemplateExpr = false;
let templateExprDepth = 0;

console.log('Parsing line:', JSON.stringify(line));
console.log('');

for (let i = 0; i < line.length; i++) {
  const c = line[i];
  const next = line[i+1];
  
  let action = '';
  
  if (inTemplate) {
    if (c === '`' && (i === 0 || line[i-1] !== '\\')) {
      inTemplate = false;
      action = 'CLOSE_TEMPLATE';
    } else if (c === '$' && next === '{') {
      inTemplateExpr = true;
      templateExprDepth = 1;
      i++;
      action = 'OPEN_TEMPLATE_EXPR (skip {)';
    }
  } else if (inTemplateExpr) {
    if (c === '{') {
      templateExprDepth++;
      action = `TEMPLATE_EXPR_DEPTH++ (${templateExprDepth})`;
    } else if (c === '}') {
      templateExprDepth--;
      action = `TEMPLATE_EXPR_DEPTH-- (${templateExprDepth})`;
      if (templateExprDepth === 0) {
        inTemplateExpr = false;
        action += ' -> EXIT_TEMPLATE_EXPR';
      }
    }
  } else if (inSingleQuote) {
    if (c === "'" && (i === 0 || line[i-1] !== '\\')) {
      inSingleQuote = false;
      action = 'CLOSE_SINGLE_QUOTE';
    }
  } else if (inDoubleQuote) {
    if (c === '"' && (i === 0 || line[i-1] !== '\\')) {
      inDoubleQuote = false;
      action = 'CLOSE_DOUBLE_QUOTE';
    }
  } else {
    if (c === "'") { inSingleQuote = true; action = 'OPEN_SINGLE_QUOTE'; }
    else if (c === '"') { inDoubleQuote = true; action = 'OPEN_DOUBLE_QUOTE'; }
    else if (c === '`') { inTemplate = true; action = 'OPEN_TEMPLATE'; }
  }
  
  if (action) {
    console.log(`  [${i}] "${c}" -> ${action} | inTemplate:${inTemplate} inTemplateExpr:${inTemplateExpr} depth:${templateExprDepth}`);
  }
}

console.log('');
console.log('Final state: inTemplate:', inTemplate, 'inTemplateExpr:', inTemplateExpr, 'depth:', templateExprDepth);