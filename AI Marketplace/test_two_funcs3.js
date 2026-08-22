const acorn = require('acorn');

const code = `
function logNvidiaError(context, response, model, endpoint) {
    const errorDetails = {
        context: context,
        httpStatus: response.status,
        statusText: response.statusText,
        model: model,
        endpoint: endpoint,
        baseUrl: NVIDIA_BASE_URL
    }
    console.error('[NVIDIA API Error]', JSON.stringify(errorDetails, null, 2))
    return errorDetails
}

function parseJsonFromContent(content) {
`;

try {
  acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module' });
  console.log('OK');
} catch(e) {
  console.log('ERROR:', e.message, 'at', JSON.stringify(e.loc));
}