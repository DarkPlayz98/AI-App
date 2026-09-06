import { GoogleGenAI, Modality } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (!geminiKey) {
      return res.status(500).json({
        ok: false,
        error: 'GEMINI_API_KEY is missing in Vercel. Add a Gemini API key under Project Settings -> Environment Variables, then redeploy.'
      });
    }

    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    const aspectRatio = req.body?.aspectRatio || '1:1';
    const imageSize = req.body?.imageSize || '1K';
    const validRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
    const validSizes = ['1K', '2K', '4K'];

    if (!prompt) return res.status(400).json({ ok: false, error: 'prompt is required' });
    if (!validRatios.includes(aspectRatio)) return res.status(400).json({ ok: false, error: 'Invalid aspectRatio' });
    if (!validSizes.includes(imageSize)) return res.status(400).json({ ok: false, error: 'Invalid imageSize' });

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
        imageConfig: { aspectRatio, imageSize }
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data);
    if (!part?.inlineData?.data) {
      return res.status(502).json({ ok: false, error: 'Gemini returned no image data.' });
    }

    const mimeType = part.inlineData.mimeType || 'image/png';
    return res.status(200).json({
      ok: true,
      image: `data:${mimeType};base64,${part.inlineData.data}`,
      mimeType
    });
  } catch (error) {
    console.error('Gemini image generation error:', error);

    const message = error?.message || 'Image generation failed';
    const statusCode = error?.status ?? error?.code;

    if (statusCode === 429 || error?.status === 429 || /quota exceeded|resource_exhausted/i.test(message)) {
      return res.status(429).json({
        ok: false,
        error: 'Gemini image generation is not available on the current API quota. Gemini 3.1 Flash Image currently requires paid Gemini API access; your project is reporting a free-tier quota of 0. Add billing/paid-tier access to the Gemini project, or switch Origin to another image provider.'
      });
    }

    if (statusCode === 401 || error?.code === 401) {
      return res.status(401).json({ ok: false, error: 'The Gemini API key is invalid or unauthorized.' });
    }

    return res.status(400).json({ ok: false, error: message });
  }
}
