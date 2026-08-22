const acorn = require('acorn');

const code = `
function parseJsonFromContent(content) {
    if (!content) return null
    
    // Try direct parse first
    try {
        return JSON.parse(content)
    } catch {}
    
    // Try to extract from markdown code blocks
    const markdownMatch = content.match(/```(?:json)?\\s*(\\{[\\s\\S]*?\\})\\s*```/i)
    if (markdownMatch) {
        try {
            return JSON.parse(markdownMatch[1])
        } catch {}
    }
    
    // Try to extract first complete JSON object
    const jsonMatch = content.match(/\\{[\\s\\S]*\\}/)
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0])
        } catch {}
    
    // Try to find JSON after "```" or at start of reasoning
    const afterReasoning = content.split('```').pop()
    if (afterReasoning) {
        const jsonMatch2 = afterReasoning.match(/\\{[\\s\\S]*\\}/)
        if (jsonMatch2) {
            try {
                return JSON.parse(jsonMatch2[0])
            } catch {}
        }
    }
    
    return null
}
`;

try {
  acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module' });
  console.log('OK');
} catch(e) {
  console.log('ERROR:', e.message, 'at', JSON.stringify(e.loc));
}