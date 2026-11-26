import { GOOGLE_SCRIPT_URL } from './otpService';

function getOrCreateSessionId() {
  try {
    let sid = sessionStorage.getItem('reachskyline_session_id');
    if (!sid) {
      sid = 'rs_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem('reachskyline_session_id', sid);
    }
    return sid;
  } catch {
    return 'rs_' + Date.now();
  }
}

/**
 * Real-time lead & step-by-step response tracker.
 * Syncs immediately on Form submission, OTP verification, and every single Chatbot answer
 * so partial/dropped-off leads are captured at the exact question they stopped!
 */
export async function syncLeadData(stage, payload) {
  const timestamp = new Date().toISOString();
  const sessionId = getOrCreateSessionId();
  const record = {
    action: 'UPSERT_LEAD',
    sessionId,
    stage,
    lastStep: payload?.lastStep || stage,
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
