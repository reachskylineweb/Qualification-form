export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey =
    process.env.VITE_WHATSSCALE_API_KEY || 'ws_S6Ky8ltrvAwCSCu_Fb9z-liOxLNRbVCn';

  try {
    const response = await fetch('https://proxy.whatsscale.com/api/sendText', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
    });

    const data = await response.text();
    return res.status(response.status).send(data);
  } catch (error) {
    console.error('Vercel WhatsScale Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to send WhatsApp message' });
  }
}
