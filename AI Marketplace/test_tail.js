const acorn = require('acorn');
const fs = require('fs');
const content = fs.readFileSync('backend/src/services/nemotron.js', 'utf8');

// Test parsing just the last function + export
const tailStart = content.indexOf('// AI Health Test Function');
const tail = content.slice(tailStart);
console.log('Testing tail parsing...');
try {
  acorn.parse(tail, { ecmaVersion: 2022, sourceType: 'module' });
  console.log('Tail parses OK');
} catch(e) {
  console.log('Tail error:', e.message, 'at', e.loc);
}

// Test parsing from getFallbackRecommendation
const tail2Start = content.indexOf('function getFallbackRecommendation');
const tail2 = content.slice(tail2Start);
console.log('\nTesting from getFallbackRecommendation...');
try {
  acorn.parse(tail2, { ecmaVersion: 2022, sourceType: 'module' });
  console.log('Tail2 parses OK');
} catch(e) {
  console.log('Tail2 error:', e.message, 'at', e.loc);
}

// Test parsing from validateAndEnrichRecommendation
const tail3Start = content.indexOf('function validateAndEnrichRecommendation');
const tail3 = content.slice(tail3Start);
console.log('\nTesting from validateAndEnrichRecommendation...');
try {
  acorn.parse(tail3, { ecmaVersion: 2022, sourceType: 'module' });
  console.log('Tail3 parses OK');
} catch(e) {
  console.log('Tail3 error:', e.message, 'at', e.loc);
}