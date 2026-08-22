const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  for (let j = 0; j < line.length; j++) {
    const code = line.charCodeAt(j);
    if (code > 127) {
      console.log('Line', i+1, 'char', j, ': U+' + code.toString(16).toUpperCase().padStart(4,'0'), '"' + line[j] + '"', JSON.stringify(line));
    }
  }
});
console.log('Done checking for non-ASCII');