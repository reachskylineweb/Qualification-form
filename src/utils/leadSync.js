import { GOOGLE_SCRIPT_URL } from './otpService';

/**
 * Sends lead onboarding & qualification answers to Google Sheets Apps Script Web App
 * Also saves a local backup in localStorage.
 */
export async function syncLeadData(stage, payload) {
  const timestamp = new Date().toISOString();
  const record = {
    stage, // 'STEP_1_PROFILE' or 'COMPLETED_BLUEPRINT'
    timestamp,
    ...payload,
  };

  try {
    const existing = JSON.parse(localStorage.getItem('reachskyline_leads') || '[]');
    existing.push(record);
    localStorage.setItem('reachskyline_leads', JSON.stringify(existing));
    localStorage.setItem('reachskyline_latest_lead', JSON.stringify(record));
  } catch (e) {
    console.warn('Local storage save skipped:', e);
  }

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(record),
    });
    return { ok: true, mode: 'webhook', record };
  } catch (error) {
    console.error('Webhook sync error:', error);
    return { ok: false, mode: 'webhook_error', error, record };
  }
}
