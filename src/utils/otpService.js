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

  const textMessage =
    `Hi ${firstName}! 👋\n\n` +
    `Your *Reach Skyline* WhatsApp verification code is: *${otp}*\n\n` +
    `Enter this 6-digit code on our page to continue.`;

  const payload = JSON.stringify({
    session: WHATSSCALE_SESSION_ID,
    chatId: `${formattedPhone}@c.us`,
    text: textMessage,
  });

  // 1. Try via local Vite Server Proxy (zero CORS issue)
  try {
    const res = await fetch('/whatsscale-api/api/sendText', {
      method: 'POST',
      headers: {
        'X-Api-Key': WHATSSCALE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    if (res.ok) {
      return { ok: true, status: res.status };
    }
  } catch (err) {
    console.warn('Vite proxy WhatsScale attempt failed, trying Apps Script relay:', err);
  }

  // 2. Fallback: Relay through Google Apps Script if deployed on static hosting
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'SEND_WHATSAPP_OTP',
        phone: formattedPhone,
        name,
        otp,
      }),
    });
    return { ok: true };
  } catch (err) {
    console.error('WhatsScale send error:', err);
    return { ok: false, error: err };
  }
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
