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
  const chatId = `${formattedPhone}@c.us`;

  // Bubble 1: Greeting | Bubble 2: Standalone 6-digit OTP only (for 1-tap single-bubble copy!)
  const introPayload = JSON.stringify({
    session: WHATSSCALE_SESSION_ID,
    chatId,
    text: `Hi ${firstName}! 👋 Your *Reach Skyline* verification code is:`,
  });

  const otpOnlyPayload = JSON.stringify({
    session: WHATSSCALE_SESSION_ID,
    chatId,
    text: `${otp}`,
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
        // 1. Send Intro Bubble
        const res1 = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'X-Api-Key': WHATSSCALE_API_KEY,
            'Content-Type': 'application/json',
          },
          body: introPayload,
        });

        const contentType = res1.headers.get('content-type') || '';
        if (res1.ok && !contentType.includes('application/x-httpd-php')) {
          const text1 = await res1.text();
          if (!text1.trim().startsWith('<?php') && text1.trim().length > 0) {
            // 2. Immediately send the standalone 6-digit OTP bubble right below it!
            await fetch(endpoint, {
              method: 'POST',
              headers: {
                'X-Api-Key': WHATSSCALE_API_KEY,
                'Content-Type': 'application/json',
              },
              body: otpOnlyPayload,
            });
            return { ok: true, status: res1.status };
          }
        }
        if (res1.status < 500) break;
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
