# Origin Image API

A small server-side endpoint for using Origin's Gemini image generation from other apps without exposing the Gemini API key.

## Environment

Copy `.env.example` to `.env` on the server and set:

```env
GEMINI_API_KEY=your_real_gemini_key
ORIGIN_API_KEY=your_private_endpoint_key
PORT=3000
CORS_ORIGINS=*
```

Never commit `.env` or a real Gemini key.

## Run

```bash
npm install
npm start
```

Health check:

`GET /health`

Image generation:

`POST /api/v1/images/generate`

If `ORIGIN_API_KEY` is configured, send either:

```http
Authorization: Bearer your_private_endpoint_key
```

or:

```http
x-api-key: your_private_endpoint_key
```

### Request

```json
{
  "prompt": "A cinematic photo of a futuristic city at night",
  "aspectRatio": "16:9",
  "imageSize": "2K"
}
```

Supported aspect ratios: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`.

Supported image sizes: `1K`, `2K`, `4K`.

### Response

```json
{
  "ok": true,
  "image": "data:image/png;base64,...",
  "mimeType": "image/png"
}
```

## JavaScript example

```js
const response = await fetch('https://YOUR-DOMAIN.com/api/v1/images/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ORIGIN_API_KEY'
  },
  body: JSON.stringify({
    prompt: 'A cinematic photo of a futuristic city at night',
    aspectRatio: '16:9',
    imageSize: '2K'
  })
});

const data = await response.json();
const imageUrl = data.image;
```

For production, put the endpoint behind HTTPS and use a long random `ORIGIN_API_KEY`. Do not put a private endpoint key into a public browser app; browser clients should use a backend/proxy that keeps the key secret.
