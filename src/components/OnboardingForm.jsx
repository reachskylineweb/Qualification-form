import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { generateOtpCode, sendWhatsScaleOtp } from '../utils/otpService';
import { syncLeadData } from '../utils/leadSync';
import {
  DESIGNATION_OPTIONS,
  INDIA_BUSINESS_TYPES,
  validateIndianPhone,
  validateGenuineEmail,
} from '../utils/formOptions';
import SearchableDropdown from './SearchableDropdown';

export default function OnboardingForm({ initialData, onComplete, onDirtyChange }) {
  const [showIntro, setShowIntro] = useState(!initialData);
  // 2 Stages: 'form' -> 'whatsapp_otp'
  const [step, setStep] = useState('form');
  // Mobile-only (< md) 2-page split so each page fits on 1 mobile screen without scrolling
  const [mobileFormPage, setMobileFormPage] = useState(1);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    designation: initialData?.designation || '',
    customDesignation: initialData?.customDesignation || '',
    businessName: initialData?.businessName || '',
    businessType: initialData?.businessType || '',
    customBusinessType: initialData?.customBusinessType || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    location: initialData?.location || '',
    website: initialData?.website || '',
    socialLink: initialData?.socialLink || '',
  });

  const [errors, setErrors] = useState({});

  // WhatsApp OTP States (Email OTP Removed)
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('');
  const [phoneDigits, setPhoneDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const phoneInputRefs = useRef([]);

  useEffect(() => {
    if (!showIntro) return;
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, [showIntro]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Notify parent App whenever the user starts typing any field or enters OTP stage
  useEffect(() => {
    if (!onDirtyChange) return;
    const hasAnyValue = Object.values(formData).some(
      (val) => typeof val === 'string' && val.trim().length > 0
    );
    onDirtyChange(hasAnyValue || step === 'whatsapp_otp');
  }, [formData, step, onDirtyChange]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateWebsite = (rawWebsite) => {
    if (!rawWebsite || !rawWebsite.trim()) {
      return 'Website URL is required for your 360° business audit';
    }
    const clean = rawWebsite.trim().toLowerCase();
    if (!clean.includes('.') || clean.length < 4) {
      return 'Please enter a valid website URL (e.g. yourwebsite.com)';
    }
    return '';
  };

  const validateMobileStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name';
    }

    if (!formData.designation) {
      newErrors.designation = 'Select your designation';
    } else if (formData.designation === 'Others' && !formData.customDesignation.trim()) {
      newErrors.customDesignation = 'Please specify your designation';
    }

    if (!formData.businessName.trim() || formData.businessName.trim().length < 2) {
      newErrors.businessName = 'Please enter your company name';
    }

    if (!formData.businessType) {
      newErrors.businessType = 'Select your business type';
    } else if (formData.businessType === 'Others' && !formData.customBusinessType.trim()) {
      newErrors.customBusinessType = 'Please specify your business type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getFormattedProfile = (raw) => {
    const target = raw || formData;
    return {
      ...target,
      designation:
        target.designation === 'Others'
          ? (target.customDesignation || '').trim()
          : target.designation,
      businessType:
        target.businessType === 'Others'
          ? (target.customBusinessType || '').trim()
          : target.businessType,
    };
  };

  const handleMobileNext = () => {
    if (validateMobileStep1()) {
      setMobileFormPage(2);
      // Track Step 1 of Mobile Form immediately
      syncLeadData('FORM_STEP_1_BUSINESS', {
        lastStep: 'Form Step 1 Completed (Stopped at Step 2 Contact Details)',
        profile: getFormattedProfile(formData),
        qualification: {},
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name';
    }

    if (!formData.designation) {
      newErrors.designation = 'Select your designation';
    } else if (formData.designation === 'Others' && !formData.customDesignation.trim()) {
      newErrors.customDesignation = 'Please specify your designation';
    }

    if (!formData.businessName.trim() || formData.businessName.trim().length < 2) {
      newErrors.businessName = 'Please enter your company name';
    }

    if (!formData.businessType) {
      newErrors.businessType = 'Select your business type';
    } else if (formData.businessType === 'Others' && !formData.customBusinessType.trim()) {
      newErrors.customBusinessType = 'Please specify your business type';
    }

    const phoneErr = validateIndianPhone(formData.phone);
    if (phoneErr) {
      newErrors.phone = phoneErr;
    }

    const emailErr = validateGenuineEmail(formData.email);
    if (emailErr) {
      newErrors.email = emailErr;
    }

    // Website is REQUIRED (Location is now Optional)
    const webErr = validateWebsite(formData.website);
    if (webErr) {
      newErrors.website = webErr;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper to finalize profile & enter chat
  const finalizeAndEnterChat = (dataToUse) => {
    const targetData = dataToUse || formData;
    const finalDesignation =
      targetData.designation === 'Others'
        ? (targetData.customDesignation || '').trim()
        : targetData.designation;

    const finalBusinessType =
      targetData.businessType === 'Others'
        ? (targetData.customBusinessType || '').trim()
        : targetData.businessType;

    try {
      localStorage.removeItem('reachskyline_pending_otp');
    } catch {
      // ignore storage errors
    }

    onComplete({
      ...targetData,
      designation: finalDesignation,
      businessType: finalBusinessType,
      phoneVerified: true,
    });
  };

  // 1-Tap Magic Link Auto-Verify (?otp=123456) on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlOtp = (params.get('otp') || '').replace(/\D/g, '');
      if (urlOtp.length === 6) {
        const rawSaved = localStorage.getItem('reachskyline_pending_otp');
        if (rawSaved) {
          const parsed = JSON.parse(rawSaved);
          if (parsed && parsed.otp === urlOtp && parsed.formData) {
            // Clean URL query param
            window.history.replaceState({}, '', window.location.pathname);
            // Notify original open tab (if any) via localStorage event
            localStorage.setItem(
              'reachskyline_otp_verified_signal',
              JSON.stringify({ otp: urlOtp, ts: Date.now() })
            );
            setShowIntro(false);
            setFormData(parsed.formData);
            setGeneratedPhoneOtp(urlOtp);
            setPhoneDigits(urlOtp.split(''));
            setStep('whatsapp_otp');
            setTimeout(() => {
              finalizeAndEnterChat(parsed.formData);
            }, 350);
          }
        }
      }
    } catch {
      // ignore URL/storage parse errors
    }
  }, []);

  // Cross-Tab Live Sync: If user clicks 1-Tap link in WhatsApp and it opens in another tab, auto-verify this tab too!
  useEffect(() => {
    const handleStorageSync = (e) => {
      if (e.key === 'reachskyline_otp_verified_signal' && e.newValue && generatedPhoneOtp) {
        try {
          const data = JSON.parse(e.newValue);
          if (data?.otp === generatedPhoneOtp) {
            setPhoneDigits(generatedPhoneOtp.split(''));
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, [generatedPhoneOtp]);

  // Instant Auto-Submit as soon as all 6 digits are entered, tapped via WhatsApp magic link, or pasted
  useEffect(() => {
    if (step !== 'whatsapp_otp' || !generatedPhoneOtp) return;
    const enteredPhone = phoneDigits.join('');
    if (enteredPhone.length === 6 && !phoneDigits.includes('')) {
      if (enteredPhone === generatedPhoneOtp) {
        setOtpError('');
        const timer = setTimeout(() => {
          finalizeAndEnterChat(formData);
        }, 300);
        return () => clearTimeout(timer);
      } else {
        setOtpError('Invalid WhatsApp OTP. Please check your WhatsApp and try again.');
      }
    }
  }, [phoneDigits, step, generatedPhoneOtp]);

  // Send WhatsApp OTP Only
  const triggerWhatsAppOtp = async () => {
    setIsSendingOtp(true);
    setOtpError('');

    const pCode = generateOtpCode();
    setGeneratedPhoneOtp(pCode);
    setPhoneDigits(['', '', '', '', '', '']);

    try {
      localStorage.setItem(
        'reachskyline_pending_otp',
        JSON.stringify({
          formData,
          otp: pCode,
          ts: Date.now(),
        })
      );
    } catch {
      // ignore storage errors
    }

    // Immediately track full form submission when Continue is clicked
    syncLeadData('FORM_SUBMITTED_OTP_SENT', {
      lastStep: 'Form Completed (At WhatsApp OTP Screen)',
      profile: getFormattedProfile(formData),
      qualification: {},
    });

    const res = await sendWhatsScaleOtp({
      phone: formData.phone.trim(),
      name: formData.name.trim(),
      otp: pCode,
    });

    setIsSendingOtp(false);

    if (!res.ok) {
      setOtpError('Could not send WhatsApp OTP. Please check your WhatsApp number and try again.');
      return;
    }

    setResendTimer(30);
    setStep('whatsapp_otp');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await triggerWhatsAppOtp();
    }
  };

  // Smart Paste Handler: extracts 6-digit OTP even if user pastes the entire WhatsApp message
  const handleOtpPaste = (e) => {
    const text = e.clipboardData?.getData('text') || '';
    const sixDigitMatch = text.match(/\b(\d{6})\b/);
    const digits = sixDigitMatch
      ? sixDigitMatch[1]
      : text.replace(/\D/g, '').slice(0, 6);

    if (digits.length > 0) {
      e.preventDefault();
      const updated = ['', '', '', '', '', ''];
      digits.split('').forEach((ch, i) => {
        if (i < 6) updated[i] = ch;
      });
      setPhoneDigits(updated);
      setOtpError('');
      const focusIdx = Math.min(digits.length, 5);
      phoneInputRefs.current[focusIdx]?.focus();
    }
  };

  const handleCodeChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const updated = [...phoneDigits];
      updated[index] = '';
      setPhoneDigits(updated);
      setOtpError('');
      return;
    }

    // If 6 digits are auto-filled by mobile keyboard one-time-code or pasted into any box
    if (cleanVal.length === 6) {
      setPhoneDigits(cleanVal.split(''));
      setOtpError('');
      phoneInputRefs.current[5]?.focus();
      return;
    }

    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      const updated = [...phoneDigits];
      pasted.forEach((char, idx) => {
        if (index + idx < 6) updated[index + idx] = char;
      });
      setPhoneDigits(updated);
      setOtpError('');
      const nextFocus = Math.min(index + pasted.length, 5);
      phoneInputRefs.current[nextFocus]?.focus();
      return;
    }

    const updated = [...phoneDigits];
    updated[index] = cleanVal;
    setPhoneDigits(updated);
    setOtpError('');

    if (index < 5) {
      phoneInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !phoneDigits[index] && index > 0) {
      phoneInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify WhatsApp OTP -> Directly Open Chatbot!
  const handleVerifyWhatsAppOtp = (e) => {
    e.preventDefault();
    const enteredPhone = phoneDigits.join('');

    if (enteredPhone.length < 6) {
      setOtpError('Please enter the 6-digit OTP sent to your WhatsApp.');
      return;
    }

    if (enteredPhone !== generatedPhoneOtp) {
      setOtpError('Invalid WhatsApp OTP. Please check your WhatsApp and try again.');
      return;
    }

    finalizeAndEnterChat(formData);
  };

  const inputClass =
    'w-full px-4 md:px-3.5 py-3.5 md:py-2.5 rounded-xl md:rounded-lg bg-black border border-[#d39c12]/35 text-white placeholder-neutral-500 text-[15px] md:text-sm focus:outline-none focus:border-[#d39c12] focus:ring-1 focus:ring-[#d39c12]/40 transition';

  return (
    <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-center md:min-h-[500px] md:items-center">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="intro-heading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="text-center py-20 flex flex-col items-center gap-5 max-w-xl mx-auto px-4"
          >
            <img
              src="./logo.png"
              alt="Reach Skyline"
              className="h-24 sm:h-28 w-auto object-contain"
            />
            <h1 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight leading-snug">
              We&apos;d love to have a quick{' '}
              <span className="text-[#d39c12]">1-on-1 conversation</span> with you
            </h1>
            <p className="text-sm sm:text-base text-neutral-400">
              Before we jump into the chat, share a few quick details so we can know who we&apos;re speaking with.
            </p>
          </motion.div>
        ) : step === 'form' ? (
          <motion.div
            key="main-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full flex-1 md:flex-initial flex flex-col justify-between"
          >
            <div className="mb-4 sm:mb-6 pt-1 sm:pt-0 flex items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-1">
                <span className="md:hidden inline-block px-2.5 py-0.5 rounded-full bg-[#d39c12]/15 border border-[#d39c12]/35 text-[#d39c12] text-[10px] font-bold uppercase tracking-wider">
                  1-on-1 Discovery Session
                </span>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-snug">
                  Let&apos;s start our{' '}
                  <span className="text-[#d39c12]">conversation</span>
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Before we connect with Ram K7 in the chat, please share a few quick details below.
                </p>
              </div>
              <img
                src="./logo.png"
                alt="Reach Skyline"
                className="h-12 sm:h-12 w-auto object-contain shrink-0"
              />
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 md:flex-initial flex flex-col justify-between rounded-2xl md:rounded-xl bg-[#0c0c0c] border border-[#d39c12]/35 p-5 sm:p-8 shadow-[0_0_40px_-15px_rgba(211,156,18,0.2)]"
            >
              <div>
                {/* Mobile-Only (< md) Step Progress Indicator */}
                <div className="md:hidden mb-5">
                  <div className="flex items-center justify-between text-xs font-medium mb-2">
                    <span className="text-[#d39c12] font-semibold">
                      {mobileFormPage === 1 ? 'Step 1 of 2 • Your Business' : 'Step 2 of 2 • Contact Details'}
                    </span>
                    <span className="text-neutral-400">{mobileFormPage} / 2</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-[#d39c12] transition-all duration-300 rounded-full ${
                        mobileFormPage === 1 ? 'w-1/2' : 'w-full'
                      }`}
                    />
                  </div>
                </div>

                {/* Two-Column Split Layout on Desktop | 2-Step Non-Scrolling Pages on Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* LEFT SIDE (Mobile Page 1): Name, Designation, Company Name, Business Type */}
                  <div
                    className={
                      mobileFormPage === 1
                        ? 'space-y-4 md:space-y-4 block'
                        : 'hidden md:block md:space-y-4'
                    }
                  >
                  {/* Name */}
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1.5">
                      Name <span className="text-[#d39c12]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className={inputClass}
                    />
                    {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
                  </div>

                  {/* Designation Dropdown + Others Input */}
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1.5">
                      Designation <span className="text-[#d39c12]">*</span>
                    </label>
                    <SearchableDropdown
                      options={DESIGNATION_OPTIONS}
                      value={formData.designation}
                      onChange={(val) => updateField('designation', val)}
                      placeholder="Select your designation"
                      searchPlaceholder="Search Founder, CEO, CMO, MD..."
                    />
                    {errors.designation && (
                      <p className="text-xs text-rose-400 mt-1">{errors.designation}</p>
                    )}

                    {formData.designation === 'Others' && (
                      <div className="mt-2.5">
                        <input
                          type="text"
                          placeholder="Type your exact designation / role..."
                          value={formData.customDesignation}
                          onChange={(e) => updateField('customDesignation', e.target.value)}
                          className={inputClass}
                        />
                        {errors.customDesignation && (
                          <p className="text-xs text-rose-400 mt-1">{errors.customDesignation}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Company / Business Name */}
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1.5">
                      Company / Business Name <span className="text-[#d39c12]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Your company name"
                      value={formData.businessName}
                      onChange={(e) => updateField('businessName', e.target.value)}
                      className={inputClass}
                    />
                    {errors.businessName && (
                      <p className="text-xs text-rose-400 mt-1">{errors.businessName}</p>
                    )}
                  </div>

                  {/* Business Type Searchable Dropdown + Others Input */}
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1.5">
                      Business Type <span className="text-[#d39c12]">*</span>
                    </label>
                    <SearchableDropdown
                      options={INDIA_BUSINESS_TYPES}
                      value={formData.businessType}
                      onChange={(val) => updateField('businessType', val)}
                      placeholder="Search or select business type"
                      searchPlaceholder="Type IT, AI, Real Estate, Retail, Textile..."
                    />
                    {errors.businessType && (
                      <p className="text-xs text-rose-400 mt-1">{errors.businessType}</p>
                    )}

                    {formData.businessType === 'Others' && (
                      <div className="mt-2.5">
                        <input
                          type="text"
                          placeholder="Type your business category..."
                          value={formData.customBusinessType}
                          onChange={(e) => updateField('customBusinessType', e.target.value)}
                          className={inputClass}
                        />
                        {errors.customBusinessType && (
                          <p className="text-xs text-rose-400 mt-1">{errors.customBusinessType}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE (Mobile Page 2): Phone, Email, Website (Required with 360° note), Location & Social Link (Optional) */}
                <div
                  className={
                    mobileFormPage === 2
                      ? 'space-y-3 md:space-y-4 block'
                      : 'hidden md:block md:space-y-4'
                  }
                >
                  {/* Phone */}
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1.5">
                      WhatsApp / Phone Number <span className="text-[#d39c12]">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number (e.g. 98765 43210)"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      onBlur={() => {
                        if (formData.phone) {
                          const err = validateIndianPhone(formData.phone);
                          if (err) setErrors((prev) => ({ ...prev, phone: err }));
                        }
                      }}
                      className={inputClass}
                    />
                    {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1.5">
                      Email Address <span className="text-[#d39c12]">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      onBlur={() => {
                        if (formData.email) {
                          const err = validateGenuineEmail(formData.email);
                          if (err) setErrors((prev) => ({ ...prev, email: err }));
                        }
                      }}
                      className={inputClass}
                    />
                    {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
                  </div>

                  {/* Website (Required with 360-degree audit note) */}
                  <div>
                    <label className="block text-xs text-neutral-300 mb-1">
                      Website <span className="text-[#d39c12]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      onBlur={() => {
                        if (formData.website) {
                          const err = validateWebsite(formData.website);
                          if (err) setErrors((prev) => ({ ...prev, website: err }));
                        }
                      }}
                      className={inputClass}
                    />
                    <p className="text-[11px] text-[#d39c12]/90 mt-1 leading-snug">
                      This will help us audit a 360° view of your business.
                    </p>
                    {errors.website && (
                      <p className="text-xs text-rose-400 mt-1">{errors.website}</p>
                    )}
                  </div>

                  {/* Location (Optional) & Social Link (Optional) */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-xs text-neutral-300 mb-1.5">
                        Location <span className="text-neutral-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Madurai, Chennai..."
                        value={formData.location}
                        onChange={(e) => updateField('location', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-300 mb-1.5">
                        Social Link <span className="text-neutral-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Instagram / LinkedIn"
                        value={formData.socialLink}
                        onChange={(e) => updateField('socialLink', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
              </div>

              {otpError && step === 'form' && (
                <p className="text-xs text-rose-400 mt-3">{otpError}</p>
              )}

              {/* MOBILE ONLY (< md): Step 1 "Next" button, Step 2 "Back" + "Continue" buttons */}
              <div className="md:hidden mt-6 pt-4 border-t border-[#d39c12]/20 space-y-2.5">
                {mobileFormPage === 1 ? (
                  <button
                    type="button"
                    onClick={handleMobileNext}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#d39c12] hover:bg-[#e5b126] text-black font-bold text-[15px] transition cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setMobileFormPage(1)}
                      className="px-4 py-3.5 rounded-xl bg-[#181818] border border-neutral-700 text-neutral-300 font-medium text-[15px] inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#d39c12] hover:bg-[#e5b126] disabled:opacity-50 text-black font-bold text-[15px] transition cursor-pointer"
                    >
                      <span>{isSendingOtp ? 'Sending OTP...' : 'Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-neutral-500 text-center">
                  Your details are kept confidential for your 1-on-1 discovery session.
                </p>
              </div>

              {/* DESKTOP ONLY (md+): Single "Continue" Submit Button */}
              <div className="hidden md:flex mt-7 pt-5 border-t border-[#d39c12]/20 justify-end">
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-lg bg-[#d39c12] hover:bg-[#e5b126] disabled:opacity-50 text-black font-semibold text-sm transition cursor-pointer"
                >
                  <span>{isSendingOtp ? 'Sending WhatsApp OTP...' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* WHATSAPP OTP VERIFICATION ONLY */
          <motion.div
            key="whatsapp-otp-verification"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="rounded-xl bg-[#0c0c0c] border border-[#d39c12]/40 p-6 sm:p-8 shadow-[0_0_45px_-15px_rgba(211,156,18,0.25)] text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 flex items-center justify-center mx-auto text-[#25D366]">
                <MessageCircle className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white">
                  Verify Your WhatsApp
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed">
                  Enter the 6-digit OTP sent to your WhatsApp number{' '}
                  <span className="text-[#d39c12] font-medium">{formData.phone}</span>
                </p>
                {phoneDigits.join('') === generatedPhoneOtp && generatedPhoneOtp ? (
                  <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>OTP Verified! Entering chat...</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#25D366]/90 mt-2">
                    Tip: Tap the 1-click verify link in your WhatsApp message or enter the 6-digit code below.
                  </p>
                )}
              </div>

              <form onSubmit={handleVerifyWhatsAppOtp} className="space-y-5">
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {phoneDigits.map((digit, idx) => (
                    <input
                      key={`ph-${idx}`}
                      ref={(el) => (phoneInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                      maxLength={6}
                      value={digit}
                      onPaste={handleOtpPaste}
                      onChange={(e) => handleCodeChange(idx, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-lg bg-black border border-[#d39c12]/40 text-white focus:outline-none focus:border-[#d39c12] focus:ring-1 focus:ring-[#d39c12] transition"
                    />
                  ))}
                </div>

                {otpError && <p className="text-xs text-rose-400">{otpError}</p>}

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[#d39c12] hover:bg-[#e5b126] text-black font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Enter Chat</span>
                </button>
              </form>

              {/* Resend & Edit Controls */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Number</span>
                </button>

                {resendTimer > 0 ? (
                  <span className="text-neutral-500">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={triggerWhatsAppOtp}
                    disabled={isSendingOtp}
                    className="inline-flex items-center gap-1 text-[#d39c12] hover:underline font-medium cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend WhatsApp OTP</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
