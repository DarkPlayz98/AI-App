import { HfInference } from '@huggingface/inference';

const MODEL = 'black-forest-labs/FLUX.1-schnell';

function dimensions(aspectRatio, imageSize) {
  const scale = imageSize === '2K' ? 1.4 : imageSize === '4K' ? 2 : 1;
  const base = 768;
  const values = {
    '1:1': [base, base],
    '16:9': [1024, 576],
    '9:16': [576, 1024],
    '4:3': [896, 672],
    '3:4': [672, 896],
  };
  const [width, height] = values[aspectRatio] || values['1:1'];
  return {
    width: Math.min(1536, Math.round(width * scale)),
    height: Math.min(1536, Math.round(height * scale)),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const hfToken = process.env.HF_TOKEN?.trim();
    if (!hfToken) {
      return res.status(500).json({
        ok: false,
        error: 'HF_TOKEN is missing in Vercel. Create a Hugging Face token with Inference permissions, add it under Project Settings -> Environment Variables, then redeploy.',
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

    const client = new HfInference(hfToken);
    const { width, height } = dimensions(aspectRatio, imageSize);

    const image = await client.textToImage({
      model: MODEL,
      inputs: prompt,
      parameters: {
        width,
        height,
        num_inference_steps: 4,
      },
      provider: 'hf-inference',
    });

    const buffer = Buffer.from(await image.arrayBuffer());
    const mimeType = image.type || 'image/png';

    return res.status(200).json({
      ok: true,
      image: `data:${mimeType};base64,${buffer.toString('base64')}`,
      mimeType,
      model: MODEL,
    });
  } catch (error) {
    console.error('Hugging Face image generation error:', error);
    const status = error?.status || error?.response?.status || 400;
    let message = error?.message || 'Image generation failed';

    if (status === 401) message = 'Hugging Face authentication failed. Check that HF_TOKEN is a valid token with Inference permissions.';
    if (status === 402) message = 'Hugging Face free inference credits are exhausted. Check your Hugging Face Inference Providers usage.';
    if (status === 429) message = 'Hugging Face is rate-limiting requests. Please wait a moment and try again.';

    return res.status(status >= 400 && status <= 599 ? status : 400).json({ ok: false, error: message });
  }
}
