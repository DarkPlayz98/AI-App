const apiBase = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '');

async function request(path: string, body: unknown) {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data: any = null;
  try { data = await response.json(); } catch { /* ignore invalid JSON */ }
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || `API request failed (${response.status})`);
  }
  return data;
}

export async function generateImage(prompt: string, aspectRatio = '1:1', imageSize = '1K'): Promise<string> {
  const data = await request('/api/v1/images/generate', { prompt, aspectRatio, imageSize });
  return data.image;
}

export async function enhancePrompt(prompt: string): Promise<string> {
  const data = await request('/api/v1/prompts/enhance', { prompt });
  return data.prompt;
}
