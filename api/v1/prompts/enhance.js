import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const endpointKey = process.env.ORIGIN_API_KEY;
  if (endpointKey) {
    const supplied = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.headers['x-api-key'];
    if (supplied !== endpointKey) return res.status(401).json({ ok: false, error: 'Invalid API key' });
  }
  try {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (!prompt) throw new Error('prompt is required');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite this image-generation prompt into a detailed, production-quality prompt. Preserve the user's subject and intent. Add useful composition, lighting, camera/lens, materials, environment, color, and realism details only when appropriate. Do not add a new subject. Return only the improved prompt, with no commentary.\n\nPrompt: ${prompt}`
    });
    res.status(200).json({ ok: true, prompt: response.text.trim() });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, error: error?.message || 'Prompt enhancement failed' });
  }
}
