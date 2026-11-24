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

  // Send WhatsApp OTP Only
  const triggerWhatsAppOtp = async () => {
    setIsSendingOtp(true);
    setOtpError('');

    const pCode = generateOtpCode();
    setGeneratedPhoneOtp(pCode);
    setPhoneDigits(['', '', '', '', '', '']);

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

    setTimeout(() => {
      phoneInputRefs.current[0]?.focus();
    }, 150);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await triggerWhatsAppOtp();
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

    const finalDesignation =
      formData.designation === 'Others'
        ? formData.customDesignation.trim()
        : formData.designation;

    const finalBusinessType =
      formData.businessType === 'Others'
        ? formData.customBusinessType.trim()
        : formData.businessType;

    onComplete({
      ...formData,
      designation: finalDesignation,
      businessType: finalBusinessType,
      phoneVerified: true,
    });
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg bg-black border border-[#d39c12]/35 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#d39c12] focus:ring-1 focus:ring-[#d39c12]/40 transition';

  return (
    <div className="w-full max-w-3xl mx-auto min-h-[500px] flex items-center justify-center">
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
            className="w-full"
          >
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                  Let&apos;s start our{' '}
                  <span className="text-[#d39c12]">conversation</span>
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Before we connect with Ram K7 in the chat, please share a few quick details below.
                </p>
              </div>
              <img
                src="./logo.png"
                alt="Reach Skyline"
                className="h-12 w-auto object-contain self-start sm:self-auto shrink-0"
              />
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-xl bg-[#0c0c0c] border border-[#d39c12]/35 p-6 sm:p-8 shadow-[0_0_40px_-15px_rgba(211,156,18,0.2)]"
            >
              {/* Two-Column Split Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* LEFT SIDE: Name, Designation, Company Name, Business Type */}
                <div className="space-y-4">
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

                {/* RIGHT SIDE: Phone, Email, Website (Required with 360° note), Location & Social Link (Optional) */}
                <div className="space-y-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              {otpError && step === 'form' && (
                <p className="text-xs text-rose-400 mt-4">{otpError}</p>
              )}

              {/* Submit Button */}
              <div className="mt-7 pt-5 border-t border-[#d39c12]/20 flex justify-end">
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-lg bg-[#d39c12] hover:bg-[#e5b126] disabled:opacity-50 text-black font-semibold text-sm transition cursor-pointer"
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
              </div>

              <form onSubmit={handleVerifyWhatsAppOtp} className="space-y-5">
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {phoneDigits.map((digit, idx) => (
                    <input
                      key={`ph-${idx}`}
                      ref={(el) => (phoneInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
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
