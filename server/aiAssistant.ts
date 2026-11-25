import { IncomingMessage, ServerResponse } from 'http';

export type ApiKeyInput = string | { geminiApiKey?: string; groqApiKey?: string };

function parseApiKeys(input: ApiKeyInput): { geminiApiKey: string; groqApiKey: string } {
  if (typeof input === 'string') {
    return { geminiApiKey: input, groqApiKey: '' };
  }
  return {
    geminiApiKey: input?.geminiApiKey || '',
    groqApiKey: input?.groqApiKey || ''
  };
}

async function callLlmJson(
  prompt: string,
  keys: { geminiApiKey: string; groqApiKey: string },
  systemPrompt: string
): Promise<string | null> {
  // 1. Try Groq LPU first if key available (sub-800ms ultra-fast inference)
  if (keys.groqApiKey) {
    const models = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
    for (const model of models) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${keys.groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 2500,
            response_format: { type: 'json_object' },
          }),
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && content.trim()) {
            return content.trim();
          }
        }
      } catch (err) {
        console.warn(`Groq model ${model} error:`, err);
      }
    }
  }

  // 2. Try Gemini if Groq failed or not configured
  if (keys.geminiApiKey) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keys.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed:', err);
    }
  }

  return null;
}

function buildDeterministicActivities(conceptLabel: string, conceptExplanation?: string) {
  const label = conceptLabel || 'Concept';
  return {
    concept: label,
    activities: [
      {
        id: `act-det-1-${Date.now()}`,
        type: 'Hands-on',
        title: `${label} Sensory & Tactile Investigation`,
        description: `Students explore ${label} using physical classroom props and everyday materials. ${conceptExplanation ? `Observe: ${conceptExplanation}` : 'Touch, feel, and observe real-world physical transitions.'}`,
        inclusiveTip: 'Students may touch, point, gesture, or use picture cards.',
        duration: 10
      },
      {
        id: `act-det-2-${Date.now()}`,
        type: 'Visual',
        title: `${label} Step-by-Step Visual Map`,
        description: `Display a clean high-contrast visual transition chart breaking down how ${label} operates in nature and science.`,
        inclusiveTip: 'Use dual symbol-word representations and high-contrast color cards.',
        duration: 5
      },
      {
        id: `act-det-3-${Date.now()}`,
        type: 'Movement',
        title: `${label} Kinesthetic Action Dance`,
        description: `Students physically role-play the motion and transformation of ${label} through creative embodied movement.`,
        inclusiveTip: 'All physical ranges of motion are welcomed (seated arm swaying or whole-body movement).',
        duration: 8
      },
      {
        id: `act-det-4-${Date.now()}`,
        type: 'Pair Activity',
        title: `${label} Partner Inquiry & AAC Exchange`,
        description: `Pairs describe to each other what happens during ${label} using simple words or AAC communication boards.`,
        inclusiveTip: 'Partners can use AAC boards, thumbs up/down, or single-word cards.',
        duration: 7
      }
    ]
  };
}

function buildDeterministicExplanation(conceptLabel: string, conceptExplanation?: string) {
  const label = conceptLabel || 'Concept';
  return {
    concept: label,
    sensory: `When ${label} happens, you can observe gentle physical shifts, temperature changes, or tactile textures with your hands.`,
    visual: `Imagine ${label} like little friendly particles working together in a colorful chain of events!`,
    science: conceptExplanation || `${label} is a natural scientific process where energy and matter transform step-by-step.`,
    realLifeExample: `Think of when you see ${label} happening in everyday life around your home or kitchen!`
  };
}

function buildDeterministicCheckpoint(conceptLabel: string, conceptExplanation?: string) {
  const label = conceptLabel || 'Concept';
  return {
    conceptLabel: label,
    memoryHook: `Remember: ${label} is an essential transformation milestone in our science journey!`,
    questions: [
      {
        id: `q-det-1-${Date.now()}`,
        type: 'visual_symbol',
        prompt: `Which picture best represents ${label}?`,
        options: [`${label} icon`, 'Empty space', 'Unrelated object'],
        correctIndex: 0,
        explanation: `${label} represents this key transformation in our concept roadmap.`
      },
      {
        id: `q-det-2-${Date.now()}`,
        type: 'real_life',
        prompt: `Where can you observe ${label} in everyday life?`,
        options: ['In daily household and outdoor changes', 'Only in outer space', 'Nowhere on Earth'],
        correctIndex: 0,
        explanation: `${label} happens naturally in our everyday environment.`
      },
      {
        id: `q-det-3-${Date.now()}`,
        type: 'cause_effect',
        prompt: `What causes ${label} to occur?`,
        options: ['Energy exchange and scientific prerequisite conditions', 'Random luck', 'Magic'],
        correctIndex: 0,
        explanation: `${label} requires causal energy transitions to occur.`
      },
      {
        id: `q-det-4-${Date.now()}`,
        type: 'sensory_observation',
        prompt: `How would you sensory-observe ${label}?`,
        options: ['By looking, feeling temperature, or noticing changes', 'It has no sensory presence', 'By closing your eyes'],
        correctIndex: 0,
        explanation: `We can observe ${label} through sight and touch.`
      },
      {
        id: `q-det-5-${Date.now()}`,
        type: 'curriculum_sequence',
        prompt: `Why is understanding ${label} important in the sequence?`,
        options: ['It connects the previous milestone to the next one', 'It has no connection', 'It should be skipped'],
        correctIndex: 0,
        explanation: `${label} is a vital prerequisite step in the causal chain.`
      },
      {
        id: `q-det-6-${Date.now()}`,
        type: 'concept_check',
        prompt: `What happens when ${label} is complete?`,
        options: ['The system moves to the next phase', 'Everything stops', 'Nothing happens'],
        correctIndex: 0,
        explanation: `${label} leads to the next milestone in the cycle.`
      }
    ]
  };
}

/**
 * Serverless handler for AI Inclusive Activities Generation (#1).
 * Supports both Groq LPU and Gemini 2.5 Flash with deterministic fallback.
 */
export async function handleGenerateActivities(
  req: IncomingMessage,
  res: ServerResponse,
  apiKeyInput: ApiKeyInput
) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  const keys = parseApiKeys(apiKeyInput);

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body || '{}');
      const { conceptLabel, conceptExplanation, topicTitle } = parsed;

      if (!conceptLabel) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'conceptLabel is required' }));
        return;
      }

      const prompt = `
You are an expert inclusive special-education curriculum designer.
Generate 4 diverse, accessible pre-class teaching activities for introducing the concept: "${conceptLabel}" (Topic: ${topicTitle || 'Science'}, Explanation: ${conceptExplanation || ''}).

Required activity types:
1. "Hands-on": Real-life tactile, concrete, multi-sensory experiment using everyday classroom materials.
2. "Visual": Picture / diagram / color breakdown of the process.
3. "Movement": Physical movement / kinesthetic roleplay for the children.
4. "Pair Activity": Low-anxiety partner interaction or AAC symbol response.

Format your response as strict JSON:
{
  "concept": "${conceptLabel}",
  "activities": [
    {
      "id": "act-ai-1",
      "type": "Hands-on",
      "title": "Title of Activity",
      "description": "Concrete step-by-step description of what teacher and children do.",
      "inclusiveTip": "Specific accommodation for AAC, motor-delayed, or sensory-sensitive students.",
      "duration": 10
    }
  ]
}
`;

      let parsedActivities: any = null;
      const rawJson = await callLlmJson(prompt, keys, 'You are an expert inclusive special-education curriculum designer. Respond strictly in valid JSON.');
      if (rawJson) {
        try {
          let clean = rawJson.replace(/```(?:json)?/gi, '').trim();
          const start = clean.indexOf('{');
          const end = clean.lastIndexOf('}');
          if (start !== -1 && end > start) {
            clean = clean.substring(start, end + 1);
          }
          parsedActivities = JSON.parse(clean);
        } catch (e) {
          console.warn('Failed to parse AI activities JSON:', e);
        }
      }

      if (!parsedActivities || !Array.isArray(parsedActivities.activities) || parsedActivities.activities.length === 0) {
        parsedActivities = buildDeterministicActivities(conceptLabel, conceptExplanation);
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, ...parsedActivities }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server error generating activities', details: message }));
    }
  });
}

/**
 * Serverless handler for Multi-Tiered Simple Explanations (#5).
 * Generates 3 child-friendly cognitive tiers: Sensory/Touch, Visual Metaphor, Simple Science.
 */
export async function handleGenerateExplanation(
  req: IncomingMessage,
  res: ServerResponse,
  apiKeyInput: ApiKeyInput
) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  const keys = parseApiKeys(apiKeyInput);

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body || '{}');
      const { conceptLabel, conceptExplanation } = parsed;

      if (!conceptLabel) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'conceptLabel is required' }));
        return;
      }

      const prompt = `
You are an expert in explaining complex science concepts to young children (ages 6-10) and students using AAC devices.
Create 3 child-friendly explanation tiers for the concept: "${conceptLabel}" (${conceptExplanation || ''}).

Tiers required:
1. "sensory": Focus on sensory feel, touch, temperature, or everyday household experience.
2. "visual": A fun cartoon story or friendly visual metaphor (like water droplets holding hands or wearing warm coats).
3. "science": Clear, simple causal science explanation in 1 gentle sentence.
4. "realLifeExample": A familiar home/kitchen example every child has seen.

Format your response as strict JSON:
{
  "concept": "${conceptLabel}",
  "sensory": "Sensory explanation...",
  "visual": "Visual metaphor...",
  "science": "Simple science definition...",
  "realLifeExample": "Real life example..."
}
`;

      let parsedExplanation: any = null;
      const rawJson = await callLlmJson(prompt, keys, 'You are an expert in explaining complex science concepts to young children. Respond strictly in valid JSON.');
      if (rawJson) {
        try {
          let clean = rawJson.replace(/```(?:json)?/gi, '').trim();
          const start = clean.indexOf('{');
          const end = clean.lastIndexOf('}');
          if (start !== -1 && end > start) {
            clean = clean.substring(start, end + 1);
          }
          parsedExplanation = JSON.parse(clean);
        } catch (e) {
          console.warn('Failed to parse AI explanation JSON:', e);
        }
      }

      if (!parsedExplanation || !parsedExplanation.sensory || !parsedExplanation.visual) {
        parsedExplanation = buildDeterministicExplanation(conceptLabel, conceptExplanation);
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, ...parsedExplanation }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server error generating explanation', details: message }));
    }
  });
}

/**
 * Serverless handler for AI Exam & Spaced Revision Checkpoints.
 * Generates 6 multi-tier inclusive revision checkpoint questions with Groq / Gemini / Fallback.
 */
export async function handleGenerateExamCheckpoint(
  req: IncomingMessage,
  res: ServerResponse,
  apiKeyInput: ApiKeyInput
) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  const keys = parseApiKeys(apiKeyInput);

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body || '{}');
      const { conceptLabel, conceptExplanation } = parsed;

      if (!conceptLabel) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'conceptLabel is required' }));
        return;
      }

      const prompt = `
You are an expert inclusive special-education examiner.
Create exactly 6 diverse, accessible revision checkpoint questions (more than 5) for testing and reviewing: "${conceptLabel}" (${conceptExplanation || ''}).

Question Requirements across the 6 items:
1. "visual_symbol": Identify visual representation or symbol of the concept.
2. "real_life": Recognize everyday real-life observation where this happens.
3. "cause_effect": Understand what causes this to happen in the curriculum sequence.
4. "sensory_observation": Relate sensory feel, temperature, touch, or sound.
5. "curriculum_sequence": What happens right before or right after this milestone.
6. "concept_check": Check practical understanding or problem-solving scenario.

For each question: provide exactly 3 simple options, the zero-based index of the correct answer, and a friendly 1-sentence explanation of why it is correct.
Also provide a 1-sentence "memoryHook" (a vivid analogy or memorable clue).

Format your response as strict JSON:
{
  "conceptLabel": "${conceptLabel}",
  "memoryHook": "1-sentence memory hook or analogy...",
  "questions": [
    {
      "id": "q-1",
      "type": "visual_symbol",
      "prompt": "Question text...",
      "options": ["Option A", "Option B", "Option C"],
      "correctIndex": 0,
      "explanation": "Why this option is correct..."
    }
  ]
}
`;

      let parsedCheckpoint: any = null;
      const rawJson = await callLlmJson(prompt, keys, 'You are an expert inclusive special-education examiner. Respond strictly in valid JSON.');
      if (rawJson) {
        try {
          let clean = rawJson.replace(/```(?:json)?/gi, '').trim();
          const start = clean.indexOf('{');
          const end = clean.lastIndexOf('}');
          if (start !== -1 && end > start) {
            clean = clean.substring(start, end + 1);
          }
          parsedCheckpoint = JSON.parse(clean);
        } catch (e) {
          console.warn('Failed to parse AI checkpoint JSON:', e);
        }
      }

      if (!parsedCheckpoint || !Array.isArray(parsedCheckpoint.questions) || parsedCheckpoint.questions.length === 0) {
        parsedCheckpoint = buildDeterministicCheckpoint(conceptLabel, conceptExplanation);
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, ...parsedCheckpoint }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server error generating checkpoint', details: message }));
    }
  });
}

// In-memory simulation response cache (topic + question)
const simulationCache = new Map<string, any>();

/**
 * Serverless handler for AI Interactive Sandbox Simulation Generation.
 * Supports both Groq (Llama-3.3-70b / GPT-OSS-120B) and Google Gemini (2.5 Flash) with fallback.
 */
export async function handleGenerateSandboxSimulation(
  req: IncomingMessage,
  res: ServerResponse,
  keys: { geminiApiKey?: string; groqApiKey?: string }
) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body || '{}');
      const { question, topic, concepts } = parsed;

      const questionText = (question || 'How does this scientific process work step by step?').trim();
      const topicText = (topic || 'Science Inquiry').trim();
      const conceptsStr = Array.isArray(concepts) ? concepts.map((c: any) => `${c.label || c} (${c.explanation || ''})`).join(', ') : '';

      // Check Cache for instant (<5ms) sub-second response
      const cacheKey = `${topicText.toLowerCase()}:::${questionText.toLowerCase()}`;
      if (simulationCache.has(cacheKey)) {
        const cachedResult = simulationCache.get(cacheKey);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, isCached: true, ...cachedResult }));
        return;
      }

      const prompt = `
You are an expert inclusive science educator and interactive STEM simulation designer.
Create a rich, engaging 4-to-6 step cause-and-effect science simulation specifically answering the inquiry question:
Teacher's Question: "${questionText}"
Lesson Context: "${topicText}"

CRITICAL RULES:
1. You MUST generate a simulation that directly, accurately, and exclusively models the phenomenon in the question: "${questionText}".
2. Do NOT use concepts from "${topicText}" (such as water cycle, evaporation, etc.) if the question is about a different topic. For example, if the question is about vinegar and baking soda, generate chemical fizzing/CO2 gas steps; if about electricity, generate battery/circuit/light steps; if about rust, generate oxidation steps; if about magnets, generate magnetic force steps; if about friction/balloons, generate static electricity steps.
3. Every step must have a realistic emoji matching that step (e.g. 🧂, 🍶, 🫧, 💡, 🔋, 🧲, 🎈, ⚡, 🌋, 🧪, 🍎, etc.).
4. Provide child-friendly pipExplanation, sensoryClues (sight, touch, sound), and a short 2-4 word aacReactionPhrase for every step.

Format your output as strict JSON with this exact structure:
{
  "topic": "${questionText}",
  "topicKn": "${questionText}",
  "inquiryQuestion": "${questionText}",
  "inquiryQuestionKn": "${questionText}",
  "introMessage": "Welcome! Tap each step to discover the cause and effect of: ${questionText}!",
  "introMessageKn": "${questionText} ಪ್ರಯೋಗಕ್ಕೆ ಸುಸ್ವಾಗತ! ಪ್ರತಿ ಹಂತವನ್ನು ಮುಟ್ಟಿ ನೋಡಿ!",
  "themeType": "general",
  "celebrationMessage": "Amazing experiment! You completed the full cause-and-effect reaction for ${questionText}!",
  "celebrationMessageKn": "ಅದ್ಭುತ ಪ್ರಯೋಗ! ನೀವು ಸಂಪೂರ್ಣ ಕ್ರಿಯೆ-ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಿದ್ದೀರಿ!",
  "steps": [
    {
      "stepNumber": 1,
      "id": "step-1",
      "name": "Step Name in English",
      "nameKn": "Step Name in Kannada",
      "symbol": "🧪",
      "actionButtonLabel": "Action verb (e.g. Add Baking Soda, Connect Switch, Plant Seed)",
      "actionButtonLabelKn": "Action verb in Kannada",
      "pipExplanation": "Child-friendly spoken note from Pip explaining what is happening",
      "pipExplanationKn": "Kannada spoken note from Pip",
      "visualState": {
        "skyGradient": "from-amber-200 to-sky-300",
        "stageAtmosphere": "Short vivid description of the visual scene",
        "activeVisualEmoji": "🧪",
        "animationType": "pulse",
        "gaugeLabel": "Reaction Meter",
        "gaugeValue": "25%",
        "gaugePercent": 25
      },
      "causeAndEffect": {
        "cause": "What was done",
        "effect": "What happened"
      },
      "sensoryClues": {
        "sight": "What children see (e.g. Foamy white bubbles erupting)",
        "sightKn": "ಮಕ್ಕಳು ಏನು ನೋಡುತ್ತಾರೆ",
        "touch": "What children feel (e.g. Container feels cool to touch)",
        "touchKn": "ಮಕ್ಕಳು ಏನು ಅನುಭವಿಸುತ್ತಾರೆ",
        "sound": "What children hear (e.g. Fizzy sizzling sound)",
        "soundKn": "ಮಕ್ಕಳು ಏನು ಕೇಳುತ್ತಾರೆ"
      },
      "aacReactionPhrase": "Short 2-4 word sentence for AAC (e.g. It is fizzing!)",
      "aacReactionPhraseKn": "ನೊರೆ ಬರುತ್ತಿದೆ!"
    }
  ]
}
`;

      let jsonContent = '';

      // 1. Try Groq with available high-intelligence models
      if (keys.groqApiKey) {
        const groqModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
        for (const model of groqModels) {
          if (jsonContent) break;
          try {
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${keys.groqApiKey}`
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: 'You are an interactive science simulation generator for special education students. Respond ONLY with a valid raw JSON object. Do not include markdown preamble or explanations outside JSON.' },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.2,
                max_tokens: 3500
              })
            });

            if (groqRes.ok) {
              const groqData = await groqRes.json();
              const content = groqData.choices?.[0]?.message?.content;
              if (content && content.trim().length > 0) {
                jsonContent = content.trim();
                break;
              }
            } else {
              const errBody = await groqRes.text();
              console.warn(`Groq model ${model} failed (${groqRes.status}):`, errBody.substring(0, 150));
            }
          } catch (groqErr) {
            console.warn(`Groq model ${model} network error:`, groqErr);
          }
        }
      }

      // 2. Try Gemini if Groq was not used or didn't return content
      if (!jsonContent && keys.geminiApiKey) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keys.geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.3,
                  responseMimeType: 'application/json'
                }
              })
            }
          );

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            jsonContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
        } catch (geminiErr) {
          console.warn('Gemini simulation API call failed:', geminiErr);
        }
      }

      // 3. Parse JSON safely or fallback
      let parsedSimulation: any = null;
      if (jsonContent) {
        try {
          let clean = jsonContent.replace(/```(?:json)?/gi, '').trim();
          const start = clean.indexOf('{');
          const end = clean.lastIndexOf('}');
          if (start !== -1 && end > start) {
            clean = clean.substring(start, end + 1);
          }
          parsedSimulation = JSON.parse(clean);
          // If response wrapped in { simulation: { ... } }
          if (parsedSimulation.simulation && Array.isArray(parsedSimulation.simulation.steps)) {
            parsedSimulation = parsedSimulation.simulation;
          }
        } catch (parseErr) {
          console.warn('Failed to parse AI simulation JSON:', parseErr, jsonContent.substring(0, 200));
        }
      }

      if (!parsedSimulation || !Array.isArray(parsedSimulation.steps) || parsedSimulation.steps.length === 0) {
        const fallbackSim = buildDeterministicSimulation(questionText, topicText, concepts);
        simulationCache.set(cacheKey, fallbackSim);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, isFallback: true, ...fallbackSim }));
        return;
      }

      // Cache successful AI simulation (limit cache to 100 entries)
      if (simulationCache.size > 100) {
        const firstKey = simulationCache.keys().next().value;
        if (firstKey) simulationCache.delete(firstKey);
      }
      simulationCache.set(cacheKey, parsedSimulation);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, isAiGenerated: true, ...parsedSimulation }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server error generating simulation', details: message }));
    }
  });
}

function buildDeterministicSimulation(question: string, topic: string, concepts?: any[]) {
  const qLower = (question || '').toLowerCase();
  
  // Provide intelligent specialized fallback steps with sensory clues and AAC reaction phrases
  let stepsData: Array<{
    label: string;
    labelKn?: string;
    symbol: string;
    explanation: string;
    explanationKn?: string;
    cause: string;
    effect: string;
    gaugeLabel: string;
    gaugeValue: string;
    gaugePercent: number;
    sensoryClues?: { sight: string; sightKn: string; touch: string; touchKn: string; sound: string; soundKn: string };
    aacReactionPhrase?: string;
    aacReactionPhraseKn?: string;
  }> = [];

  if (qLower.includes('freeze') || qLower.includes('ice') || qLower.includes('cold')) {
    stepsData = [
      {
        label: 'Room Temperature Water',
        labelKn: 'ಸಾಮಾನ್ಯ ನೀರಿನ ಸ್ಥಿತಿ',
        symbol: '💧',
        explanation: 'Liquid water molecules move freely past each other at room temperature.',
        explanationKn: 'ಸಾಮಾನ್ಯ ತಾಪಮಾನದಲ್ಲಿ ನೀರಿನ ಕಣಗಳು ಸ್ವತಂತ್ರವಾಗಿ ಚಲಿಸುತ್ತವೆ.',
        cause: 'Pouring water into container',
        effect: 'Water sits in liquid state at 20°C',
        gaugeLabel: 'Temperature',
        gaugeValue: '20°C',
        gaugePercent: 60,
        sensoryClues: {
          sight: 'Clear liquid flowing and splashing in beaker',
          sightKn: 'ಪಾತ್ರೆಯಲ್ಲಿ ತಿಳಿ ನೀರು ಹರಿಯುವುದು',
          touch: 'Wet and mild temperature to touch',
          touchKn: 'ಮುಟ್ಟಲು ತೇವ ಮತ್ತು ಹಿತವಾದ ಅನುಭವ',
          sound: 'Gentle splashing sound',
          soundKn: 'ಶಾಂತ ನೀರಿನ ಸದ್ದು'
        },
        aacReactionPhrase: 'Water is liquid!',
        aacReactionPhraseKn: 'ನೀರು ದ್ರವ ರೂಪದಲ್ಲಿದೆ!'
      },
      {
        label: 'Rapid Cooling',
        labelKn: 'ತಂಪಾಗಿಸುವ ಪ್ರಕ್ರಿಯೆ',
        symbol: '❄️',
        explanation: 'Placing the water into extreme cold removes heat energy and slows molecules down.',
        explanationKn: 'ವಿಪರೀತ ಶೀತ ವಾತಾವರಣವು ಶಾಖವನ್ನು ತೆಗೆದು ಕಣಗಳ ಚಲನೆಯನ್ನು ನಿಧಾನಗೊಳಿಸುತ್ತದೆ.',
        cause: 'Dropping temperature towards 0°C',
        effect: 'Molecules lose kinetic energy and draw together',
        gaugeLabel: 'Temperature',
        gaugeValue: '5°C',
        gaugePercent: 25,
        sensoryClues: {
          sight: 'Tiny frosty needles beginning to show at edges',
          sightKn: 'ಅಂಚುಗಳಲ್ಲಿ ಸಣ್ಣ ಹಿಮದ ಕಣಗಳು ಮೂಡುವುದು',
          touch: 'Chilly and numbing cold to fingertips',
          touchKn: 'ಬೆರಳುಗಳಿಗೆ ತುಂಬಾ ತಣ್ಣನೆಯ ಅನುಭವ',
          sound: 'Quiet shivering cold atmosphere',
          soundKn: 'ಶೀತದ ಶಾಂತ ವಾತಾವರಣ'
        },
        aacReactionPhrase: 'It is getting cold!',
        aacReactionPhraseKn: 'ತುಂಬಾ ತಣ್ಣಗಾಗುತ್ತಿದೆ!'
      },
      {
        label: 'Freezing Transition',
        labelKn: 'ಹಿಮಗಡ್ಡೆ ರಚನೆ',
        symbol: '🧊',
        explanation: 'At 0°C, hydrogen bonds lock the molecules into a rigid hexagonal ice crystal lattice.',
        explanationKn: '0°C ತಾಪಮಾನದಲ್ಲಿ ಕಣಗಳು ಗಟ್ಟಿಯಾದ ಷಡ್ಭುಜೀಯ ಸ್ಫಟಿಕ ಜಾಲರಿಯಾಗಿ ಲಾಕ್ ಆಗುತ್ತವೆ.',
        cause: 'Crossing 0°C freezing threshold',
        effect: 'Liquid phase turns into solid crystalline ice',
        gaugeLabel: 'Ice Formation',
        gaugeValue: '85%',
        gaugePercent: 85,
        sensoryClues: {
          sight: 'Surface turns opaque milky white solid',
          sightKn: 'ಮೇಲ್ಮೈ ಬಿಳಿ ಘನ ಹಿಮವಾಗಿ ಬದಲಾಗುವುದು',
          touch: 'Hard, slippery and freezing cold',
          touchKn: 'ಗಟ್ಟಿ, ಜಾರುವ ಮತ್ತು ಅತಿಯಾದ ಶೀತ',
          sound: 'Tiny snap as crystals lock in place',
          soundKn: 'ಸ್ಫಟಿಕಗಳು ಲಾಕ್ ಆಗುವ ಸಣ್ಣ ಸದ್ದು'
        },
        aacReactionPhrase: 'Water turns to ice!',
        aacReactionPhraseKn: 'ನೀರು ಹಿಮವಾಗುತ್ತಿದೆ!'
      },
      {
        label: 'Solid Ice State',
        labelKn: 'ಸಂಪೂರ್ಣ ಘನ ಹಿಮ',
        symbol: '🏔️',
        explanation: 'Water is now completely frozen! Because ice crystals expand, ice is lighter and floats.',
        explanationKn: 'ನೀರು ಈಗ ಸಂಪೂರ್ಣವಾಗಿ ಘನೀಕೃತ ಹಿಮವಾಗಿದೆ! ಹಿಮವು ಹಗುರವಾಗಿರುತ್ತದೆ.',
        cause: 'Full molecular crystal lattice',
        effect: 'Hard solid ice with lower density than liquid water',
        gaugeLabel: 'Solidification',
        gaugeValue: '100%',
        gaugePercent: 100,
        sensoryClues: {
          sight: 'Firm solid ice cube that can float on water',
          sightKn: 'ನೀರಿನ ಮೇಲೆ ತೇಲುವ ಗಟ್ಟಿಯಾದ ಹಿಮದ ತುಂಡು',
          touch: 'Firm solid object, doesn\'t change shape',
          touchKn: 'ಆಕಾರ ಬದಲಾಗದ ಗಟ್ಟಿ ಹಿಮ',
          sound: 'Clinking solid ice sound',
          soundKn: 'ಹಿಮದ ಗಟ್ಟಿಯಾದ ಸದ್ದು'
        },
        aacReactionPhrase: 'Solid ice is formed!',
        aacReactionPhraseKn: 'ಘನ ಹಿಮಗಡ್ಡೆ ಸಿದ್ಧವಾಗಿದೆ!'
      }
    ];
  } else if (qLower.includes('heat') || qLower.includes('steam') || qLower.includes('boil') || qLower.includes('evaporat')) {
    stepsData = [
      {
        label: 'Cool Liquid',
        labelKn: 'ತಂಪಾದ ನೀರು',
        symbol: '💧',
        explanation: 'Liquid water molecules stay together in the pot or puddle.',
        explanationKn: 'ಪಾತ್ರೆಯಲ್ಲಿ ನೀರು ವಿಶ್ರಾಂತಿಯಲ್ಲಿದೆ.',
        cause: 'Water in resting state',
        effect: 'Molecules closely packed together',
        gaugeLabel: 'Temperature',
        gaugeValue: '25°C',
        gaugePercent: 25,
        sensoryClues: {
          sight: 'Calm water resting in the pot',
          sightKn: 'ಶಾಂತವಾದ ನೀರು',
          touch: 'Cool room temperature',
          touchKn: 'ಸಾಮಾನ್ಯ ತಾಪಮಾನ',
          sound: 'Quiet container',
          soundKn: 'ಶಾಂತ ವಾತಾವರಣ'
        },
        aacReactionPhrase: 'Water is resting.',
        aacReactionPhraseKn: 'ನೀರು ಶಾಂತವಾಗಿದೆ.'
      },
      {
        label: 'Thermal Energy',
        labelKn: 'ಶಾಖ ಶಕ್ತಿ',
        symbol: '🔥',
        explanation: 'Applying heat gives kinetic energy to water molecules, making them vibrate faster.',
        explanationKn: 'ಶಾಖ ನೀಡಿದಾಗ ಕಣಗಳು ವೇಗವಾಗಿ ಕಂಪಿಸುತ್ತವೆ.',
        cause: 'Heating element or intense sunlight',
        effect: 'Molecules gain thermal speed',
        gaugeLabel: 'Temperature',
        gaugeValue: '75°C',
        gaugePercent: 75,
        sensoryClues: {
          sight: 'Tiny bubbles dancing at bottom of pot',
          sightKn: 'ಪಾತ್ರೆಯ ತಳದಲ್ಲಿ ಸಣ್ಣ ಗುಳ್ಳೆಗಳು',
          touch: 'Hot radiant warmth nearby',
          touchKn: 'ಬೆಚ್ಚಗಿನ ಶಾಖ',
          sound: 'Gentle bubbling hiss',
          soundKn: 'ಗುಳ್ಳೆಗಳ ಸದ್ದು'
        },
        aacReactionPhrase: 'Water is heating up!',
        aacReactionPhraseKn: 'ನೀರು ಬಿಸಿಯಾಗುತ್ತಿದೆ!'
      },
      {
        label: 'Boiling & Vaporization',
        labelKn: 'ಕುದಿಯುವಿಕೆ ಮತ್ತು ಆವಿ',
        symbol: '💨',
        explanation: 'At 100°C, energetic molecules break surface bonds and escape upward as invisible steam!',
        explanationKn: '100°C ನಲ್ಲಿ ಕಣಗಳು ಬಂಧ ಮುರಿದು ಆವಿಯಾಗಿ ಮೇಲಕ್ಕೆ ಹಾರುತ್ತವೆ!',
        cause: 'Boiling temperature point reached',
        effect: 'Liquid transforms into gaseous water vapor',
        gaugeLabel: 'Steam Energy',
        gaugeValue: '95%',
        gaugePercent: 95,
        sensoryClues: {
          sight: 'Whirls of white vapor rising into the air',
          sightKn: 'ಗಾಳಿಯಲ್ಲಿ ಹಾರುವ ಬಿಳಿ ಹಬೆ',
          touch: 'Hot moist air above',
          touchKn: 'ಬಿಸಿ ತೇವಾಂಶದ ಹಬೆ',
          sound: 'Vigorous bubbling and rolling water',
          soundKn: 'ವೇಗವಾಗಿ ಕುದಿಯುವ ಸದ್ದು'
        },
        aacReactionPhrase: 'Steam rises up!',
        aacReactionPhraseKn: 'ಹಬೆ ಮೇಲಕ್ಕೆ ಏರುತ್ತಿದೆ!'
      },
      {
        label: 'Dispersal into Atmosphere',
        labelKn: 'ವಾತಾವರಣಕ್ಕೆ ಹರಡುವಿಕೆ',
        symbol: '☁️',
        explanation: 'Light water vapor rises high into the cooler sky, ready to form puffy clouds.',
        explanationKn: 'ಹಗುರವಾದ ಹಬೆಯು ತಂಪಾದ ಆಕಾಶಕ್ಕೆ ಏರಿ ಮೋಡಗಳನ್ನು ರೂಪಿಸುತ್ತದೆ.',
        cause: 'Convection rise of hot gas',
        effect: 'Clouds and atmosphere moisture formed',
        gaugeLabel: 'Vapor State',
        gaugeValue: '100%',
        gaugePercent: 100,
        sensoryClues: {
          sight: 'White fluffy cloud forming high above',
          sightKn: 'ಆಕಾಶದಲ್ಲಿ ಬಿಳಿ ಮೋಡಗಳ ರಚನೆ',
          touch: 'Cool refreshing atmospheric breeze',
          touchKn: 'ತಂಪಾದ ಗಾಳಿ',
          sound: 'Whispering wind in sky',
          soundKn: 'ಗಾಳಿಯ ಸದ್ದು'
        },
        aacReactionPhrase: 'Clouds are made!',
        aacReactionPhraseKn: 'ಮೋಡಗಳು ಸಿದ್ಧವಾಗಿವೆ!'
      }
    ];
  } else if (qLower.includes('seed') || qLower.includes('plant') || qLower.includes('sunlight') || qLower.includes('grow')) {
    stepsData = [
      {
        label: 'Dormant Seed in Soil',
        labelKn: 'ಮಣ್ಣಿನಲ್ಲಿ ಬೀಜ',
        symbol: '🌰',
        explanation: 'The seed contains a baby plant embryo waiting for moisture and warmth.',
        explanationKn: 'ಬೀಜವು ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಮತ್ತು ಬೆಚ್ಚಗಿನ ವಾತಾವರಣಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದೆ.',
        cause: 'Planting seed in rich soil',
        effect: 'Seed sits in moist supportive earth',
        gaugeLabel: 'Moisture',
        gaugeValue: '80%',
        gaugePercent: 80,
        sensoryClues: {
          sight: 'Small brown seed resting in dark rich earth',
          sightKn: 'ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ಪುಟ್ಟ ಬೀಜ',
          touch: 'Crumbly, soft moist soil',
          touchKn: 'ಮೃದುವಾದ ತೇವದ ಮಣ್ಣು',
          sound: 'Quiet earth silence',
          soundKn: 'ಶಾಂತ ಮಣ್ಣು'
        },
        aacReactionPhrase: 'Plant the little seed!',
        aacReactionPhraseKn: 'ಪುಟ್ಟ ಬೀಜವನ್ನು ಬಿತ್ತಿರಿ!'
      },
      {
        label: 'Root Germination',
        labelKn: 'ಬೇರು ಚಿಗುರುವಿಕೆ',
        symbol: '🌱',
        explanation: 'Water softens the seed coat, and roots push downward to anchor and drink nutrients.',
        explanationKn: 'ನೀರು ಬೀಜದ ಕವಚವನ್ನು ಮೃದುಗೊಳಿಸಿ ಬೇರುಗಳನ್ನು ಹೊರತರುತ್ತದೆ.',
        cause: 'Water absorption triggers enzymes',
        effect: 'Taproot anchors and drinks minerals',
        gaugeLabel: 'Root Growth',
        gaugeValue: '45mm',
        gaugePercent: 45,
        sensoryClues: {
          sight: 'A tiny pale root poking out and bending down',
          sightKn: 'ಕೆಳಗೆ ಬಾಗುವ ಸಣ್ಣ ಬಿಳಿ ಬೇರು',
          touch: 'Delicate tender green sprout tip',
          touchKn: 'ಕೋಮಲ ಹಸಿರು ಚಿಗುರು',
          sound: 'Gentle water trickling to roots',
          soundKn: 'ಬೇರುಗಳಿಗೆ ಹರಿಯುವ ನೀರು'
        },
        aacReactionPhrase: 'Look, the root sprouts!',
        aacReactionPhraseKn: 'ನೋಡಿ, ಬೇರು ಚಿಗುರುತ್ತಿದೆ!'
      },
      {
        label: 'Sunlight Photosynthesis',
        labelKn: 'ಸೂರ್ಯನ ಬೆಳಕು ಮತ್ತು ಆಹಾರ',
        symbol: '☀️',
        explanation: 'Green leaves unfold and catch sunlight rays to produce sweet glucose food!',
        explanationKn: 'ಹಸಿರು ಎಲೆಗಳು ಸೂರ್ಯನ ಬೆಳಕನ್ನು ಹೀರಿಕೊಂಡು ಸಸ್ಯಕ್ಕೆ ಆಹಾರ ತಯಾರಿಸುತ್ತವೆ!',
        cause: 'Chlorophyll absorbs sunlight photons',
        effect: 'Carbon dioxide + water converted into food + oxygen',
        gaugeLabel: 'Chlorophyll',
        gaugeValue: '90%',
        gaugePercent: 90,
        sensoryClues: {
          sight: 'Bright emerald leaves opening wide to the sun',
          sightKn: 'ಸೂರ್ಯನತ್ತ ಮುಖ ಮಾಡಿದ ಹಸಿರು ಎಲೆಗಳು',
          touch: 'Warm gentle sunshine on leaf surface',
          touchKn: 'ಎಲೆಯ ಮೇಲೆ ಸೂರ್ಯನ ಬೆಚ್ಚಗಿನ ಕಿರಣ',
          sound: 'Leaves rustling in gentle breeze',
          soundKn: 'ಎಲೆಗಳ ಮೃದು ಸದ್ದು'
        },
        aacReactionPhrase: 'Sun gives food!',
        aacReactionPhraseKn: 'ಸೂರ್ಯ ಆಹಾರ ನೀಡುತ್ತಾನೆ!'
      },
      {
        label: 'Flowering & Fruiting',
        labelKn: 'ಹೂವು ಮತ್ತು ಫಲ',
        symbol: '🌸',
        explanation: 'The mature plant blooms vibrant flowers and produces seeds for new generations!',
        explanationKn: 'ಸಂಪೂರ್ಣ ಬೆಳೆದ ಸಸ್ಯವು ಸುಂದರವಾದ ಹೂವುಗಳನ್ನು ಅರಳಿಸುತ್ತದೆ!',
        cause: 'Continuous energy and nutrients',
        effect: 'Healthy thriving blooming plant',
        gaugeLabel: 'Plant Vitality',
        gaugeValue: '100%',
        gaugePercent: 100,
        sensoryClues: {
          sight: 'Colorful blooming flowers with pollen dust',
          sightKn: 'ಸುಂದರವಾದ ಬಣ್ಣದ ಹೂವುಗಳು',
          touch: 'Soft velvety flower petals',
          touchKn: 'ಮೃದುವಾದ ಹೂವಿನ ದಳಗಳು',
          sound: 'Buzzing friendly bees visiting flowers',
          soundKn: 'ಜೇನುನೊಣಗಳ ಝೇಂಕಾರ'
        },
        aacReactionPhrase: 'The flower blooms!',
        aacReactionPhraseKn: 'ಹೂವು ಅರಳಿದೆ!'
      }
    ];
  } else if (qLower.includes('rust') || qLower.includes('corros') || qLower.includes('iron oxide') || qLower.includes('iron')) {
    stepsData = [
      {
        label: 'Clean Shiny Iron Nail',
        labelKn: 'ಹೊಳೆಯುವ ಕಬ್ಬಿಣದ ಮೊಳೆ',
        symbol: '🔩',
        explanation: 'Iron metal atoms in a clean nail are strong, metallic and shiny silver.',
        explanationKn: 'ಕಬ್ಬಿಣದ ಪರಮಾಣುಗಳು ಬಲವಾದ ಹೊಳೆಯುವ ಲೋಹದ ರೂಪದಲ್ಲಿವೆ.',
        cause: 'Exposing iron nail to open environment',
        effect: 'Clean metallic iron surface ready to interact',
        gaugeLabel: 'Metal Purity',
        gaugeValue: '100%',
        gaugePercent: 100,
        sensoryClues: {
          sight: 'Shiny silver reflective metallic iron surface',
          sightKn: 'ಬೆಳ್ಳಿಯಂತೆ ಹೊಳೆಯುವ ಕಬ್ಬಿಣದ ಮೇಲ್ಮೈ',
          touch: 'Hard, cold, smooth metal nail',
          touchKn: 'ಗಟ್ಟಿಯಾದ ನಯವಾದ ಲೋಹ',
          sound: 'Metallic clink on table',
          soundKn: 'ಲೋಹದ ಸದ್ದು'
        },
        aacReactionPhrase: 'Shiny iron nail!',
        aacReactionPhraseKn: 'ಹೊಳೆಯುವ ಕಬ್ಬಿಣದ ಮೊಳೆ!'
      },
      {
        label: 'Moisture & Oxygen Contact',
        labelKn: 'ತೇವಾಂಶ ಮತ್ತು ಆಮ್ಲಜನಕ ಸಂಪರ್ಕ',
        symbol: '💧',
        explanation: 'Water droplets from humid air stick to the iron, dissolving oxygen molecules.',
        explanationKn: 'ಗಾಳಿಯಲ್ಲಿನ ತೇವಾಂಶ ಮತ್ತು ಆಮ್ಲಜನಕವು ಕಬ್ಬಿಣದ ಮೇಲ್ಮೈಯನ್ನು ತಲುಪುತ್ತವೆ.',
        cause: 'Iron exposed to water and atmospheric oxygen',
        effect: 'Oxidation-reduction electrochemical reaction starts',
        gaugeLabel: 'Oxidation Rate',
        gaugeValue: '45%',
        gaugePercent: 45,
        sensoryClues: {
          sight: 'Thin film of water covering metal surface',
          sightKn: 'ಕಬ್ಬಿಣದ ಮೇಲೆ ನೀರಿನ ಸಣ್ಣ ಕಣಗಳು',
          touch: 'Wet damp surface',
          touchKn: 'ತೇವವಾದ ಮೇಲ್ಮೈ',
          sound: 'Quiet damp air',
          soundKn: 'ಶಾಂತ ತೇವಾಂಶದ ಗಾಳಿ'
        },
        aacReactionPhrase: 'Water touches iron!',
        aacReactionPhraseKn: 'ನೀರು ಕಬ್ಬಿಣವನ್ನು ಮುಟ್ಟಿದೆ!'
      },
      {
        label: 'Chemical Rusting (Fe2O3)',
        labelKn: 'ತುಕ್ಕು ಹಿಡಿಯುವ ಪ್ರಕ್ರಿಯೆ',
        symbol: '🪨',
        explanation: 'Iron loses electrons to oxygen and water, forming reddish-brown iron oxide (rust).',
        explanationKn: 'ಕಬ್ಬಿಣವು ಆಮ್ಲಜನಕದೊಂದಿಗೆ ರಾಸಾಯನಿಕ ಕ್ರಿಯೆ ನಡೆಸಿ ಕೆಂಪು-ಕಂದು ಬಣ್ಣದ ತುಕ್ಕು ಉಂಟಾಗುತ್ತದೆ.',
        cause: '4Fe + 3O2 + 6H2O -> 4Fe(OH)3 forms hydrated iron oxide',
        effect: 'Red-orange powdery rust coats the nail',
        gaugeLabel: 'Rust Spread',
        gaugeValue: '90%',
        gaugePercent: 90,
        sensoryClues: {
          sight: 'Rough reddish-brown crust spreading over iron',
          sightKn: 'ಕೆಂಪು-ಕಂದು ಬಣ್ಣದ ತುಕ್ಕು ಹರಡುವುದು',
          touch: 'Rough, gritty, chalky flaky texture',
          touchKn: 'ಒರಟಾದ ಸುಲಭವಾಗಿ ಪುಡಿಯಾಗುವ ಅನುಭವ',
          sound: 'Crumbly scraping sound',
          soundKn: 'ಒರಟಾದ ಸದ್ದು'
        },
        aacReactionPhrase: 'Look at the brown rust!',
        aacReactionPhraseKn: 'ಕಂದು ಬಣ್ಣದ ತುಕ್ಕು ನೋಡಿ!'
      },
      {
        label: 'Weakened Flaky Metal',
        labelKn: 'ದುರ್ಬಲಗೊಂಡ ಲೋಹ',
        symbol: '🍂',
        explanation: 'Because rust is flaky and porous, water reaches deeper layers, weakening the nail.',
        explanationKn: 'ತುಕ್ಕು ಪದರವು ರಂಧ್ರಯುಕ್ತವಾಗಿದ್ದು, ಲೋಹವನ್ನು ಒಳಗಿನಿಂದ ದುರ್ಬಲಗೊಳಿಸುತ್ತದೆ.',
        cause: 'Flaking rust exposes fresh underlying iron',
        effect: 'Structural strength decreases as iron degrades',
        gaugeLabel: 'Corrosion Level',
        gaugeValue: '100%',
        gaugePercent: 100,
        sensoryClues: {
          sight: 'Dull crumbly iron nail covered in rust flakes',
          sightKn: 'ದುರ್ಬಲಗೊಂಡ ತುಕ್ಕು ಹಿಡಿದ ಮೊಳೆ',
          touch: 'Porous brittle crumbling surface',
          touchKn: 'ಪುಡಿಯಾಗುವ ದುರ್ಬಲ ಮೇಲ್ಮೈ',
          sound: 'Flakes crumbling off',
          soundKn: 'ಪುಡಿ ಉದುರುವ ಸದ್ದು'
        },
        aacReactionPhrase: 'Rust made it weak!',
        aacReactionPhraseKn: 'ತುಕ್ಕು ದುರ್ಬಲಗೊಳಿಸಿದೆ!'
      }
    ];
  } else if (qLower.includes('vinegar') || qLower.includes('baking soda') || qLower.includes('fizz') || qLower.includes('acid') || qLower.includes('mix') || qLower.includes('bubble') || qLower.includes('dissolv')) {
    stepsData = [
      {
        label: 'Prepare Ingredients',
        labelKn: 'ಪದಾರ್ಥಗಳ ಸಿದ್ಧತೆ',
        symbol: '🧂',
        explanation: 'Gather the base materials into the beaker to observe initial properties.',
        explanationKn: 'ಪ್ರಾರಂಭಿಕ ಗುಣಲಕ್ಷಣಗಳನ್ನು ಗಮನಿಸಲು ಸಾಮಗ್ರಿಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ.',
        cause: 'Measuring powders and liquids',
        effect: 'Substances sit ready before chemical reaction',
        gaugeLabel: 'Reactant Level',
        gaugeValue: '100%',
        gaugePercent: 100,
        sensoryClues: {
          sight: 'White baking soda powder resting in dry glass',
          sightKn: 'ಪಾತ್ರೆಯಲ್ಲಿ ಬಿಳಿ ಪುಡಿ',
          touch: 'Powdery, dry room-temperature texture',
          touchKn: 'ಒಣಗಿದ ಮೃದು ಪುಡಿ',
          sound: 'Quiet laboratory beaker',
          soundKn: 'ಶಾಂತ ವಾತಾವರಣ'
        },
        aacReactionPhrase: 'Ready the materials!',
        aacReactionPhraseKn: 'ಸಾಮಗ್ರಿ ಸಿದ್ಧವಾಗಿದೆ!'
      },
      {
        label: 'Combine & Contact',
        labelKn: 'ಸಂಯೋಜನೆ ಮತ್ತು ಸಂಪರ್ಕ',
        symbol: '🍶',
        explanation: 'Pouring vinegar onto baking soda initiates immediate acid-base molecular contact.',
        explanationKn: 'ವಿನೆಗರ್ ಮತ್ತು ಬೇಕಿಂಗ್ ಸೋಡಾ ಸೇರಿದಾಗ ತಕ್ಷಣದ ರಾಸಾಯನಿಕ ಕ್ರಿಯೆ ಆರಂಭವಾಗುತ್ತದೆ.',
        cause: 'Liquid pours over powder',
        effect: 'Acid reacts with sodium bicarbonate',
        gaugeLabel: 'Reaction Speed',
        gaugeValue: '45%',
        gaugePercent: 45,
        sensoryClues: {
          sight: 'Liquid rapidly absorbs and starts foaming',
          sightKn: 'ದ್ರವವು ಪುಡಿಯನ್ನು ಹೀರಿಕೊಂಡು ನೊರೆ ಆರಂಭ',
          touch: 'Container starts feeling noticeably cool',
          touchKn: 'ಪಾತ್ರೆ ತಣ್ಣಗಾಗಲು ಆರಂಭವಾಗುತ್ತದೆ',
          sound: 'Initial sizzling whisper',
          soundKn: 'ಸಣ್ಣ ಸಿಜ್ಲಿಂಗ್ ಸದ್ದು'
        },
        aacReactionPhrase: 'Pour and mix together!',
        aacReactionPhraseKn: 'ಒಟ್ಟಿಗೆ ಸೇರಿಸಿ!'
      },
      {
        label: 'Rapid Effervescence & CO2 Gas',
        labelKn: 'ನೊರೆ ಮತ್ತು ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್',
        symbol: '🫧',
        explanation: 'Millions of Carbon Dioxide (CO2) gas bubbles erupt, creating foamy white fizz!',
        explanationKn: 'ಲಕ್ಷಾಂತರ ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್ ಅನಿಲದ ಗುಳ್ಳೆಗಳು ಹೊರಬಂದು ನೊರೆ ಉಕ್ಕುತ್ತದೆ!',
        cause: 'Carbonic acid decomposes into water and gas',
        effect: 'Vigorous bubbling eruption fills the beaker',
        gaugeLabel: 'Gas Release',
        gaugeValue: '98%',
        gaugePercent: 98,
        sensoryClues: {
          sight: 'Tower of white fizzy froth rising up',
          sightKn: 'ಮೇಲಕ್ಕೆ ಏಳುವ ಬಿಳಿ ನೊರೆ',
          touch: 'Chilly endothermic reaction cool to touch',
          touchKn: 'ಮುಟ್ಟಲು ತುಂಬಾ ತಂಪಾದ ಅನುಭವ',
          sound: 'Loud crisp fizzing and crackling bubbles',
          soundKn: 'ವೇಗವಾಗಿ ನೊರೆ ಉಕ್ಕುವ ಸದ್ದು'
        },
        aacReactionPhrase: 'Look at the bubbles fizz!',
        aacReactionPhraseKn: 'ಗುಳ್ಳೆಗಳು ನೊರೆ ಉಕ್ಕುತ್ತಿವೆ!'
      },
      {
        label: 'Settled Chemical Solution',
        labelKn: 'ಸ್ಥಿರಗೊಂಡ ದ್ರಾವಣ',
        symbol: '🧪',
        explanation: 'The gas escapes into the air, leaving behind sodium acetate salt in calm water.',
        explanationKn: 'ಅನಿಲವು ಗಾಳಿಯಲ್ಲಿ ಹಾರಿಹೋಗಿ ಶಾಂತ ದ್ರಾವಣವು ಉಳಿಯುತ್ತದೆ.',
        cause: 'Neutralization reaction completes',
        effect: 'Clear balanced solution with all gas discharged',
        gaugeLabel: 'Equilibrium',
        gaugeValue: '100%',
        gaugePercent: 100,
        sensoryClues: {
          sight: 'Clear resting liquid with tiny surface pops',
          sightKn: 'ತಿಳಿಯಾದ ಶಾಂತ ದ್ರಾವಣ',
          touch: 'Cool, still container',
          touchKn: 'ತಣ್ಣಗಾದ ಸ್ಥಿರ ಪಾತ್ರೆ',
          sound: 'Gentle final fizz fading into quiet',
          soundKn: 'ಶಾಂತವಾಗುವ ಸದ್ದು'
        },
        aacReactionPhrase: 'Reaction complete!',
        aacReactionPhraseKn: 'ಪ್ರಕ್ರಿಯೆ ಮುಗಿದಿದೆ!'
      }
    ];
  } else if (qLower.includes('bulb') || qLower.includes('battery') || qLower.includes('circuit') || qLower.includes('wire') || qLower.includes('electric') || qLower.includes('light')) {
    stepsData = [
      {
        label: 'Open Circuit Setup',
        labelKn: 'ಮುಕ್ತ ಸರ್ಕ್ಯೂಟ್ ಸೆಟಪ್',
        symbol: '🔋',
        explanation: 'Connecting the battery and wires with an open switch. Electrons wait to flow.',
        explanationKn: 'ಬ್ಯಾಟರಿ ಮತ್ತು ತಂತಿಗಳನ್ನು ಜೋಡಿಸಲಾಗಿದೆ. ಸ್ವಿಚ್ ಆಫ್ ಆಗಿದೆ.',
        cause: 'Arranging components',
        effect: 'Stored chemical potential energy in battery',
        gaugeLabel: 'Stored Voltage',
        gaugeValue: '1.5V',
        gaugePercent: 50,
        sensoryClues: {
          sight: 'Dark, unlit bulb with wires attached',
          sightKn: 'ಬೆಳಗದ ಬಲ್ಬ್ ಮತ್ತು ತಂತಿಗಳು',
          touch: 'Smooth, cool metallic wires and bulb glass',
          touchKn: 'ತಂಪಾದ ಲೋಹದ ತಂತಿಗಳು',
          sound: 'Silent circuit',
          soundKn: 'ಶಾಂತ ಸರ್ಕ್ಯೂಟ್'
        },
        aacReactionPhrase: 'Connect the battery!',
        aacReactionPhraseKn: 'ಬ್ಯಾಟರಿ ಜೋಡಿಸಿ!'
      },
      {
        label: 'Close the Switch',
        labelKn: 'ಸ್ವಿಚ್ ಆನ್ ಮಾಡಿ',
        symbol: '⚡',
        explanation: 'Closing the switch completes the loop, allowing electric current to flow through.',
        explanationKn: 'ಸ್ವಿಚ್ ಹಾಕಿದಾಗ ವಿದ್ಯುತ್ ಪ್ರವಾಹವು ತಂತಿಯ ಮೂಲಕ ಹರಿಯಲು ಪ್ರಾರಂಭಿಸುತ್ತದೆ.',
        cause: 'Closing physical switch',
        effect: 'Complete electrical circuit loop established',
        gaugeLabel: 'Current Flow',
        gaugeValue: '0.5A',
        gaugePercent: 75,
        sensoryClues: {
          sight: 'Tiny spark at switch contact',
          sightKn: 'ಸಣ್ಣ ಕಿಡಿ',
          touch: 'Firm mechanical click',
          touchKn: 'ಸ್ವಿಚ್ ಕ್ಲಿಕ್ ಅನುಭವ',
          sound: 'Snappy click sound',
          soundKn: 'ಕ್ಲಿಕ್ ಸದ್ದು'
        },
        aacReactionPhrase: 'Turn on switch!',
        aacReactionPhraseKn: 'ಸ್ವಿಚ್ ಆನ್ ಮಾಡಿ!'
      },
      {
        label: 'Filament Heating',
        labelKn: 'ಫಿಲಮೆಂಟ್ ಬಿಸಿಯಾಗುವುದು',
        symbol: '💡',
        explanation: 'Electrons push through the thin tungsten filament, creating resistance and glowing heat.',
        explanationKn: 'ಫಿಲಮೆಂಟ್ ಮೂಲಕ ವಿದ್ಯುತ್ ಹರಿದಾಗ ಅದು ಬಿಸಿಯಾಗಿ ಪ್ರಕಾಶಮಾನವಾಗಿ ಹೊಳೆಯುತ್ತದೆ.',
        cause: 'Electrical resistance converts energy to heat and light',
        effect: 'Filament glows bright white-yellow',
        gaugeLabel: 'Brightness',
        gaugeValue: '100%',
        gaugePercent: 100,
        sensoryClues: {
          sight: 'Radiant glowing golden light spreading everywhere',
          sightKn: 'ಪ್ರಕಾಶಮಾನವಾದ ಬಂಗಾರದ ಬೆಳಕು',
          touch: 'Gentle radiant warmth above bulb',
          touchKn: 'ಬೆಚ್ಚಗಿನ ಶಾಖ',
          sound: 'Gentle electric hum',
          soundKn: 'ಸಣ್ಣ ಝೇಂಕಾರ'
        },
        aacReactionPhrase: 'The bulb lights up!',
        aacReactionPhraseKn: 'ಬಲ್ಬ್ ಬೆಳಗುತ್ತಿದೆ!'
      },
      {
        label: 'Continuous Illumination',
        labelKn: 'ನಿರಂತರ ಬೆಳಕು',
        symbol: '🌟',
        explanation: 'The completed circuit powers the room! Energy flows steadily from battery to light.',
        explanationKn: 'ಪೂರ್ಣಗೊಂಡ ಸರ್ಕ್ಯೂಟ್ ಕೋಣೆಯನ್ನು ಬೆಳಗಿಸುತ್ತದೆ! ವಿದ್ಯುತ್ ಸ್ಥಿರವಾಗಿ ಹರಿಯುತ್ತದೆ.',
        cause: 'Steady direct current circulation',
        effect: 'Useful electrical energy illuminates surroundings',
        gaugeLabel: 'Circuit Stability',
        gaugeValue: '100%',
        gaugePercent: 100,
        sensoryClues: {
          sight: 'Steady beam illuminating the sandbox',
          sightKn: 'ಕೋಣೆಯನ್ನು ಬೆಳಗಿಸುವ ಸ್ಥಿರ ಬೆಳಕು',
          touch: 'Warm glass surface',
          touchKn: 'ಬೆಚ್ಚಗಿನ ಗಾಜು',
          sound: 'Quiet bright environment',
          soundKn: 'ಶಾಂತ ಬೆಳಕು'
        },
        aacReactionPhrase: 'We made light!',
        aacReactionPhraseKn: 'ನಾವು ಬೆಳಕು ನೀಡಿದೆವು!'
      }
    ];
  } else if (qLower.includes('magnet') || qLower.includes('attract') || qLower.includes('repel') || qLower.includes('pole')) {
    stepsData = [
      {
        label: 'Positioning Magnets',
        labelKn: 'ಆಯಸ್ಕಾಂತಗಳ ಇಡುವಿಕೆ',
        symbol: '🧲',
        explanation: 'Placing two magnets with magnetic fields surrounding both North and South poles.',
        explanationKn: 'ಉತ್ತರ ಮತ್ತು ದಕ್ಷಿಣ ಧ್ರುವಗಳೊಂದಿಗೆ ಆಯಸ್ಕಾಂತಗಳನ್ನು ಇಡುವುದು.',
        cause: 'Bringing magnetic materials near',
        effect: 'Invisible magnetic field lines interact',
        gaugeLabel: 'Field Strength',
        gaugeValue: '35 Gauss',
        gaugePercent: 35,
        sensoryClues: {
          sight: 'Red and blue painted magnetic bars',
          sightKn: 'ಕೆಂಪು ಮತ್ತು ನೀಲಿ ಆಯಸ್ಕಾಂತಗಳು',
          touch: 'Heavy metallic smooth stones',
          touchKn: 'ನಯವಾದ ಗಟ್ಟಿ ಆಯಸ್ಕಾಂತ',
          sound: 'Quiet lab table',
          soundKn: 'ಶಾಂತ ಮೇಜು'
        },
        aacReactionPhrase: 'Hold the magnets!',
        aacReactionPhraseKn: 'ಆಯಸ್ಕಾಂತ ಹಿಡಿಯಿರಿ!'
      },
      {
        label: 'Magnetic Force Field',
        labelKn: 'ಆಯಸ್ಕಾಂತೀಯ ಬಲ',
        symbol: '✨',
        explanation: 'Opposite poles attract with an invisible magnetic pull that gets stronger as they near.',
        explanationKn: 'ವಿರುದ್ಧ ಧ್ರುವಗಳು ಹತ್ತಿರ ಬಂದಾಗ ಅಜ್ಞಾತ ಆಕರ್ಷಕ ಬಲವು ಹೆಚ್ಚಾಗುತ್ತದೆ.',
        cause: 'Moving poles closer in space',
        effect: 'Invisible pull pulls them towards each other',
        gaugeLabel: 'Pull Force',
        gaugeValue: '80%',
        gaugePercent: 80,
        sensoryClues: {
          sight: 'Iron filings forming curved field lines',
          sightKn: 'ಕಬ್ಬಿಣದ ರಜಕಣಗಳು ವಕ್ರಾಕಾರವಾಗಿ ಜೋಡಣೆ',
          touch: 'Hands feel invisible tug pulling together',
          touchKn: 'ಕೈಗಳಿಗೆ ಅಗೋಚರ ಎಳೆತದ ಅನುಭವ',
          sound: 'Air rushing as they accelerate',
          soundKn: 'ವೇಗದ ಎಳೆತ'
        },
        aacReactionPhrase: 'I feel the pull!',
        aacReactionPhraseKn: 'ನನಗೆ ಎಳೆತ ಅನಿಸುತ್ತಿದೆ!'
      },
      {
        label: 'Snap & Lock',
        labelKn: 'ಲಾಕ್ ಆಗುವುದು',
        symbol: '🧲',
        explanation: 'The opposite magnetic poles snap firmly together, locking securely!',
        explanationKn: 'ವಿರುದ್ಧ ಧ್ರುವಗಳು ಗಟ್ಟಿಯಾಗಿ ಒಂದಕ್ಕೊಂದು ಅಂಟಿಕೊಳ್ಳುತ್ತವೆ!',
        cause: 'Magnetic attraction overcomes inertia',
        effect: 'Magnets snap securely together in solid contact',
        gaugeLabel: 'Contact Bond',
        gaugeValue: '100%',
        gaugePercent: 100,
        sensoryClues: {
          sight: 'North and South poles locked tight',
          sightKn: 'ಉತ್ತರ-ದಕ್ಷಿಣ ಧ್ರುವಗಳು ಗಟ್ಟಿಯಾಗಿ ಅಂಟಿಕೊಂಡಿವೆ',
          touch: 'Firm solid bond requiring effort to pull apart',
          touchKn: 'ಬೇರ್ಪಡಿಸಲು ಶ್ರಮ ಬೇಕಾಗುವ ಗಟ್ಟಿ ಬಂಧ',
          sound: 'Sharp metallic snap or clack',
          soundKn: 'ಗಟ್ಟಿಯಾದ ಕ್ಲಿಕ್ ಸದ್ದು'
        },
        aacReactionPhrase: 'They snap together!',
        aacReactionPhraseKn: 'ಒಟ್ಟಿಗೆ ಅಂಟಿಕೊಂಡಿವೆ!'
      }
    ];
  } else if (qLower.includes('balloon') || qLower.includes('static') || qLower.includes('hair') || qLower.includes('rub') || qLower.includes('friction')) {
    stepsData = [
      {
        label: 'Neutral Materials',
        labelKn: 'ತಟಸ್ಥ ಸ್ಥಿತಿ',
        symbol: '🎈',
        explanation: 'The balloon and hair have an equal balance of positive and negative charges.',
        explanationKn: 'ಬಲೂನ್ ಮತ್ತು ಕೂದಲು ಸಮಾನ ಚಾರ್ಜ್ ಹೊಂದಿರುತ್ತವೆ.',
        cause: 'Inspecting resting balloon',
        effect: 'No static attraction initially',
        gaugeLabel: 'Charge Balance',
        gaugeValue: '0 Coulomb',
        gaugePercent: 20,
        sensoryClues: {
          sight: 'Smooth rubber balloon resting near hair',
          sightKn: 'ಶಾಂತ ಬಲೂನ್',
          touch: 'Soft, smooth elastic rubber',
          touchKn: 'ಮೃದು ರಬ್ಬರ್',
          sound: 'Silent room',
          soundKn: 'ಶಾಂತ ಕೋಣೆ'
        },
        aacReactionPhrase: 'Hold the balloon!',
        aacReactionPhraseKn: 'ಬಲೂನ್ ಹಿಡಿಯಿರಿ!'
      },
      {
        label: 'Friction Rubbing',
        labelKn: 'ಘರ್ಷಣೆ ಮತ್ತು ಉಜ್ಜುವಿಕೆ',
        symbol: '⚡',
        explanation: 'Rubbing the balloon transfers negative electrons from hair onto the rubber surface.',
        explanationKn: 'ಬಲೂನ್ ಉಜ್ಜಿದಾಗ ಎಲೆಕ್ಟ್ರಾನ್‌ಗಳು ವರ್ಗಾವಣೆಯಾಗುತ್ತವೆ.',
        cause: 'Mechanical friction across surfaces',
        effect: 'Balloon gains static negative charge',
        gaugeLabel: 'Static Charge',
        gaugeValue: '85%',
        gaugePercent: 85,
        sensoryClues: {
          sight: 'Friction motion back and forth',
          sightKn: 'ವೇಗವಾಗಿ ಉಜ್ಜುವುದು',
          touch: 'Tingling sensation on fingertips',
          touchKn: 'ಬೆರಳುಗಳಲ್ಲಿ ರೋಮಾಂಚಕ ಅನುಭವ',
          sound: 'Squeaky rubber rubbing sound',
          soundKn: 'ರಬ್ಬರ್ ಉಜ್ಜುವ ಸದ್ದು'
        },
        aacReactionPhrase: 'Rub with friction!',
        aacReactionPhraseKn: 'ಉಜ್ಜು!'
      },
      {
        label: 'Static Attraction & Hair Lift',
        labelKn: 'ಕೂದಲು ಮೇಲಕ್ಕೆ ಏಳುವುದು',
        symbol: '✨',
        explanation: 'Holding the charged balloon near hair makes strands stand straight up toward it!',
        explanationKn: 'ಚಾರ್ಜ್ ಆದ ಬಲೂನ್ ಹತ್ತಿರ ತಂದಾಗ ಕೂದಲುಗಳು ಮೇಲಕ್ಕೆ ಎದ್ದು ನಿಲ್ಲುತ್ತವೆ!',
        cause: 'Electrostatic force pulls opposite charges',
        effect: 'Hair strands float up toward balloon against gravity',
        gaugeLabel: 'Electrostatic Pull',
        gaugeValue: '100%',
        gaugePercent: 100,
        sensoryClues: {
          sight: 'Hair strands floating upward defying gravity',
          sightKn: 'ಗಾಳಿಯಲ್ಲಿ ತೇಲುವ ಕೂದಲುಗಳು',
          touch: 'Tickly static tingle near skin',
          touchKn: 'ಚರ್ಮದ ಮೇಲೆ ಸಣ್ಣ ರೋಮಾಂಚನ',
          sound: 'Tiny crackling static pop',
          soundKn: 'ಸಣ್ಣ ಸ್ಥಿರ ವಿದ್ಯುತ್ ಸದ್ದು'
        },
        aacReactionPhrase: 'My hair stands up!',
        aacReactionPhraseKn: 'ಕೂದಲು ಮೇಲಕ್ಕೆ ನಿಂತಿದೆ!'
      }
    ];
  } else if (qLower.includes('volcano') || qLower.includes('lava') || qLower.includes('erupt')) {
    stepsData = [
      {
        label: 'Magma Chamber Pressure',
        labelKn: 'ಶಿಲಾರಸದ ಒತ್ತಡ',
        symbol: '🌋',
        explanation: 'Deep underground, molten rock and trapped gases build intense upward pressure.',
        explanationKn: 'ಭೂಮಿಯ ಆಳದಲ್ಲಿ ಕರಗಿದ ಶಿಲಾರಸ ಮತ್ತು ಅನಿಲಗಳು ಹೆಚ್ಚಿನ ಒತ್ತಡವನ್ನು ಉಂಟುಮಾಡುತ್ತವೆ.',
        cause: 'Tectonic heat melts subsurface rock',
        effect: 'Magma pool swells beneath volcanic cone',
        gaugeLabel: 'Chamber Pressure',
        gaugeValue: '850 PSI',
        gaugePercent: 75,
        sensoryClues: {
          sight: 'Volcano cone with thin wisps of sulfur steam',
          sightKn: 'ಹಬೆ ಹೊರಸೂಸುವ ಜ್ವಾಲಾಮುಖಿ',
          touch: 'Trembling warm earth surface',
          touchKn: 'ಬೆಚ್ಚಗಿನ ಭೂಕಂಪನದ ಅನುಭವ',
          sound: 'Deep low subterranean rumble',
          soundKn: 'ಆಳವಾದ ಗರ್ಜನೆ'
        },
        aacReactionPhrase: 'Pressure is rising!',
        aacReactionPhraseKn: 'ಒತ್ತಡ ಹೆಚ್ಚುತ್ತಿದೆ!'
      },
      {
        label: 'Volcanic Eruption',
        labelKn: 'ಜ್ವಾಲಾಮುಖಿ ಸ್ಫೋಟ',
        symbol: '💥',
        explanation: 'The crust cracks and explosive gases blast red-hot lava high into the sky!',
        explanationKn: 'ಒತ್ತಡ ತಡೆಯಲಾಗದೆ ಕೆಂಪು ಶಿಲಾರಸವು ಆಕಾಶಕ್ಕೆ ಚಿಮ್ಮುತ್ತದೆ!',
        cause: 'Pressure exceeds rock strength',
        effect: 'Cataclysmic ejection of lava, ash, and pyroclastic gas',
        gaugeLabel: 'Eruption Intensity',
        gaugeValue: '100%',
        gaugePercent: 100,
        sensoryClues: {
          sight: 'Fountains of glowing orange-red liquid fire',
          sightKn: 'ಕೆಂಪು-ಕಿತ್ತಳೆ ಬಣ್ಣದ ಬೆಂಕಿಯ ಚಿಲುಮೆ',
          touch: 'Intense blistering heat even from afar',
          touchKn: 'ಅತಿಯಾದ ಶಾಖ',
          sound: 'Roaring boom echoing across mountains',
          soundKn: 'ಭಾರಿ ಸ್ಫೋಟದ ಸದ್ದು'
        },
        aacReactionPhrase: 'The volcano erupts!',
        aacReactionPhraseKn: 'ಜ್ವಾಲಾಮುಖಿ ಸ್ಫೋಟಿಸಿದೆ!'
      },
      {
        label: 'Lava Flow & Cooling Rock',
        labelKn: 'ಲಾವಾ ಹರಿವು ಮತ್ತು ತಂಪಾಗುವಿಕೆ',
        symbol: '🪨',
        explanation: 'Hot lava rivers cool down on the surface, hardening into brand new basalt rock.',
        explanationKn: 'ಹರಿಯುವ ಲಾವಾ ತಂಪಾಗಿ ಹೊಸ ಕಪ್ಪು ಬಂಡೆಗಳಾಗಿ ಮಾರ್ಪಡುತ್ತದೆ.',
        cause: 'Atmosphere absorbs heat from magma',
        effect: 'Molten lava solidifies into volcanic igneous rock',
        gaugeLabel: 'Solidification',
        gaugeValue: '90%',
        gaugePercent: 90,
        sensoryClues: {
          sight: 'Glowing red crust turning into black solid stone',
          sightKn: 'ಕಪ್ಪು ಕಲ್ಲಾಗಿ ಬದಲಾಗುವ ಲಾವಾ',
          touch: 'Gradually cooling crusty dark rock',
          touchKn: 'ತಂಪಾಗುವ ಒರಟು ಕಲ್ಲು',
          sound: 'Cracking and hissing as steam vents',
          soundKn: 'ಹಿಸ್ ಎನ್ನುವ ತಂಪಾಗುವ ಸದ್ದು'
        },
        aacReactionPhrase: 'Lava turns to rock!',
        aacReactionPhraseKn: 'ಲಾವಾ ಕಲ್ಲಾಗುತ್ತಿದೆ!'
      }
    ];
  } else {
    // Dynamic Intelligent Inquiry Sequence tailored specifically to this question
    const qClean = question.replace(/^(what happens when|how does|why does|what if|explain|can you|how do)\s+/i, '').replace(/[?.,!]/g, '').trim();
    const subject = qClean || 'this experiment';

    stepsData = [
      {
        label: `Inspect ${subject.slice(0, 22)}`,
        labelKn: 'ಪ್ರಾರಂಭಿಕ ಪರೀಕ್ಷೆ',
        symbol: '🔍',
        explanation: `Observe the baseline materials and conditions for "${question}".`,
        explanationKn: `"${question}" ಗಾಗಿ ಪ್ರಾರಂಭಿಕ ಸಾಮಗ್ರಿಗಳನ್ನು ಗಮನಿಸಿ.`,
        cause: 'Setting up experimental sandbox',
        effect: 'Materials resting in natural initial state',
        gaugeLabel: 'Baseline State',
        gaugeValue: '25%',
        gaugePercent: 25,
        sensoryClues: {
          sight: `Clear view of materials for ${subject.slice(0, 20)}`,
          sightKn: 'ಸಾಮಗ್ರಿಗಳ ಸ್ಪಷ್ಟ ನೋಟ',
          touch: 'Resting room-temperature materials',
          touchKn: 'ಸಾಮಾನ್ಯ ತಾಪಮಾನ',
          sound: 'Quiet laboratory setup',
          soundKn: 'ಶಾಂತ ವಾತಾವರಣ'
        },
        aacReactionPhrase: `I see the materials!`,
        aacReactionPhraseKn: 'ನಾನು ಸಾಮಗ್ರಿಗಳನ್ನು ನೋಡುತ್ತಿದ್ದೇನೆ!'
      },
      {
        label: `Trigger Action & Energy`,
        labelKn: 'ಕ್ರಿಯೆ ಮತ್ತು ಶಕ್ತಿ',
        symbol: '⚡',
        explanation: `Apply the trigger, force, or energy change described in "${question}".`,
        explanationKn: `"${question}" ನಲ್ಲಿ ವಿವರಿಸಿದ ಕ್ರಿಯೆ ಅಥವಾ ಶಕ್ತಿಯನ್ನು ಅನ್ವಯಿಸಿ.`,
        cause: 'Applying experimental action or force',
        effect: 'Energy input starts molecular or physical reaction',
        gaugeLabel: 'Energy Input',
        gaugeValue: '60%',
        gaugePercent: 60,
        sensoryClues: {
          sight: 'Active motion and energy transfer occurring',
          sightKn: 'ಚಲನೆ ಮತ್ತು ಶಕ್ತಿ ವರ್ಗಾವಣೆ',
          touch: 'Noticeable shift in force or temperature',
          touchKn: 'ತಾಪಮಾನ ಅಥವಾ ಬಲದ ಬದಲಾವಣೆ',
          sound: 'Action and interaction sounds',
          soundKn: 'ಕ್ರಿಯೆಯ ಸದ್ದು'
        },
        aacReactionPhrase: `Start the reaction!`,
        aacReactionPhraseKn: 'ಪ್ರಕ್ರಿಯೆ ಪ್ರಾರಂಭಿಸಿ!'
      },
      {
        label: `Observable Transformation`,
        labelKn: 'ಗೋಚರಿಸುವ ಬದಲಾವಣೆ',
        symbol: '🔄',
        explanation: `The system reacts and changes form, state, or behavior in response.`,
        explanationKn: `ವ್ಯವಸ್ಥೆಯು ಬದಲಾವಣೆಗೆ ಒಳಗಾಗಿ ಹೊಸ ಸ್ಥಿತಿಗೆ ತಲುಪುತ್ತದೆ.`,
        cause: 'Molecules and forces interact',
        effect: `Observable transformation answering: "${question}"`,
        gaugeLabel: 'Reaction Level',
        gaugeValue: '85%',
        gaugePercent: 85,
        sensoryClues: {
          sight: 'Visible transformation taking place on stage',
          sightKn: 'ಸ್ಪಷ್ಟವಾಗಿ ಗೋಚರಿಸುವ ಬದಲಾವಣೆ',
          touch: 'Physical change you can detect',
          touchKn: 'ಅನುಭವಿಸಬಹುದಾದ ಬದಲಾವಣೆ',
          sound: 'Active transformation reaction sounds',
          soundKn: 'ರೂಪಾಂತರದ ಸದ್ದು'
        },
        aacReactionPhrase: `Look at it change!`,
        aacReactionPhraseKn: 'ಬದಲಾವಣೆಯನ್ನು ನೋಡಿ!'
      },
      {
        label: `Final Scientific Outcome`,
        labelKn: 'ಅಂತಿಮ ವೈಜ್ಞಾನಿಕ ಫಲಿತಾಂಶ',
        symbol: '🌟',
        explanation: `The reaction completes, demonstrating the scientific cause-and-effect principle!`,
        explanationKn: `ಪ್ರಕ್ರಿಯೆ ಪೂರ್ಣಗೊಂಡು ವೈಜ್ಞಾನಿಕ ಕ್ರಿಯೆ-ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಸಾಬೀತುಪಡಿಸುತ್ತದೆ!`,
        cause: 'Full cause-and-effect cycle runs to completion',
        effect: `Final result is produced and stabilized`,
        gaugeLabel: 'Outcome State',
        gaugeValue: '100%',
        gaugePercent: 100,
        sensoryClues: {
          sight: 'Final stable result clearly visible',
          sightKn: 'ಅಂತಿಮ ಫಲಿತಾಂಶ ಗೋಚರವಾಗಿದೆ',
          touch: 'Settled final state',
          touchKn: 'ಸ್ಥಿರಗೊಂಡ ಸ್ಥಿತಿ',
          sound: 'Peaceful completion silence',
          soundKn: 'ಪೂರ್ಣಗೊಂಡ ಶಾಂತತೆ'
        },
        aacReactionPhrase: `Experiment completed!`,
        aacReactionPhraseKn: 'ಪ್ರಯೋಗ ಪೂರ್ಣಗೊಂಡಿದೆ!'
      }
    ];
  }

  const steps = stepsData.map((s, idx, arr) => ({
    stepNumber: idx + 1,
    id: `step-${idx + 1}`,
    name: s.label,
    nameKn: s.labelKn || s.label,
    symbol: s.symbol,
    actionButtonLabel: `Trigger ${s.label}`,
    actionButtonLabelKn: `${s.labelKn || s.label} ಸಕ್ರಿಯಗೊಳಿಸಿ`,
    pipExplanation: s.explanation,
    pipExplanationKn: s.explanationKn || s.explanation,
    visualState: {
      skyGradient: idx % 2 === 0 ? 'from-sky-300 via-sky-100 to-indigo-100' : 'from-amber-200 via-orange-100 to-sky-200',
      stageAtmosphere: s.explanation,
      activeVisualEmoji: s.symbol,
      animationType: 'pulse' as const,
      gaugeLabel: s.gaugeLabel,
      gaugeValue: s.gaugeValue,
      gaugePercent: s.gaugePercent
    },
    causeAndEffect: {
      cause: s.cause,
      effect: s.effect
    },
    sensoryClues: s.sensoryClues,
    aacReactionPhrase: s.aacReactionPhrase,
    aacReactionPhraseKn: s.aacReactionPhraseKn
  }));

  return {
    topic: topic || 'Science Inquiry',
    topicKn: topic || 'ವಿಜ್ಞಾನ ವಿಚಾರಣೆ',
    inquiryQuestion: question,
    inquiryQuestionKn: question,
    introMessage: `Welcome! Let's explore the cause and effect for: "${question}"`,
    introMessageKn: `ಸುಸ್ವಾಗತ! "${question}" ಪ್ರಶ್ನೆಗಾಗಿ ಕ್ರಿಯೆ ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಪರೀಕ್ಷಿಸೋಣ!`,
    themeType: 'general' as const,
    celebrationMessage: `Hurray! You simulated the complete reaction for "${question}"!`,
    celebrationMessageKn: `ಅದ್ಭುತ! ನೀವು "${question}" ಪ್ರಯೋಗದ ಸಂಪೂರ್ಣ ಚಕ್ರವನ್ನು ಮುಗಿಸಿದ್ದೀರಿ!`,
    steps
  };
}
