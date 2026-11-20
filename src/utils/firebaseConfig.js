import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// ReachSkyline Live Firebase Configuration
export const firebaseConfig = {
  apiKey: 'AIzaSyDC-Bot7lGod-528rOyZZvpJrkhkga7rJc',
  authDomain: 'reachskyline.firebaseapp.com',
  projectId: 'reachskyline',
  storageBucket: 'reachskyline.firebasestorage.app',
  messagingSenderId: '86813845945',
  appId: '1:86813845945:web:81bd1f17425c988f916e68',
  measurementId: 'G-KLD16B5KFY',
};

export const isFirebaseConfigured = () => true;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Sends a real SMS OTP to the given +91 Indian mobile number via Google Firebase
 */
export async function sendFirebasePhoneOtp(rawPhone) {
  let cleaned = (rawPhone || '').replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '+91' + cleaned;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  try {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {
        // ignore clear error
      }
      window.recaptchaVerifier = null;
    }

    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      cleaned,
      window.recaptchaVerifier
    );

    window.firebaseConfirmationResult = confirmationResult;
    return { ok: true };
  } catch (error) {
    console.error('Firebase SMS Error:', error);
    let userMsg = error?.message || 'Failed to send SMS OTP via Firebase';
    if (error?.code === 'auth/operation-not-allowed') {
      userMsg =
        'Please enable Phone Sign-in inside Firebase Console -> Build -> Authentication -> Sign-in method -> Phone.';
    } else if (error?.code === 'auth/billing-not-enabled') {
      userMsg =
        'Firebase requires Blaze plan (or add your phone under "Phone numbers for testing" in Firebase Auth to test for free without billing).';
    }
    return {
      ok: false,
      error,
      message: userMsg,
    };
  }
}

/**
 * Verifies the 6-digit SMS OTP entered by the user against Firebase
 */
export async function verifyFirebasePhoneOtp(code) {
  if (!window.firebaseConfirmationResult) {
    return { ok: false, message: 'No active SMS session. Please click Resend OTPs.' };
  }

  try {
    await window.firebaseConfirmationResult.confirm(code);
    return { ok: true };
  } catch (error) {
    console.error('Firebase OTP confirm error:', error);
    return { ok: false, message: 'Invalid Phone SMS OTP. Please check and try again.' };
  }
}
