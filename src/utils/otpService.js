export const GOOGLE_SCRIPT_URL =
  import.meta.env.VITE_OTP_WEBHOOK_URL ||
  'https://script.google.com/macros/s/AKfycbzjth78Lv6IjzgOBdlELbS3LnWMGKlY6rSzIoUjpRV7t-wSqekiDpyJOHM_eVOno9Tfng/exec';

// WhatsScale Live Credentials
export const WHATSSCALE_API_KEY =
  import.meta.env.VITE_WHATSSCALE_API_KEY || 'ws_S6Ky8ltrvAwCSCu_Fb9z-liOxLNRbVCn';

export const WHATSSCALE_SESSION_ID =
  import.meta.env.VITE_WHATSSCALE_SESSION_ID ||
  'user_8da56c96d59a4388882d8ff9e2c0ca69_PqAvEa3J';

export function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function cleanWhatsAppPhone(rawPhone) {
  let cleaned = (rawPhone || '').replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = '91' + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Step 1: Sends 6-digit OTP ONLY to the user's WhatsApp number via WhatsScale API
 * Uses Vite proxy (/whatsscale-api/api/sendText) in local dev to avoid browser CORS blocks!
 */
export async function sendWhatsScaleOtp({ phone, name, otp }) {
  const formattedPhone = cleanWhatsAppPhone(phone);
  const firstName = (name || 'there').split(' ')[0];

  // Plain 6-digit OTP without asterisks around the number so Android/iOS notifications show the "Copy Code" button!
  const textMessage =
    `${otp} is your Reach Skyline verification code.\n\n` +
    `Hi ${firstName}, your OTP code is ${otp}`;

  const payload = JSON.stringify({
    session: WHATSSCALE_SESSION_ID,
    chatId: `${formattedPhone}@c.us`,
    text: textMessage,
  });

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const endpoints = isLocalhost
    ? ['/whatsscale-api/api/sendText', './send-whatsapp.php']
    : ['./send-whatsapp.php', '/api/send-whatsapp', '/whatsscale-api/api/sendText'];

  for (const endpoint of endpoints) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'X-Api-Key': WHATSSCALE_API_KEY,
            'Content-Type': 'application/json',
          },
          body: payload,
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && !contentType.includes('application/x-httpd-php')) {
          const text = await res.text();
          if (!text.trim().startsWith('<?php') && text.trim().length > 0) {
            return { ok: true, status: res.status };
          }
        }
        // Retry same endpoint once only if Cloudflare returned 520/502/503
        if (res.status < 500) break;
      } catch (err) {
        console.warn(`Proxy attempt (${endpoint} #${attempt}) failed:`, err);
        break;
      }
    }
  }

  return { ok: false, error: 'WhatsApp OTP delivery failed' };
}

/**
 * Step 2: Sends 6-digit OTP ONLY to the user's Email address via Google Apps Script
 * (Triggered only after WhatsApp OTP is verified!)
 */
export async function sendEmailOnlyOtp({ email, name, otp }) {
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'SEND_OTP',
        email,
        name,
        otp,
        emailOtp: otp,
      }),
    });
    return { ok: true };
  } catch (err) {
    console.error('Email OTP send error:', err);
    return { ok: false, error: err };
  }
}
