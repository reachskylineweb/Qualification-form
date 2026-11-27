import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Globe,
  ExternalLink,
  Calendar,
  Sparkles,
} from 'lucide-react';

const GOOGLE_CALENDAR_BOOKING_URL =
  'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0y5aksSw_dtsMEvXCJePanowkKq21cmcnfk82DJJalPPuPHV9neYrUhcdj2f5R_KadDyoHcX-z';

const SOCIAL_LINKS = [
  {
    name: 'Website',
    sub: 'reachskyline.com',
    href: 'https://reachskyline.com/',
    icon: (
      <Globe className="w-5 h-5 text-[#d39c12]" />
    ),
  },
  {
    name: 'Instagram',
    sub: '@reachskyline',
    href: 'https://www.instagram.com/reachskyline?avpt=OXByN3EycTIyamwx',
    icon: (
      <svg
        className="w-5 h-5 text-[#d39c12]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    sub: 'Reach Skyline',
    href: 'https://in.linkedin.com/company/reach-skyline',
    icon: (
      <svg
        className="w-5 h-5 text-[#d39c12]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    sub: 'Reach Skyline Digital',
    href: 'https://www.facebook.com/reachskylinedigital/',
    icon: (
      <svg
        className="w-5 h-5 text-[#d39c12]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

export default function ThankYouPage({ profile, qualification }) {
  const firstName = profile?.name?.split(' ')[0] || 'there';
  const bizName = profile?.businessName || 'your business';
  const choseSelfBook = qualification?.appointment_preference === 'Book by myself';

  return (
    <div className="w-full max-w-3xl mx-auto flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full rounded-2xl bg-[#0c0c0c] border border-[#d39c12]/40 p-5 sm:p-7 shadow-[0_0_50px_-15px_rgba(211,156,18,0.28)] text-center space-y-3.5 sm:space-y-4"
      >
        {/* Top Reach Skyline Logo + Badge */}
        <div className="flex flex-col items-center gap-2">
          <img
            src="./logo.png"
            alt="Reach Skyline"
            className="h-12 sm:h-14 w-auto object-contain"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#d39c12]/15 border border-[#d39c12]/40 text-[#d39c12] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>1-on-1 Discovery Session</span>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="space-y-2 max-w-xl mx-auto">
          <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
            Thank You for Your Time,{' '}
            <span className="text-[#d39c12]">{firstName}!</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {choseSelfBook ? (
              <>
                We truly appreciate you sharing your insights and growth goals for{' '}
                <span className="text-white font-semibold">{bizName}</span>. Your 1-on-1
                discovery session is all set, and we cannot wait to speak with you!
              </>
            ) : (
              <>
                We truly appreciate you sharing your insights and growth goals for{' '}
                <span className="text-white font-semibold">{bizName}</span>. Our team is
                reviewing your details and will reach out to you shortly to schedule your
                1-on-1 session!
              </>
            )}
          </p>
        </div>

        {/* Highlighted "See you on the live call!" Banner */}
        <div className="max-w-sm mx-auto rounded-xl bg-gradient-to-r from-[#171207] via-[#1f1808] to-[#171207] border border-[#d39c12]/45 px-4 py-2.5 flex items-center justify-center gap-2 shadow-inner">
          <Sparkles className="w-4 h-4 text-[#d39c12] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-[#d39c12]">
            See you on the live call!
          </span>
        </div>

        {/* Optional Re-open Calendar Button if user chose self-booking */}
        {choseSelfBook && (
          <div className="max-w-xs mx-auto">
            <a
              href={GOOGLE_CALENDAR_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-[#d39c12] hover:bg-[#e5b126] text-black font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition shadow-md"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Open Appointment Calendar</span>
            </a>
          </div>
        )}

        {/* Divider + Connect Section (2x2 on Mobile, 4-Column Single Row on Desktop) */}
        <div className="border-t border-[#d39c12]/20 pt-3.5 sm:pt-4 space-y-2.5">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Connect with Reach Skyline
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-black hover:bg-[#16130b] border border-[#d39c12]/35 hover:border-[#d39c12] transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#d39c12]/12 border border-[#d39c12]/30 flex items-center justify-center shrink-0 group-hover:bg-[#d39c12]/20 transition">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#d39c12] transition truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-neutral-400 truncate">
                      {item.sub}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#d39c12] shrink-0 transition" />
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
