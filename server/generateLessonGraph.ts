import { IncomingMessage, ServerResponse } from 'http';

/**
 * Serverless / backend handler for Concept Graph generation.
 * This runs ONLY on the server side (Node.js).
 * The API key is kept completely isolated on the server.
 */
export async function handleGenerateLessonGraph(
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
      const lessonText = parsed.lessonText;

      if (!lessonText || typeof lessonText !== 'string') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'lessonText is required' }));
        return;
      }

      const prompt = `
You are an educational curriculum specialist for non-speaking children in an inclusive classroom.
Convert this lesson content into a candidate linear Concept Graph:

Lesson Content:
"${lessonText}"

Rules:
1. Break down into 5 to 7 sequential milestone nodes.
2. For each node provide:
   - "id": lowercase single word
   - "label": English label
   - "kannadaLabel": Kannada script translation
   - "symbol": a single emoji
   - "explanation": a clear 1-2 sentence child-friendly definition
3. Provide linear edges connecting step i to step i+1 with relation.
4. Output ONLY valid JSON matching:
{
  "title": "Lesson Title",
  "subtitle": "Short subtitle",
  "nodes": [
    { "id": "sun", "label": "Sun", "kannadaLabel": "ಸೂರ್ಯ", "symbol": "☀️", "explanation": "..." }
  ],
  "edges": [
    { "from": "sun", "to": "heat", "relation": "produces" }
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
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'LLM provider request failed', details: errText }));
        return;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Empty response from LLM' }));
        return;
      }

      const cleanJson = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      const candidateGraph = JSON.parse(cleanJson);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ candidateGraph }));
    } catch (err: unknown) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Server error processing lesson graph', message: (err as Error).message }));
    }
  });
}
