import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Send,
  Calendar,
} from 'lucide-react';
import { syncLeadData } from '../utils/leadSync';

const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const RAM_SIR_AVATAR = '/ram-sir-cutout.png';
const GOOGLE_CALENDAR_BOOKING_URL =
  'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0y5aksSw_dtsMEvXCJePanowkKq21cmcnfk82DJJalPPuPHV9neYrUhcdj2f5R_KadDyoHcX-z';

const buildConversationFlow = (profile) => {
  const firstName = profile?.name?.split(' ')[0] || 'there';
  const bizName = profile?.businessName || 'your business';
  const bizType = profile?.businessType || '';

  return [
    // --- 1. SCALE TODAY ---
    {
      id: 'revenue_today',
      botMessages: [
        `Hey ${firstName}, Ram here from Reach Skyline! Thank you for sharing your details and telling us about ${bizName}${bizType ? ` (${bizType})` : ''}.`,
        `To make our upcoming conversation super relevant for you, I would love to know a few quick things about where ${bizName} stands today. What does your current monthly revenue look like?`,
      ],
      type: 'single',
      options: [
        {
          label: 'Pre-revenue / Starting up',
          value: 'Pre-revenue',
          reaction: `Starting up from scratch is always a bold move ${firstName}. Building the right base early on makes all the difference.`,
        },
        {
          label: '₹1L to ₹5L / month',
          value: '₹1L to ₹5L / mo',
          reaction: `That is a nice early run rate. You already have customers paying for what you offer.`,
        },
        {
          label: '₹5L to ₹25L / month',
          value: '₹5L to ₹25L / mo',
          reaction: `That is a solid monthly number ${firstName}. You have a clear product-market fit going on for ${bizName}.`,
        },
        {
          label: '₹25L to ₹1Cr / month',
          value: '₹25L to ₹1Cr / mo',
          reaction: `Doing ₹25L+ a month takes real effort. You have built strong traction in your market.`,
        },
        {
          label: 'Above ₹1Cr / month',
          value: 'Above ₹1Cr / mo',
          reaction: `Crossing ₹1Cr a month is a serious milestone ${firstName}. Respect for building ${bizName} to this level.`,
        },
      ],
    },
    {
      id: 'team_size',
      botMessages: [`How big is the team working with you right now?`],
      type: 'single',
      options: [
        {
          label: 'Just me (1)',
          value: '1',
          reaction: `Running the whole show as a solo founder takes serious dedication. You are wearing every hat right now.`,
        },
        {
          label: '2 to 5 people',
          value: '2 to 5',
          reaction: `A tight, close-knit team is always fast on execution and easy to coordinate.`,
        },
        {
          label: '6 to 15 people',
          value: '6 to 15',
          reaction: `That is a healthy team size where you have dedicated people handling key areas.`,
        },
        {
          label: '16 to 50 people',
          value: '16 to 50',
          reaction: `Managing a team of that size means your day-to-day operations are moving at a good pace.`,
        },
        {
          label: '50+ people',
          value: '50+',
          reaction: `That is a full-fledged organization with serious manpower behind ${bizName}.`,
        },
      ],
    },
    {
      id: 'market_size',
      botMessages: [`And where do most of your customers come from today?`],
      type: 'single',
      options: [
        {
          label: 'Single City (Within my city)',
          value: 'Single City',
          reaction: `Building a strong name in your home city first is always a great foundation.`,
        },
        {
          label: 'Nearby Cities & Districts',
          value: 'Multi-City / District Level',
          reaction: `Spreading across nearby districts shows your brand name is travelling well.`,
        },
        {
          label: 'Across the Whole State',
          value: 'State-Wide',
          reaction: `Serving customers across the entire state gives you a really wide market to play in.`,
        },
        {
          label: 'Regional (Multiple States)',
          value: 'Regional (Multi-State)',
          reaction: `Having an active customer base across multiple states is a strong position to be in.`,
        },
        {
          label: 'Pan-India (Across India)',
          value: 'Pan-India',
          reaction: `Operating Pan-India is awesome because your growth is not tied to just one geography.`,
        },
        {
          label: 'India + Selected Foreign Countries',
          value: 'International',
          reaction: `Serving both Indian and overseas clients is a great mix for business stability.`,
        },
        {
          label: 'Worldwide (Global Clients)',
          value: 'Worldwide',
          reaction: `Having clients coming in from around the world is a huge advantage for ${bizName}.`,
        },
      ],
    },
    {
      id: 'profitability',
      botMessages: [`How is your profit margin looking at the end of the month?`],
      type: 'single',
      options: [
        {
          label: 'Negative Profit (In Loss / Investing)',
          value: 'Negative Profit',
          reaction: `I appreciate your honesty ${firstName}. Almost every growing business goes through an investment phase before numbers turn around.`,
        },
        {
          label: 'Break-even (No Profit, No Loss)',
          value: 'Break-even',
          reaction: `Covering all your running costs is a fair baseline, though I know every founder works hard to see healthy profit at the end of the month.`,
        },
        {
          label: '0% to 9% Margin',
          value: '0% to 9% Margin',
          reaction: `Staying in positive profit while running operations is good, even if the margin feels a bit tight right now.`,
        },
        {
          label: '10% to 19% (Good Margin)',
          value: '10% to 19% (Good Margin)',
          reaction: `A 10% to 19% margin is a healthy, sustainable zone for a growing business.`,
        },
        {
          label: '20% to 29% (Strong Margin)',
          value: '20% to 29% (Strong Margin)',
          reaction: `Holding a 20%+ margin means your pricing and operations are really well balanced.`,
        },
        {
          label: '30% & More (High Margin)',
          value: '30%+ Margin',
          reaction: `A 30%+ margin is super rare and gives you massive breathing room to grow.`,
        },
      ],
    },

    // --- 2. YOUR PLAN FOR YOUR FUTURE ---
    {
      id: 'future_revenue',
      botMessages: [`Looking ahead, where do you want to take ${bizName}'s revenue next?`],
      type: 'single',
      options: [
        {
          label: '1x',
          value: '1x',
          reaction: `Making your current revenue steady and predictable month after month is a very practical priority.`,
        },
        {
          label: '3x',
          value: '3x',
          reaction: `Tripling from where you are today is an exciting and very realistic milestone to aim for.`,
        },
        {
          label: '7x',
          value: '7x',
          reaction: `Aiming for 7x shows you have big plans for ${bizName} in the coming months.`,
        },
        {
          label: '10x',
          value: '10x',
          reaction: `Love that 10x ambition ${firstName}. Thinking big is where category leaders are made.`,
        },
      ],
    },
    {
      id: 'future_timeline',
      botMessages: [`And what timeline do you have in your mind to hit that mark?`],
      type: 'single',
      options: [
        {
          label: '1 Month',
          value: '1 Month',
          reaction: `You are looking at an immediate sprint right now.`,
        },
        {
          label: '6 Months',
          value: '6 Months',
          reaction: `Six months is a really good runway to see meaningful transformation in a business.`,
        },
        {
          label: '1 Year',
          value: '1 Year',
          reaction: `A one-year horizon gives you enough room to build something solid and sustainable.`,
        },
        {
          label: '3 Years',
          value: '3 Years',
          reaction: `Having a clear three-year vision shows you are building ${bizName} for the long game.`,
        },
      ],
    },
    {
      id: 'has_strategy',
      botMessages: [`Do you already have a clear roadmap or strategy ready for this?`],
      type: 'single',
      options: [
        {
          label: 'Yes',
          value: 'Yes',
          reaction: `Having clarity on your strategy already puts you ahead of most businesses.`,
        },
        {
          label: 'No',
          value: 'No',
          reaction: `Fair enough ${firstName}. Many founders know their target number clearly, and figuring out the exact roadmap is the next natural step.`,
        },
      ],
    },

    // --- 3. HOW IS YOUR MARKETING TODAY ---
    {
      id: 'marketing_spend',
      botMessages: [`Coming to your marketing today, roughly how much are you investing in ads or marketing each month?`],
      type: 'single',
      options: [
        {
          label: 'No spend yet',
          value: 'No spend yet',
          reaction: `Interesting, so ${bizName} has grown purely without paid ads so far.`,
        },
        {
          label: 'Under ₹50k / month',
          value: 'Under ₹50k / month',
          reaction: `You are testing the waters with a lean monthly marketing budget right now.`,
        },
        {
          label: '₹50k to ₹2L / month',
          value: '₹50k to ₹2L / month',
          reaction: `That is a consistent monthly budget to keep campaigns running steadily.`,
        },
        {
          label: '₹2L to ₹10L / month',
          value: '₹2L to ₹10L / month',
          reaction: `Investing ₹2L+ a month shows you are actively pushing for scale.`,
        },
        {
          label: 'Above ₹10L / month',
          value: 'Above ₹10L / month',
          reaction: `Spending ₹10L+ every month is serious scale in the market.`,
        },
      ],
    },
    {
      id: 'marketing_leads',
      getBotMessages: (ans) =>
        ans.marketing_spend === 'No spend yet'
          ? [
              `Since you are not running paid ads yet, how are customers finding you right now, and roughly how many enquiries come in a month?`,
            ]
          : [`From that marketing spend, roughly how many leads or enquiries come in every month?`],
      type: 'single',
      getOptions: (ans) =>
        ans.marketing_spend === 'No spend yet'
          ? [
              {
                label: 'Referrals & Word of Mouth (Under 50 / mo)',
                value: 'Organic / Referrals (Under 50 leads)',
                reaction: `Word of mouth is the strongest proof that your existing customers love your work.`,
              },
              {
                label: 'Organic Social Media / Content (50 to 200 / mo)',
                value: 'Organic Social Media (50 to 200 leads)',
                reaction: `Getting 50 to 200 enquiries purely from organic content is really impressive.`,
              },
              {
                label: 'Website / Google Search / Walk-ins',
                value: 'Organic Website / Google / Walk-ins',
                reaction: `Customers finding you directly on Google or walking in means you have good organic visibility.`,
              },
              {
                label: 'Cold Calls / Direct B2B Outreach',
                value: 'Direct Outreach / Cold Calls',
                reaction: `Direct outreach takes grit, and it is a classic way to land B2B deals.`,
              },
              {
                label: 'Not getting regular leads yet',
                value: 'No regular leads yet',
                reaction: `Makes sense, without active campaigns or outreach, enquiry flow stays quiet.`,
              },
            ]
          : [
              {
                label: 'Under 50 leads / month',
                value: 'Under 50 leads',
                reaction: `So the enquiry volume is relatively niche and selective right now.`,
              },
              {
                label: '50 to 200 leads / month',
                value: '50 to 200 leads',
                reaction: `That gives you a steady stream of enquiries coming in every week.`,
              },
              {
                label: '200 to 1,000 leads / month',
                value: '200 to 1,000 leads',
                reaction: `Getting 200 to 1,000 enquiries a month keeps the sales pipeline pretty busy.`,
              },
              {
                label: 'Above 1,000 leads / month',
                value: 'Above 1,000 leads',
                reaction: `1,000+ leads a month is massive volume coming into your system.`,
              },
            ],
    },
    {
      id: 'marketing_conversion',
      getBotMessages: (ans) =>
        ans.marketing_spend === 'No spend yet'
          ? [`And out of those organic enquiries, roughly how many end up becoming paying customers?`]
          : [`How is your lead-to-sale conversion rate and overall ROI looking from those leads?`],
      type: 'single',
      getOptions: (ans) =>
        ans.marketing_spend === 'No spend yet'
          ? [
              {
                label: 'Below 5% Conversion',
                value: 'Organic: Below 5% Conversion',
                reaction: `Even with organic enquiries, turning them into paying customers can sometimes be tricky.`,
              },
              {
                label: '5% to 15% Conversion',
                value: 'Organic: 5% to 15% Conversion',
                reaction: `Converting 5% to 15% of incoming enquiries is a decent batting average.`,
              },
              {
                label: '15% to 30% Conversion',
                value: 'Organic: 15% to 30% Conversion',
                reaction: `Closing up to 30% of your enquiries shows strong trust when you speak with prospects.`,
              },
              {
                label: 'Above 30% (Mostly referral closures)',
                value: 'Organic: Above 30% Conversion',
                reaction: `Referral leads always close at a super high rate because the trust is already built in.`,
              },
              {
                label: 'Not tracked / No leads yet',
                value: 'Organic: Not tracked',
                reaction: `Totally understandable, most teams don't track exact percentages when leads come in organically.`,
              },
            ]
          : [
              {
                label: 'Below 2% Conversion | Low ROI',
                value: 'Below 2% Conv | Low ROI',
                reaction: `Seeing leads come in while conversions stay under 2% is one of the toughest spots for any business owner.`,
              },
              {
                label: '2% to 5% Conversion | 1x to 2x ROI',
                value: '2% to 5% Conv | 1x to 2x ROI',
                reaction: `A 2% to 5% conversion keeps things moving, though 1x to 2x ROI leaves room for much better efficiency.`,
              },
              {
                label: '5% to 15% Conversion | 3x to 5x ROI',
                value: '5% to 15% Conv | 3x to 5x ROI',
                reaction: `A 3x to 5x return with up to 15% conversion means your campaigns are pulling their weight well.`,
              },
              {
                label: 'Above 15% Conversion | 5x+ ROI',
                value: 'Above 15% Conv | 5x+ ROI',
                reaction: `Hitting 15%+ conversion and 5x+ ROI is top-tier performance in any industry.`,
              },
              {
                label: 'Not tracked properly yet',
                value: 'Not tracked',
                reaction: `That happens quite often when you are busy running daily operations.`,
              },
            ],
    },
    {
      id: 'funnel_automated',
      botMessages: [`Right now, is your lead follow-up and sales process automated, or handled manually?`],
      type: 'single',
      options: [
        {
          label: 'Yes',
          value: 'Yes',
          reaction: `Having automation running already saves a lot of daily manual effort for the team.`,
        },
        {
          label: 'No',
          value: 'No',
          reaction: `Handling every single follow-up manually on calls and messages definitely takes up a lot of bandwidth.`,
        },
        {
          label: 'Partly',
          value: 'Partly',
          reaction: `So you have a few tools in place, while your team still steps in for the rest of the follow-ups.`,
        },
      ],
    },

    // --- 4. WHAT WE ARE CAPABLE TO OFFER ---
    {
      id: 'capabilities_interest',
      botMessages: [
        `That gives me a complete picture of ${bizName} ${firstName}. Out of these four areas, which ones are most important to you right now?`,
      ],
      type: 'multi',
      options: [
        { label: 'Automating your sales', value: 'Automating your sales' },
        { label: 'Optimizing digital spend', value: 'Optimizing digital spend' },
        { label: 'Improving lead quality', value: 'Improving lead quality' },
        { label: 'Human interactive conversions', value: 'Human interactive conversions' },
      ],
    },

    // --- 5. APPOINTMENT PREFERENCE ---
    {
      id: 'appointment_preference',
      botMessages: [
        `Thank you so much for openly sharing everything about ${bizName}, ${firstName}! It really helps me understand your current scale and where you want to take the business next.`,
        `Would you like to pick a time and book the appointment by yourself, or would you like our team to schedule it for you?`,
      ],
      type: 'single',
      options: [
        {
          label: 'I will book by myself',
          value: 'Book by myself',
          reaction: '',
        },
        {
          label: 'You can make it for me',
          value: 'Book for me (Team will contact)',
          reaction: '',
        },
      ],
    },
  ];
};

export default function ChatbotFlow({ profile, onFinish, onBackToProfile }) {
  const steps = buildConversationFlow(profile);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(true);
  const [answers, setAnswers] = useState({});

  const [selectedCapabilities, setSelectedCapabilities] = useState([
    'Automating your sales',
    'Optimizing digital spend',
    'Improving lead quality',
    'Human interactive conversions',
  ]);

  const [isCompleted, setIsCompleted] = useState(false);
  const [appointmentRequested, setAppointmentRequested] = useState(false);

  const chatEndRef = useRef(null);
  const hasInitializedRef = useRef(false);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 60);
  };

  // Helper to play a sequence of bot messages with realistic human typing delays
  const playBotMessages = (messages, onDone) => {
    setIsTyping(true);
    scrollToBottom();

    let cumulativeDelay = 550;

    messages.forEach((msg, idx) => {
      setTimeout(() => {
        setChatHistory((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}-${idx}-${Math.random()}`,
            sender: 'bot',
            text: msg,
            time: formatTime(),
          },
        ]);
        scrollToBottom();

        if (idx === messages.length - 1) {
          setIsTyping(false);
          if (onDone) onDone();
        } else {
          setIsTyping(true);
        }
      }, cumulativeDelay);

      // Dynamic human reading/typing pause based on message length
      cumulativeDelay += Math.min(Math.max(msg.length * 12, 750), 1500);
    });
  };

  // Initial greeting on mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const firstStep = steps[0];
    if (firstStep) {
      playBotMessages(firstStep.botMessages);
    }
  }, []);

  const advanceWithHumanReply = (updatedAnswers, userReplyText, empathyReaction) => {
    // 1. Show User's bubble immediately
    setChatHistory((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: userReplyText,
        time: formatTime(),
      },
    ]);
    scrollToBottom();

    const nextIdx = currentStepIdx + 1;

    if (nextIdx < steps.length) {
      const nextStep = steps[nextIdx];
      setCurrentStepIdx(nextIdx);

      const resolvedNextMessages = nextStep.getBotMessages
        ? nextStep.getBotMessages(updatedAnswers)
        : nextStep.botMessages;

      // Combine empathetic human reaction to previous answer + next question
      const nextBotSequence = empathyReaction
        ? [empathyReaction, ...resolvedNextMessages]
        : [...resolvedNextMessages];

      playBotMessages(nextBotSequence);
    } else {
      // Final completion based on user's appointment choice
      const firstName = profile?.name?.split(' ')[0] || 'there';
      const bizName = profile?.businessName || 'your business';
      const choseSelfBook = updatedAnswers.appointment_preference === 'Book by myself';

      const finalMessages = choseSelfBook
        ? [
            `Thank you once again for taking the time to tell me about ${bizName}, ${firstName}! Please book your convenient time slot using the button below.`,
          ]
        : [
            `Thank you once again for taking the time to tell me all about ${bizName}, ${firstName}! Our team will review everything you shared and contact you shortly to schedule your session. Have a wonderful day!`,
          ];

      playBotMessages(finalMessages, () => {
        setIsCompleted(true);
        // If user chose "Book for me", save immediately as one complete row.
        // If user chose "Book by myself", wait for them to click "Book Your Appointment Here" so Calendar Link Clicked = Yes is saved in the same single row!
        if (!choseSelfBook && onFinish) {
          onFinish({
            ...updatedAnswers,
            appointment_booked_link_clicked: 'No (Team to schedule)',
          });
        }
        scrollToBottom();
      });
    }
  };

  const handleBookHereClick = () => {
    window.open(GOOGLE_CALENDAR_BOOKING_URL, '_blank', 'noopener,noreferrer');
    if (appointmentRequested) return;
    setAppointmentRequested(true);

    const updated = {
      ...answers,
      appointment_booked_link_clicked: 'Yes',
    };
    setAnswers(updated);

    if (onFinish) {
      onFinish(updated);
    }

    const firstName = profile?.name?.split(' ')[0] || 'there';
    const bizName = profile?.businessName || 'your business';
    playBotMessages([
      `Thank you ${firstName}! It was great learning about ${bizName} today. Looking forward to speaking with you on the call. Have a great day!`,
    ]);
  };

  const handleSingleSelect = (option) => {
    if (isTyping || isCompleted) return;
    const step = steps[currentStepIdx];
    const updated = { ...answers, [step.id]: option.value };
    setAnswers(updated);
    advanceWithHumanReply(updated, option.label, option.reaction);
  };

  const toggleCapability = (val) => {
    setSelectedCapabilities((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const handleMultiSubmit = () => {
    if (selectedCapabilities.length === 0 || isTyping || isCompleted) return;
    const updated = {
      ...answers,
      capabilities_selected: selectedCapabilities,
    };
    setAnswers(updated);
    advanceWithHumanReply(updated, selectedCapabilities.join(', '), null);
  };

  const currentStep = steps[currentStepIdx];
  const currentStepOptions = currentStep
    ? currentStep.getOptions
      ? currentStep.getOptions(answers)
      : currentStep.options
    : [];

  return (
    <div className="w-full h-full flex-1 flex flex-col">
      {/* Full-Page Edge-to-Edge Gold & Black WhatsApp Chatbot Container */}
      <div className="w-full flex-1 overflow-hidden bg-[#090909] flex flex-col">
        
        {/* Top Messenger Header */}
        <div className="bg-[#141414] px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-[#d39c12]/25 shrink-0">
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBackToProfile}
              className="p-2 -ml-1 rounded-full text-neutral-300 hover:bg-white/10 transition cursor-pointer"
              title="Back to details"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Top Header DP: Reach Skyline Logo */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-black border-2 border-[#d39c12] flex items-center justify-center overflow-hidden p-1">
                <img
                  src="/logo.png"
                  alt="Reach Skyline"
                  className="w-full h-full object-contain object-top"
                />
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#141414] absolute bottom-0 right-0" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white leading-tight flex items-center gap-2">
                <span>Reach Skyline</span>
              </h2>
              <div className="mt-1 flex items-center gap-1.5">
                {isTyping ? (
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-1 h-2 bg-[#d39c12] rounded-full animate-pulse" />
                    <span className="w-1 h-3 bg-[#d39c12] rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-1 h-1.5 bg-[#d39c12] rounded-full animate-pulse [animation-delay:300ms]" />
                    <span className="w-1 h-2.5 bg-[#d39c12] rounded-full animate-pulse [animation-delay:450ms]" />
                  </div>
                ) : (
                  <span className="text-xs text-neutral-400">Online</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Style Chat Area with Standing Ram Inside the Chat Flow */}
        <div
          className="no-scrollbar flex-1 overflow-y-auto px-3 sm:px-10 py-4 sm:py-6 space-y-4 sm:space-y-5"
          style={{
            backgroundColor: '#080808',
            backgroundImage: `radial-gradient(rgba(211, 156, 18, 0.12) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        >
          {/* Chat Bubbles with Standing Human Figure Inside Chat */}
          {chatHistory.map((item, idx) => {
            const isUser = item.sender === 'user';
            // Show Ram's standing figure on the first message of a bot group
            const prevItem = idx > 0 ? chatHistory[idx - 1] : null;
            const showStandingRam = !isUser && (!prevItem || prevItem.sender === 'user');

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18 }}
                className={`flex items-end gap-2 sm:gap-3.5 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-14 sm:w-28 shrink-0 flex flex-col items-center">
                    {showStandingRam ? (
                      <img
                        src={RAM_SIR_AVATAR}
                        alt="Ram"
                        className="w-14 sm:w-28 h-auto object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]"
                      />
                    ) : (
                      <div className="w-14 sm:w-28" />
                    )}
                  </div>
                )}

                <div
                  className={`relative max-w-[80%] sm:max-w-[65%] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-[13.5px] sm:text-[15px] leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-[#d39c12] text-black font-medium rounded-tr-none'
                      : 'bg-[#171717] text-neutral-100 border border-[#d39c12]/25 rounded-bl-none'
                  }`}
                >
                  {showStandingRam && (
                    <span className="block text-[11px] font-semibold text-[#d39c12] mb-1">
                      Ram • Reach Skyline
                    </span>
                  )}
                  <p className="whitespace-pre-line pr-12 sm:pr-14">{item.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5 float-right">
                    <span
                      className={`text-[10px] sm:text-[11px] ${
                        isUser ? 'text-black/70' : 'text-neutral-400'
                      }`}
                    >
                      {item.time}
                    </span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black/80" />}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Dots & Wave Indicator with Standing Ram Cutout */}
          {isTyping && (
            <div className="flex items-end gap-2 sm:gap-3.5 justify-start">
              <img
                src={RAM_SIR_AVATAR}
                alt="Ram"
                className="w-14 sm:w-28 h-auto object-contain shrink-0 drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]"
              />
              <div className="bg-[#171717] border border-[#d39c12]/30 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#d39c12] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-[#d39c12] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-[#d39c12] animate-bounce" />
              </div>
            </div>
          )}

          {/* Final Schedule Appointment Button inside Chat (Only if user chose "Book by myself", locks after 1 click so they cannot book more than once) */}
          {isCompleted && answers.appointment_preference === 'Book by myself' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2 sm:pt-3 pl-0 sm:pl-28 max-w-md"
            >
              {!appointmentRequested ? (
                <div className="bg-[#141414] border border-[#d39c12]/60 rounded-xl p-4 sm:p-5 space-y-3">
                  <button
                    type="button"
                    onClick={handleBookHereClick}
                    className="w-full py-3 px-4 rounded-lg bg-[#d39c12] hover:bg-[#e5b126] active:scale-[0.99] text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Book Your Appointment Here</span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#141414] border border-[#d39c12]/40 rounded-xl p-4 text-xs sm:text-sm text-[#d39c12] font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Appointment booking session opened (1 booking allowed per request).</span>
                </div>
              )}
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Reply Options Tray at Bottom */}
        {!isTyping && !isCompleted && currentStep && (
          <div className="bg-[#141414] border-t border-[#d39c12]/25 px-3 sm:px-8 py-3 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400 mb-2">
              {currentStep.type === 'multi'
                ? 'Select one or more options below:'
                : 'Tap an option below to reply:'}
            </p>
            {currentStep.type === 'single' && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2.5 max-h-40 sm:max-h-44 overflow-y-auto no-scrollbar">
                {currentStepOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSingleSelect(opt)}
                    className="text-left text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-full bg-[#1f1f1f] hover:bg-[#d39c12] active:bg-[#d39c12] text-neutral-200 hover:text-black active:text-black font-medium border border-[#d39c12]/40 transition cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {currentStep.type === 'multi' && (
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex flex-wrap gap-1.5 sm:gap-2.5 max-h-40 overflow-y-auto no-scrollbar">
                  {currentStepOptions.map((opt) => {
                    const isSelected = selectedCapabilities.includes(opt.value);
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => toggleCapability(opt.value)}
                        className={`text-left text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-full border transition flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#d39c12] text-black border-[#d39c12] font-semibold'
                            : 'bg-[#1f1f1f] text-neutral-300 border-[#d39c12]/30'
                        }`}
                      >
                        <Check
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                            isSelected ? 'text-black stroke-[3]' : 'opacity-40'
                          }`}
                        />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  disabled={selectedCapabilities.length === 0}
                  onClick={handleMultiSubmit}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#d39c12] hover:bg-[#e5b126] text-black text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Send Selected ({selectedCapabilities.length})</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
