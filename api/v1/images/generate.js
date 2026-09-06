import { GoogleGenAI, Modality } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const endpointKey = process.env.ORIGIN_API_KEY?.trim();
  if (endpointKey) {
    const supplied = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim() || req.headers['x-api-key']?.trim();
    if (supplied !== endpointKey) return res.status(401).json({ ok: false, error: 'Invalid API key' });
  }

  try {
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (!geminiKey) {
      return res.status(500).json({
        ok: false,
        error: 'GEMINI_API_KEY is not configured in Vercel. Add it under Project Settings → Environment Variables, then redeploy.'
      });
    }

    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    const aspectRatio = req.body?.aspectRatio || '1:1';
    const imageSize = req.body?.imageSize || '1K';
    const validRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
    const validSizes = ['1K', '2K', '4K'];
    if (!prompt) throw new Error('prompt is required');
    if (!validRatios.includes(aspectRatio)) throw new Error('Invalid aspectRatio');
    if (!validSizes.includes(imageSize)) throw new Error('Invalid imageSize');

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: prompt,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE], imageConfig: { aspectRatio, imageSize } }
    });
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data);
    if (!part?.inlineData?.data) throw new Error('The model returned no image');
    const mimeType = part.inlineData.mimeType || 'image/png';
    res.status(200).json({ ok: true, image: `data:${mimeType};base64,${part.inlineData.data}`, mimeType });
  } catch (error) {
    console.error(error);
    const status = error?.status === 401 || error?.code === 401 ? 401 : 400;
    res.status(status).json({ ok: false, error: error?.message || 'Image generation failed' });
  }
}
