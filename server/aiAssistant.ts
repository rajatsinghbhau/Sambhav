import { IncomingMessage, ServerResponse } from 'http';

/**
 * Serverless handler for AI Inclusive Activities Generation (#1).
 * Calls Gemini 2.5 Flash on the server side only; zero client key exposure.
 */
export async function handleGenerateActivities(
  req: IncomingMessage,
  res: ServerResponse,
  apiKey: string
) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Server API key not configured' }));
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body);
      const { conceptLabel, conceptExplanation } = parsed;

      if (!conceptLabel) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'conceptLabel is required' }));
        return;
      }

      const prompt = `
You are an expert inclusive special-education curriculum designer.
Generate 4 diverse, accessible pre-class teaching activities for introducing the concept: "${conceptLabel}" (${conceptExplanation || ''}).

Required activity types:
1. "Hands-on": Real-life tactile, concrete, multi-sensory experiment (using everyday classroom items like ice, cold glass, wet paper).
2. "Visual": Picture / diagram / color breakdown of the process.
3. "Movement": Physical movement / kinesthetic roleplay for the children.
4. "Pair Activity" or "Communication": Low-anxiety partner interaction or AAC symbol response.

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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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

      if (!response.ok) {
        const errText = await response.text();
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Gemini API call failed', details: errText }));
        return;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedActivities = JSON.parse(content || '{}');

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
  apiKey: string
) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Server API key not configured' }));
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body);
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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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

      if (!response.ok) {
        const errText = await response.text();
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Gemini API call failed', details: errText }));
        return;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedExplanation = JSON.parse(content || '{}');

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
 * Generates 3 multi-tier inclusive revision checkpoint questions with Gemini 2.5 Flash.
 */
export async function handleGenerateExamCheckpoint(
  req: IncomingMessage,
  res: ServerResponse,
  apiKey: string
) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Server API key not configured' }));
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body);
      const { conceptLabel, conceptExplanation } = parsed;

      if (!conceptLabel) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'conceptLabel is required' }));
        return;
      }

      const prompt = `
You are an expert inclusive special-education examiner.
Create 3 diverse, accessible revision checkpoint questions for testing and reviewing: "${conceptLabel}" (${conceptExplanation || ''}).

Question Requirements:
1. "visual_symbol": Identify visual representation or symbol of the concept.
2. "real_life": Recognize everyday real-life observation where this happens.
3. "cause_effect": Understand what causes this to happen in the curriculum sequence.

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
    },
    {
      "id": "q-2",
      "type": "real_life",
      "prompt": "Question text...",
      "options": ["Option A", "Option B", "Option C"],
      "correctIndex": 1,
      "explanation": "Why this option is correct..."
    },
    {
      "id": "q-3",
      "type": "cause_effect",
      "prompt": "Question text...",
      "options": ["Option A", "Option B", "Option C"],
      "correctIndex": 0,
      "explanation": "Why this option is correct..."
    }
  ]
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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

      if (!response.ok) {
        const errText = await response.text();
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Gemini API call failed', details: errText }));
        return;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedCheckpoint = JSON.parse(content || '{}');

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
