import { GOOGLE_SCRIPT_URL } from './otpService';

export const META_PIXEL_ID = '1151686937053289';

/**
 * Safely fire Meta Pixel standard or custom events if fbq is loaded
 */
export function trackMetaPixelEvent(eventName, params = {}, isCustom = false) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq(isCustom ? 'trackCustom' : 'track', eventName, params);
    }
  } catch (err) {
    console.warn('Meta Pixel event skipped:', err);
  }
}

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

  // Fire Meta Pixel events for key conversion milestones
  const profile = payload?.profile || {};
  const qualification = payload?.qualification || {};

  if (stage === 'FORM_SUBMITTED_OTP_PENDING') {
    trackMetaPixelEvent('InitiateCheckout', {
      content_name: 'Onboarding Form Submitted (OTP Pending)',
      business_type: profile.businessType || '',
      designation: profile.designation || '',
    });
  } else if (stage === 'OTP_VERIFIED_ENTERED_CHAT') {
    trackMetaPixelEvent('Lead', {
      content_name: 'WhatsApp OTP Verified Lead',
      business_name: profile.businessName || '',
      business_type: profile.businessType || '',
      designation: profile.designation || '',
    });
  } else if (stage === 'COMPLETED') {
    trackMetaPixelEvent('CompleteRegistration', {
      content_name: 'Qualification Chat Completed',
      business_name: profile.businessName || '',
      business_type: profile.businessType || '',
      monthly_revenue: qualification.monthly_revenue || '',
      marketing_spend: qualification.marketing_spend || '',
      appointment_preference: qualification.appointment_preference || '',
    });
    trackMetaPixelEvent('Schedule', {
      content_name: '1-on-1 Discovery Session',
      appointment_preference: qualification.appointment_preference || '',
      monthly_revenue: qualification.monthly_revenue || '',
      marketing_spend: qualification.marketing_spend || '',
    });
  } else if (stage && stage.startsWith('CHAT_STEP_')) {
    trackMetaPixelEvent(
      'QualificationStep',
      {
        step: stage,
        last_step: payload?.lastStep || stage,
      },
      true
    );
  }

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
