// Nemotron 3 Ultra integration for AI Model Advisor
// Uses native fetch (Node.js 18+)
// Model: nvidia/nemotron-3-ultra-550b-a55b via NVIDIA NIM API

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1'
const NEMOTRON_MODEL = process.env.NEMOTRON_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b'

// System prompt for requirement extraction
const EXTRACTION_PROMPT = `You are an AI requirement parser for an AI Model Marketplace. Extract structured requirements from a user's natural language query.

Return ONLY valid JSON with this exact structure:
{
  "task_type": "string or null",
  "budget": "string or null",
  "hardware": "string or null",
  "latency": "string or null",
  "languages": "string or null",
  "accuracy_requirement": "string or null",
  "deployment_target": "string or null",
  "context_window": "string or null",
  "use_case": "string or null",
  "other_requirements": "string or null"
}

Rules:
- Extract ONLY what is explicitly mentioned or clearly implied
- Use null for unspecified fields
- task_type: map to one of: object_detection, image_classification, segmentation, text_generation, speech_recognition, text_to_speech, image_generation, embedding, other
- IMPORTANT: "programming", "coding", "code generation", "developer assistant", "code assistant", "coding assistant", "software development" → "text_generation"
- budget: free, low ($0-100), medium ($100-1000), high ($1000+), or null
- hardware: specific GPU/device mentioned (e.g., "Jetson Orin Nano", "MacBook Air M2", "RTX 4090", "CPU", "mobile")
- latency: specific latency/speed requirement (e.g., "30+ FPS", "under 10 minutes", "under 50ms")
- languages: comma-separated list if mentioned (e.g., "English, Spanish, French")
- accuracy_requirement: any accuracy/quality mention
- deployment_target: cloud, edge, local, mobile, serverless, or null
- context_window: specific context window if mentioned (e.g., "32k context")
- use_case: brief description of the application
- other_requirements: any other relevant details

Examples:

Input: "I need a fast object detection model for Jetson Orin Nano that can run at 30+ FPS on 640x640 input"
Output: {"task_type": "object_detection", "budget": null, "hardware": "Jetson Orin Nano", "latency": "30+ FPS", "languages": null, "accuracy_requirement": null, "deployment_target": "edge", "context_window": null, "use_case": "object detection on edge device", "other_requirements": "640x640 input resolution"}

Input: "Looking for a small LLM that runs locally on MacBook Air M2 with 32k context for coding assistance"
Output: {"task_type": "text_generation", "budget": null, "hardware": "MacBook Air M2", "latency": null, "languages": null, "accuracy_requirement": null, "deployment_target": "local", "context_window": "32k", "use_case": "coding assistance", "other_requirements": "runs locally"}

Input: "Need speech-to-text for podcast transcription, 1 hour audio in under 10 minutes, multi-language support"
Output: {"task_type": "speech_recognition", "budget": null, "hardware": null, "latency": "1 hour audio in under 10 minutes", "languages": "multi-language", "accuracy_requirement": null, "deployment_target": null, "context_window": null, "use_case": "podcast transcription", "other_requirements": "English, Spanish, French support"}

Input: "I need a model for programming and code generation"
Output: {"task_type": "text_generation", "budget": null, "hardware": null, "latency": null, "languages": null, "accuracy_requirement": null, "deployment_target": null, "context_window": null, "use_case": "programming", "other_requirements": null}

Input: "Best model for software development and code completion"
Output: {"task_type": "text_generation", "budget": null, "hardware": null, "latency": null, "languages": null, "accuracy_requirement": null, "deployment_target": null, "context_window": null, "use_case": "software development", "other_requirements": null}`

// System prompt for model recommendation/ranking
const SYSTEM_PROMPT = `You are an AI Model Advisor for AI Marketplace. Your job is to analyze user requirements and recommend the best AI model from a provided list of candidates.

You will receive:
1. User's natural language requirement
2. A list of candidate models with their specifications

Your response MUST be valid JSON with this exact structure:
{
  "primary": {
    "id": "model-uuid",
    "name": "model-name",
    "confidence": 0-100,
    "reasoning": "Clear explanation of why this model is the best fit"
  },
  "alternatives": [
    {
      "id": "model-uuid",
      "name": "model-name",
      "reason": "Why this is a good alternative",
      "tradeoffs": "What user gives up vs primary recommendation"
    }
  ],
  "summary": "Brief 2-3 sentence summary for the user",
  "keyFactors": ["factor1", "factor2", "factor3"]
}

Rules:
- ONLY recommend from the provided candidate models
- NEVER hallucinate model information not in the candidate data
- CRITICAL: Task type MUST match. If the user asks for text_generation/coding/programming, DO NOT recommend object_detection, speech_recognition, image_classification, segmentation, or image_generation models. Such recommendations are WRONG and will be penalized.
- Primary recommendation MUST match the user's requested task_type. If no candidate matches the task_type, set primary to null.
- Alternatives MUST be from the SAME task_type as the primary recommendation (or the user's requested task_type if no primary). Cross-task alternatives are FORBIDDEN.
- Base reasoning on: task_type match (highest priority), hardware compatibility, pricing, trust score, benchmarks, latency, task fit
- Be honest about tradeoffs
- If no good match (no candidates match task_type), set primary to null and explain why`

// Helper function for detailed NVIDIA API error logging
function logNvidiaError(context, response, model, endpoint) {
    const errorDetails = {
        context,
        httpStatus: response.status,
        statusText: response.statusText,
        model,
        endpoint,
        baseUrl: NVIDIA_BASE_URL
    }
    console.error('[NVIDIA API Error]', JSON.stringify(errorDetails, null, 2))
    return errorDetails
}

// Parse JSON from content that may be wrapped in markdown or have reasoning text
function parseJsonFromContent(content) {
    if (!content) return null
    
    // Try direct parse first
    try {
        return JSON.parse(content)
    } catch {}
    
    // Try to extract from markdown code blocks
    const markdownMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i)
    if (markdownMatch) {
        try {
            return JSON.parse(markdownMatch[1])
        } catch {}
    }
    
    // Try to extract first complete JSON object
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0])
        } catch {}
    }
    
    // Try to find JSON after "```" or at start of reasoning
    const afterReasoning = content.split('```').pop()
    if (afterReasoning) {
        const jsonMatch2 = afterReasoning.match(/\{[\s\S]*\}/)
        if (jsonMatch2) {
            try {
                return JSON.parse(jsonMatch2[0])
            } catch {}
        }
    }
    
    return null
}

// Core NVIDIA API call with diagnostics
async function callNvidiaApi(messages, options = {}) {
    const model = NEMOTRON_MODEL
    const endpoint = `${NVIDIA_BASE_URL}/chat/completions`
    
    if (!NVIDIA_API_KEY) {
        throw new Error('NVIDIA_API_KEY not configured')
    }
    
    const requestBody = {
        model: NEMOTRON_MODEL,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens ?? 2000,
        top_p: options.top_p ?? 0.9,
        stream: false
    }
    
    const startTime = Date.now()
    
    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${NVIDIA_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            model: NEMOTRON_MODEL,
            messages,
            temperature: options.temperature ?? 0.3,
            max_tokens: options.max_tokens ?? 2000,
            top_p: options.top_p ?? 0.9,
            stream: false
        })
    })
    
    const duration = Date.now() - startTime
    
    if (!response.ok) {
        const errorText = await response.text()
        const errorDetails = logNvidiaError('API call failed', response, NEMOTRON_MODEL, `${NVIDIA_BASE_URL}/chat/completions`)
        errorDetails.durationMs = duration
        errorDetails.requestBody = { model: NEMOTRON_MODEL, messagesCount: Array.isArray(arguments[0]) ? arguments[0].length : 0 }
        throw new Error(`NVIDIA API error: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    const data = await response.json()
    
    console.log('[NVIDIA API Success]', {
        model: NEMOTRON_MODEL,
        status: response.status,
        durationMs: Date.now() - startTime,
        choicesCount: data.choices?.length ?? 0
    })
    
    return data
}

// Extract requirements from natural language using Nemotron
async function extractRequirements(userRequirement) {
    if (!userRequirement || userRequirement.trim().length < 5) {
        return { ...getFallbackExtraction(), _aiPowered: false, _fallbackReason: 'Input too short' }
    }
    
    if (!NVIDIA_API_KEY) {
        console.warn('[extractRequirements] NVIDIA_API_KEY not set, using fallback')
        return { ...getFallbackExtraction(), _aiPowered: false, _fallbackReason: 'No API key' }
    }
    
    const messages = [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: `User requirement: "${userRequirement}"\n\nExtract structured requirements as JSON.` }
    ]
    
    try {
        const data = await callNvidiaApi([
            { role: 'system', content: EXTRACTION_PROMPT },
            { role: 'user', content: `User requirement: "${userRequirement}"\n\nExtract structured requirements as JSON.` }
        ], { temperature: 0.1, max_tokens: 1000, top_p: 0.9 })
        
        const content = data.choices?.[0]?.message?.content
        
        if (!content) {
            console.warn('[extractRequirements] Empty response from Nemotron')
            return { ...getFallbackExtraction(), _aiPowered: false, _fallbackReason: 'Empty response' }
        }
        
        // Parse JSON response
        const extracted = parseJsonFromContent(content)
        
        if (!extracted) {
            console.warn('[extractRequirements] Failed to parse JSON from response:', content.substring(0, 200))
            return { ...getFallbackExtraction(), _aiPowered: false, _fallbackReason: 'JSON parse failed' }
        }
        
        // Validate and sanitize
        const validated = validateExtraction(extracted)
        return { ...validated, _aiPowered: true, _fallbackReason: null }
        
    } catch (err) {
        console.error('[extractRequirements] Nemotron request failed:', err.message)
        return { ...getFallbackExtraction(), _aiPowered: false, _fallbackReason: err.message }
    }
}

function validateExtraction(extracted) {
    const validTaskTypes = ['object_detection', 'image_classification', 'segmentation', 'text_generation', 'speech_recognition', 'text_to_speech', 'image_generation', 'embedding', 'other']
    const validBudgets = ['free', 'low', 'medium', 'high']
    const validDeploymentTargets = ['cloud', 'edge', 'local', 'mobile', 'serverless']
    
    const result = {
        task_type: null,
        budget: null,
        hardware: null,
        latency: null,
        languages: null,
        accuracy_requirement: null,
        deployment_target: null,
        context_window: null,
        use_case: null,
        other_requirements: null
    }
    
    if (extracted.task_type && validTaskTypes.includes(extracted.task_type)) {
        result.task_type = extracted.task_type
    }
    if (extracted.budget && validBudgets.includes(extracted.budget)) {
        result.budget = extracted.budget
    }
    if (extracted.hardware && typeof extracted.hardware === 'string') {
        result.hardware = extracted.hardware.trim()
    }
    if (extracted.latency && typeof extracted.latency === 'string') {
        result.latency = extracted.latency.trim()
    }
    if (extracted.languages && typeof extracted.languages === 'string') {
        result.languages = extracted.languages.trim()
    }
    if (extracted.accuracy_requirement && typeof extracted.accuracy_requirement === 'string') {
        result.accuracy_requirement = extracted.accuracy_requirement.trim()
    }
    if (extracted.deployment_target && ['cloud', 'edge', 'local', 'mobile', 'serverless'].includes(extracted.deployment_target)) {
        result.deployment_target = extracted.deployment_target
    }
    if (extracted.context_window && typeof extracted.context_window === 'string') {
        result.context_window = extracted.context_window.trim()
    }
    if (extracted.use_case && typeof extracted.use_case === 'string') {
        result.use_case = extracted.use_case.trim()
    }
    if (extracted.other_requirements && typeof extracted.other_requirements === 'string') {
        result.other_requirements = extracted.other_requirements.trim()
    }
    
    return result
}

function getFallbackExtraction(userRequirement = '') {
    const text = (userRequirement || '').toLowerCase()
    const result = {
        task_type: null,
        budget: null,
        hardware: null,
        latency: null,
        languages: null,
        accuracy_requirement: null,
        deployment_target: null,
        context_window: null,
        use_case: null,
        other_requirements: null
    }
    
    // Task type detection
    if (text.includes('object detection') || (text.includes('detect') && !text.includes('code'))) result.task_type = 'object_detection'
    else if (text.includes('image classification') || text.includes('classif')) result.task_type = 'image_classification'
    else if (text.includes('segmentation') || text.includes('segment')) result.task_type = 'segmentation'
    else if (text.includes('speech') && (text.includes('text') || text.includes('transcrib'))) result.task_type = 'speech_recognition'
    else if (text.includes('text to speech') || text.includes('tts')) result.task_type = 'text_to_speech'
    else if (text.includes('image generat') || text.includes('diffusion') || text.includes('stable diffusion')) result.task_type = 'image_generation'
    else if (text.includes('programming') || text.includes('coding') || text.includes('code generation') || text.includes('developer') || text.includes('software development') || text.includes('code assistant') || text.includes('coding assistant') || text.includes('code completion')) result.task_type = 'text_generation'
    else if (text.includes('llm') || text.includes('language model') || text.includes('code generat') || text.includes('chat') || text.includes('text generat')) result.task_type = 'text_generation'
    else if (text.includes('embedding')) result.task_type = 'embedding'
    
    // Budget detection
    if (text.includes('free') || text.includes('open source')) result.budget = 'free'
    else if (text.includes('cheap') || text.includes('inexpensive') || text.includes('low cost') || text.includes('under $100') || text.includes('budget')) result.budget = 'low'
    else if (text.includes('medium') || text.includes('$100') || text.includes('$1,000')) result.budget = 'medium'
    else if (text.includes('high') || text.includes('$1000') || text.includes('premium')) result.budget = 'high'
    
    // Hardware detection
    if (text.includes('jetson orin nano')) result.hardware = 'Jetson Orin Nano'
    else if (text.includes('jetson')) result.hardware = 'Jetson'
    else if (text.includes('macbook air m2') || text.includes('m2')) result.hardware = 'MacBook Air M2'
    else if (text.includes('macbook')) result.hardware = 'MacBook'
    else if (text.includes('rtx 4090')) result.hardware = 'RTX 4090'
    else if (text.includes('rtx 4080')) result.hardware = 'RTX 4080'
    else if (text.includes('rtx 4070')) result.hardware = 'RTX 4070'
    else if (text.includes('rtx 4060')) result.hardware = 'RTX 4060'
    else if (text.includes('rtx 4050')) result.hardware = 'RTX 4050'
    else if (text.includes('rtx 3080')) result.hardware = 'RTX 3080'
    else if (text.includes('rtx 3070')) result.hardware = 'RTX 3070'
    else if (text.includes('rtx 3060')) result.hardware = 'RTX 3060'
    else if (text.includes('a100')) result.hardware = 'A100'
    else if (text.includes('h100')) result.hardware = 'H100'
    else if (text.includes('t4')) result.hardware = 'T4'
    else if (text.includes('cpu') && !text.includes('gpu')) result.hardware = 'CPU'
    else if (text.includes('mobile') || text.includes('ios') || text.includes('android') || text.includes('iphone')) result.hardware = 'Mobile'
    else if (text.includes('edge') || text.includes('jetson') || text.includes('coral') || text.includes('raspberry pi') || text.includes('rpi')) result.hardware = 'Edge Device'
    
    // Latency/speed
    if (text.includes('fps') || text.includes('frames per second') || text.includes('latency') || text.includes('fast') || text.includes('real.time') || text.includes('under') || text.includes('quick') || text.includes('speed')) {
        const latencyMatch = text.match(/(?:under|less than|below|within)\s+[^.]*(?:minute|second|ms|fps|frame)/i) ||
                            text.match(/(?:30\+|60\+)\s*fps/i) ||
                            text.match(/\d+\s*(?:ms|millisecond|second|minute|fps)/i) ||
                            text.match(/real.?time/i)
        if (latencyMatch) result.latency = latencyMatch[0]
        else result.latency = 'fast/low latency'
    }
    
    // Languages
    if (text.includes('multi.language') || text.includes('multilingual') || text.includes('multi language')) result.languages = 'multi-language'
    else if (text.includes('english') && text.includes('spanish') && text.includes('french')) result.languages = 'English, Spanish, French'
    else if (text.includes('english') && text.includes('spanish')) result.languages = 'English, Spanish'
    else if (text.includes('english')) result.languages = 'English'
    
    // Context window
    if (text.includes('32k') || text.includes('32768')) result.context_window = '32k'
    else if (text.includes('128k') || text.includes('131072')) result.context_window = '128k'
    else if (text.includes('context window') || text.includes('context length')) result.context_window = 'mentioned'
    
    // Deployment target
    if (text.includes('local') || text.includes('locally') || text.includes('on.device') || text.includes('on device')) result.deployment_target = 'local'
    else if (text.includes('edge') || text.includes('jetson') || text.includes('raspberry pi') || text.includes('coral')) result.deployment_target = 'edge'
    else if (text.includes('mobile') || text.includes('ios') || text.includes('android')) result.deployment_target = 'mobile'
    else if (text.includes('serverless') || text.includes('lambda') || text.includes('function')) result.deployment_target = 'serverless'
    else if (text.includes('cloud') || text.includes('aws') || text.includes('gcp') || text.includes('azure')) result.deployment_target = 'cloud'
    
    // Use case
    if (text.includes('podcast')) result.use_case = 'podcast transcription'
    else if (text.includes('code') || text.includes('coding') || text.includes('programming')) result.use_case = 'coding assistance'
    else if (text.includes('defect') || text.includes('manufacturing') || text.includes('quality control')) result.use_case = 'defect detection'
    else if (text.includes('chat') || text.includes('assistant')) result.use_case = 'chat/assistant'
    else if (text.includes('transcrib')) result.use_case = 'transcription'
    else if (text.includes('detect') && !text.includes('code')) result.use_case = 'object detection'
    else if (text.includes('speech')) result.use_case = 'speech recognition'
    else if (text.includes('image')) result.use_case = 'image processing'
    
    return result
}

// Main recommendation/ranking function
async function getNemotronRecommendation(userRequirement, candidates) {
    if (!NVIDIA_API_KEY) {
        console.warn('[getNemotronRecommendation] NVIDIA_API_KEY not set, using fallback')
        return { ...getFallbackRecommendation(userRequirement, candidates), _aiPowered: false, _fallbackReason: 'No API key' }
    }
    
    if (!candidates || candidates.length === 0) {
        return { primary: null, alternatives: [], summary: 'No compatible models found.', keyFactors: [], _aiPowered: false, _fallbackReason: 'No candidates' }
    }
    
    // Prepare candidate data for Nemotron
    const candidateSummary = candidates.map(m => ({
        id: m.id,
        name: m.name,
        creator: m.creator_name,
        task: m.task_type,
        description: m.description?.slice(0, 200),
        framework: m.latest_framework,
        minVramMb: m.min_vram_mb,
        supportedHardware: m.supported_hardware,
        pricing: m.pricing_model === 'free' ? 'Free' : `${m.price_value} ${m.price_currency}/${m.billing_unit}`,
        freeTier: m.free_tier_limit ? `${m.free_tier_limit} ${m.free_tier_unit}/mo` : 'None',
        trustScore: m.trust_score,
        deployments: m.total_deployments,
        rating: m.average_rating
    }))
    
    const userPrompt = `User requirement: "${userRequirement}"

Candidate models:
${JSON.stringify(candidateSummary, null, 2)}

Recommend the best model and explain why.`
    
    try {
        const data = await callNvidiaApi([
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
        ], { temperature: 0.3, max_tokens: 2000, top_p: 0.9 })
        
        const content = data.choices?.[0]?.message?.content
        
        if (!content) {
            console.warn('[getNemotronRecommendation] Empty response from Nemotron')
            return { ...getFallbackRecommendation(userRequirement, candidates), _aiPowered: false, _fallbackReason: 'Empty response' }
        }
        
        // Parse JSON response
        const recommendation = parseJsonFromContent(content)
        
        if (!recommendation) {
            console.warn('[getNemotronRecommendation] Failed to parse JSON from response:', content.substring(0, 200))
            return { ...getFallbackRecommendation(userRequirement, candidates), _aiPowered: false, _fallbackReason: 'JSON parse failed' }
        }
        
        // Validate and enrich recommendation
        const validated = validateAndEnrichRecommendation(recommendation, candidates)
        return { ...validated, _aiPowered: true, _fallbackReason: null }
        
    } catch (err) {
        console.error('[getNemotronRecommendation] Nemotron request failed:', err.message)
        return { ...getFallbackRecommendation(userRequirement, candidates), _aiPowered: false, _fallbackReason: err.message }
    }
}

// System prompt for model recommendation/ranking


function validateAndEnrichRecommendation(rec, candidates) {
    const candidateMap = new Map(candidates.map(c => [c.id, c]))
    
    // Validate primary - only accept if it matches a candidate
    if (rec.primary?.id && candidateMap.has(rec.primary.id)) {
        rec.primary = {
            ...candidateMap.get(rec.primary.id),
            ...rec.primary
        }
    } else {
        // DO NOT fall back to cross-task candidates
        rec.primary = null
    }
    
    // Validate alternatives - MUST be same task_type as primary
    if (Array.isArray(rec.alternatives)) {
        const primaryTaskType = rec.primary?.task
        rec.alternatives = rec.alternatives
            .filter(a => a.id && candidateMap.has(a.id))
            .filter(a => !primaryTaskType || a.task === primaryTaskType)
            .slice(0, 3)
            .map(a => ({ ...candidateMap.get(a.id), ...a }))
    } else {
        rec.alternatives = candidates
            .filter(c => c.id !== rec.primary?.id)
            .filter(c => !rec.primary?.task || c.task_type === rec.primary.task)
            .slice(0, 3)
            .map(c => ({ ...c, reason: 'High trust score alternative', tradeoffs: 'May differ in price or hardware requirements' }))
    }
    
    // Ensure required fields
    rec.summary = rec.summary || 'Based on your requirements, here are the recommended models.'
    rec.keyFactors = Array.isArray(rec.keyFactors) ? rec.keyFactors : ['task_type_match', 'trust_score', 'hardware_compatibility', 'pricing']
    
    return rec
}

function getFallbackRecommendation(userRequirement, candidates) {
    if (!candidates || candidates.length === 0) {
        return {
            primary: null,
            alternatives: [],
            summary: 'No compatible models found for your requirements.',
            keyFactors: [],
            _aiPowered: false,
            _fallbackReason: 'No candidates available'
        }
    }
    
    // Extract task_type from user requirement for filtering
    const text = (userRequirement || '').toLowerCase()
    let requestedTaskType = null
    if (text.includes('object detection') || (text.includes('detect') && !text.includes('code'))) requestedTaskType = 'object_detection'
    else if (text.includes('image classification') || text.includes('classif')) requestedTaskType = 'image_classification'
    else if (text.includes('segmentation') || text.includes('segment')) requestedTaskType = 'segmentation'
    else if (text.includes('speech') && (text.includes('text') || text.includes('transcrib'))) requestedTaskType = 'speech_recognition'
    else if (text.includes('text to speech') || text.includes('tts')) requestedTaskType = 'text_to_speech'
    else if (text.includes('image generat') || text.includes('diffusion') || text.includes('stable diffusion')) requestedTaskType = 'image_generation'
    else if (text.includes('programming') || text.includes('coding') || text.includes('code generation') || text.includes('developer') || text.includes('software development') || text.includes('code assistant') || text.includes('coding assistant') || text.includes('code completion')) requestedTaskType = 'text_generation'
    else if (text.includes('llm') || text.includes('language model') || text.includes('code generat') || text.includes('chat') || text.includes('text generat')) requestedTaskType = 'text_generation'
    else if (text.includes('embedding')) requestedTaskType = 'embedding'
    
    // Filter candidates by requested task_type
    let taskCandidates = candidates
    if (requestedTaskType) {
        taskCandidates = candidates.filter(c => c.task_type === requestedTaskType)
    }
    
    if (!taskCandidates || taskCandidates.length === 0) {
        return {
            primary: null,
            alternatives: [],
            summary: `No ${requestedTaskType || 'compatible'} models found for your requirements.`,
            keyFactors: [],
            _aiPowered: false,
            _fallbackReason: 'No matching task_type candidates'
        }
    }
    
    // Simple heuristic: highest trust score within matching task_type
    const sorted = [...taskCandidates].sort((a, b) => (b.trust_score || 0) - (a.trust_score || 0))
    
    return {
        primary: {
            ...sorted[0],
            confidence: 75,
            reasoning: `Fallback: Recommended based on highest trust score for ${requestedTaskType}. AI ranking unavailable.`
        },
        alternatives: sorted.slice(1, 3).map(c => ({
            ...c,
            reason: 'Fallback: High trust score alternative',
            tradeoffs: 'AI ranking unavailable - verify task compatibility'
        })),
        summary: `Found ${taskCandidates.length} compatible ${requestedTaskType} models. Fallback ranking by trust score.`,
        keyFactors: ['task_type_match', 'trust_score', 'deployment_count', 'hardware_compatibility'],
        _aiPowered: false,
        _fallbackReason: 'AI ranking failed, using trust-score fallback'
    }
}

// AI Health Test Function
async function testAiHealth() {
    const startTime = Date.now()
    
    if (!NVIDIA_API_KEY) {
        return {
            success: false,
            ai_powered: false,
            model: NEMOTRON_MODEL,
            baseUrl: NVIDIA_BASE_URL,
            message: 'NVIDIA_API_KEY not configured',
            error: 'Missing API key',
            durationMs: 0
        }
    }
    
    try {
        const startTime = Date.now()
        const data = await callNvidiaApi([
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Say "OK" and nothing else.' }
        ], { temperature: 0.1, max_tokens: 10, top_p: 0.9 })
        
        const content = data.choices?.[0]?.message?.content
        const durationMs = Date.now() - startTime
        
        return {
            success: true,
            ai_powered: true,
            model: NEMOTRON_MODEL,
            baseUrl: NVIDIA_BASE_URL,
            message: 'Nemotron API is working',
            response: content?.substring(0, 50) || 'OK',
            durationMs: Date.now() - startTime
        }
    } catch (err) {
        return {
            success: false,
            ai_powered: false,
            model: NEMOTRON_MODEL,
            baseUrl: NVIDIA_BASE_URL,
            message: 'Nemotron API health check failed',
            error: err.message,
            durationMs: Date.now() - startTime
        }
    }
}

export { extractRequirements, getNemotronRecommendation, testAiHealth }
