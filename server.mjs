import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Modality } from '@google/genai';

const app = express();
const port = Number(process.env.PORT || 3000);
const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const endpointKey = process.env.ORIGIN_API_KEY;
const allowedOrigins = (process.env.CORS_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);

if (!geminiKey) console.warn('GEMINI_API_KEY is not configured.');
const ai = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Origin not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '1mb' }));

function auth(req, res, next) {
  if (!endpointKey) return next();
  const supplied = req.get('authorization')?.replace(/^Bearer\s+/i, '') || req.get('x-api-key');
  if (supplied !== endpointKey) return res.status(401).json({ error: 'Invalid API key' });
  next();
}

function validate(body) {
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  const aspectRatio = body?.aspectRatio || '1:1';
  const imageSize = body?.imageSize || '1K';
  const validRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
  const validSizes = ['1K', '2K', '4K'];
  if (!prompt) throw new Error('prompt is required');
  if (prompt.length > 10000) throw new Error('prompt is too long');
  if (!validRatios.includes(aspectRatio)) throw new Error('Invalid aspectRatio');
  if (!validSizes.includes(imageSize)) throw new Error('Invalid imageSize');
  return { prompt, aspectRatio, imageSize };
}

function validateEnhance(body) {
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) throw new Error('prompt is required');
  if (prompt.length > 10000) throw new Error('prompt is too long');
  return prompt;
}

async function makeImage({ prompt, aspectRatio, imageSize }) {
  if (!ai) throw new Error('Gemini API key is not configured on the server');
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image',
    contents: prompt,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
      imageConfig: { aspectRatio, imageSize }
    }
  });
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data);
  if (!part?.inlineData?.data) throw new Error('The model returned no image');
  return {
    image: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
    mimeType: part.inlineData.mimeType || 'image/png'
  };
}

async function enhance(prompt) {
  if (!ai) throw new Error('Gemini API key is not configured on the server');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Rewrite this image-generation prompt into a detailed, production-quality prompt. Preserve the user's subject and intent. Add useful composition, lighting, camera/lens, materials, environment, color, and realism details only when appropriate. Do not add a new subject. Return only the improved prompt, with no commentary.\n\nPrompt: ${prompt}`
  });
  const result = response.text?.trim();
  if (!result) throw new Error('The model returned no enhanced prompt');
  return result;
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'origin-image-api' }));

app.post('/api/v1/images/generate', auth, async (req, res) => {
  try {
    const result = await makeImage(validate(req.body));
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, error: error?.message || 'Image generation failed' });
  }
});

app.post('/api/v1/prompts/enhance', auth, async (req, res) => {
  try {
    const result = await enhance(validateEnhance(req.body));
    res.json({ ok: true, prompt: result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, error: error?.message || 'Prompt enhancement failed' });
  }
});

app.listen(port, () => console.log(`Origin Image API listening on port ${port}`));
