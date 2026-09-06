import { GoogleGenAI, Modality } from '@google/genai';

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

function requireKey() { if (!apiKey) throw new Error('Missing Gemini API key. Add API_KEY to your AI Studio environment.'); }

export async function generateImage(prompt: string, aspectRatio = '1:1', imageSize = '1K'): Promise<string> {
  requireKey();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image',
    contents: prompt,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
      imageConfig: { aspectRatio, imageSize },
    },
  });
  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(part => part.inlineData?.data);
  const data = imagePart?.inlineData?.data;
  const mime = imagePart?.inlineData?.mimeType || 'image/png';
  if (!data) throw new Error('The model returned no image. Try a more specific prompt.');
  return `data:${mime};base64,${data}`;
}

export async function enhancePrompt(prompt: string): Promise<string> {
  requireKey();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Rewrite this image-generation prompt into a detailed, production-quality prompt. Preserve the user's subject and intent. Add useful composition, lighting, camera/lens, materials, environment, color, and realism details only when appropriate. Do not add a new subject. Return only the improved prompt, with no commentary.\n\nPrompt: ${prompt}`,
  });
  return response.text.trim();
}
