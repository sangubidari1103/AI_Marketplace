const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');
const backtick = '`';

let positions = [];
for (let i = 0; i < content.length; i++) {
  if (content[i] === backtick) {
    positions.push(i);
  }
}
console.log('Total backticks:', positions.length);
if (positions.length % 2 !== 0) {
  console.log('ODD number of backticks - unclosed template literal!');
  let inTemplate = false;
  let start = -1;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === backtick && (i === 0 || content[i-1] !== '\\')) {
      if (!inTemplate) {
        inTemplate = true;
        start = i;
      } else {
        inTemplate = false;
        start = -1;
      }
    }
  }
  if (inTemplate) {
    let line = content.slice(0, start).split('\n').length;
    console.log('Unclosed template starts at char', start, 'line', line);
    console.log('Content:', JSON.stringify(content.slice(start, start+200)));
  }
} else {
  console.log('Even number of backticks - all template literals appear closed');
  
  // Verify each pair
  let inTemplate = false;
  let start = -1;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === backtick && (i === 0 || content[i-1] !== '\\')) {
      if (!inTemplate) {
        inTemplate = true;
        start = i;
      } else {
        let lineStart = content.slice(0, start).split('\n').length;
        let lineEnd = content.slice(0, i).split('\n').length;
        console.log(`Template ${lineStart}-${lineEnd}: chars ${start}-${i} (len ${i-start})`);
        inTemplate = false;
        start = -1;
      }
    }
  }
}