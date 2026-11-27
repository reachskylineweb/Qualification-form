import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Send,
  Calendar,
  MoreVertical,
  Rocket,
  IndianRupee,
  Layers,
  BarChart3,
  Crown,
  User,
  Users,
  Building2,
  Globe,
  TrendingUp,
  Target,
  Clock,
  Sparkles,
  Megaphone,
  Zap,
  Award,
  Compass,
  Settings,
  Bot,
} from 'lucide-react';
import { syncLeadData } from '../utils/leadSync';

const DESKTOP_OPTION_ICONS = [
  Rocket,
  IndianRupee,
  Layers,
  BarChart3,
  Crown,
  TrendingUp,
  Target,
  Globe,
];

const getDesktopOptionIcon = (stepId, idx) => {
  const byStep = {
    revenue_today: [Rocket, IndianRupee, Layers, BarChart3, Crown],
    team_size: [User, Users, Building2, Layers, Crown],
    market_size: [Compass, Building2, Layers, Globe, TrendingUp, Award, Crown],
    profitability: [Target, Layers, IndianRupee, TrendingUp, BarChart3, Crown],
    future_revenue: [TrendingUp, Rocket, BarChart3, Crown],
    future_timeline: [Zap, Clock, Calendar, Target],
    has_strategy: [Sparkles, Compass],
    marketing_spend: [Compass, IndianRupee, Layers, TrendingUp, BarChart3, Crown],
    marketing_leads: [Users, Megaphone, Globe, Target, Layers],
    marketing_conversion: [Target, TrendingUp, BarChart3, Crown, Compass],
    funnel_automated: [Bot, Settings, Layers],
    capabilities_interest: [Bot, IndianRupee, Target, Sparkles],
    appointment_preference: [Calendar, Users],
  };
  const list = byStep[stepId] || DESKTOP_OPTION_ICONS;
  return list[idx % list.length] || Sparkles;
};

const MOBILE_STEP_TITLES = {
  revenue_today: 'Select your current monthly revenue',
  team_size: 'Select your current team size',
  market_size: 'Select your current market reach',
  profitability: 'Select your current profit margin',
  future_revenue: 'Select your revenue growth target',
  future_timeline: 'Select your target timeline',
  has_strategy: 'Do you have a clear strategy in place?',
  marketing_spend: 'Select your monthly marketing spend',
  marketing_leads: 'Select your monthly enquiry volume',
  marketing_conversion: 'Select your conversion rate & ROI',
  funnel_automated: 'Is your sales process automated?',
  capabilities_interest: 'Select your top priority areas',
  appointment_preference: 'How would you like to book your session?',
};

const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const RAM_SIR_AVATAR = './ram-sir-avatar.png';
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
        `To make our upcoming conversation truly relevant to you, I would love to learn a few quick details about where ${bizName} stands today. What is your current monthly revenue?`,
      ],
      type: 'single',
      options: [
        {
          label: 'Pre-revenue / Starting up',
          value: 'Pre-revenue',
          reaction: `Starting from scratch is always a bold move, ${firstName}. Building the right foundation early on makes all the difference.`,
        },
        {
          label: '₹1L to ₹5L / month',
          value: '₹1L to ₹5L / mo',
          reaction: `That is a great early run rate. You already have paying customers for what you offer.`,
        },
        {
          label: '₹5L to ₹25L / month',
          value: '₹5L to ₹25L / mo',
          reaction: `That is a solid monthly run rate, ${firstName}. You clearly have strong product-market fit at ${bizName}.`,
        },
        {
          label: '₹25L to ₹1Cr / month',
          value: '₹25L to ₹1Cr / mo',
          reaction: `Generating ₹25L+ a month takes real execution. You have built strong traction in your market.`,
        },
        {
          label: 'Above ₹1Cr / month',
          value: 'Above ₹1Cr / mo',
          reaction: `Crossing ₹1Cr a month is a major milestone, ${firstName}. Huge respect for scaling ${bizName} to this level.`,
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
          reaction: `Running the entire operation as a solo founder takes serious dedication. You are wearing every hat right now.`,
        },
        {
          label: '2 to 5 people',
          value: '2 to 5',
          reaction: `A lean, close-knit team is always fast on execution and easy to coordinate.`,
        },
        {
          label: '6 to 15 people',
          value: '6 to 15',
          reaction: `That is a healthy team size with dedicated people handling key functions.`,
        },
        {
          label: '16 to 50 people',
          value: '16 to 50',
          reaction: `Managing a team of that size means your day-to-day operations are moving at a strong pace.`,
        },
        {
          label: '50+ people',
          value: '50+',
          reaction: `That is a full-fledged organization with strong manpower behind ${bizName}.`,
        },
      ],
    },
    {
      id: 'market_size',
      botMessages: [`Where do most of your customers come from today?`],
      type: 'single',
      options: [
        {
          label: 'Single City (Within my city)',
          value: 'Single City',
          reaction: `Building a strong reputation in your home city first is always a great foundation.`,
        },
        {
          label: 'Nearby Cities & Districts',
          value: 'Multi-City / District Level',
          reaction: `Expanding across nearby districts shows your brand reputation is travelling well.`,
        },
        {
          label: 'Across the Entire State',
          value: 'State-Wide',
          reaction: `Serving customers across the entire state gives you a wide market to operate in.`,
        },
        {
          label: 'Regional (Multiple States)',
          value: 'Regional (Multi-State)',
          reaction: `Having an active customer base across multiple states is a strong position to be in.`,
        },
        {
          label: 'Pan-India (Across India)',
          value: 'Pan-India',
          reaction: `Operating pan-India is fantastic because your growth is not limited to a single region.`,
        },
        {
          label: 'India + Selected Countries',
          value: 'International',
          reaction: `Serving both Indian and overseas clients is a great mix for long-term stability.`,
        },
        {
          label: 'Worldwide (Global Clients)',
          value: 'Worldwide',
          reaction: `Serving clients around the world is a major advantage for ${bizName}.`,
        },
      ],
    },
    {
      id: 'profitability',
      botMessages: [`What does your current monthly profit margin look like?`],
      type: 'single',
      options: [
        {
          label: 'Negative Profit (In Loss / Investing)',
          value: 'Negative Profit',
          reaction: `I appreciate your honesty, ${firstName}. Almost every growing business goes through an investment phase before turning profitable.`,
        },
        {
          label: 'Break-even (No Profit, No Loss)',
          value: 'Break-even',
          reaction: `Covering all your operating costs is a solid baseline as you work toward healthy monthly margins.`,
        },
        {
          label: '0% to 9% Margin',
          value: '0% to 9% Margin',
          reaction: `Staying profitable while running operations is good, even if the margin feels a bit tight right now.`,
        },
        {
          label: '10% to 19% (Good Margin)',
          value: '10% to 19% (Good Margin)',
          reaction: `A 10% to 19% margin is a healthy, sustainable range for a growing business.`,
        },
        {
          label: '20% to 29% (Strong Margin)',
          value: '20% to 29% (Strong Margin)',
          reaction: `Maintaining a 20%+ margin means your pricing and operations are well balanced.`,
        },
        {
          label: '30% & Above (High Margin)',
          value: '30%+ Margin',
          reaction: `A 30%+ margin is impressive and gives you strong room to scale.`,
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
          label: '1x (Consistent Growth)',
          value: '1x',
          reaction: `Making your current revenue steady and predictable month after month is a very practical priority.`,
        },
        {
          label: '3x Growth',
          value: '3x',
          reaction: `Tripling from where you are today is an exciting and achievable milestone to aim for.`,
        },
        {
          label: '7x Growth',
          value: '7x',
          reaction: `Aiming for 7x growth shows you have ambitious plans for ${bizName}.`,
        },
        {
          label: '10x Growth',
          value: '10x',
          reaction: `I love that 10x ambition, ${firstName}. Thinking big is how category leaders are built.`,
        },
      ],
    },
    {
      id: 'future_timeline',
      botMessages: [`What timeline do you have in mind to reach that goal?`],
      type: 'single',
      options: [
        {
          label: '1 Month',
          value: '1 Month',
          reaction: `You are looking at an immediate, fast-paced sprint right now.`,
        },
        {
          label: '6 Months',
          value: '6 Months',
          reaction: `Six months is a great runway to see meaningful growth in a business.`,
        },
        {
          label: '1 Year',
          value: '1 Year',
          reaction: `A one-year horizon gives you the right room to build something solid and sustainable.`,
        },
        {
          label: '3 Years',
          value: '3 Years',
          reaction: `Having a clear three-year vision shows you are building ${bizName} for long-term success.`,
        },
      ],
    },
    {
      id: 'has_strategy',
      botMessages: [`Do you already have a clear roadmap or strategy in place to achieve this?`],
      type: 'single',
      options: [
        {
          label: 'Yes, we have a clear strategy',
          value: 'Yes',
          reaction: `Having clarity on your strategy already puts you ahead of most businesses.`,
        },
        {
          label: 'No, still figuring it out',
          value: 'No',
          reaction: `Fair enough, ${firstName}. Many founders have a clear target in mind, and mapping out the right strategy is the natural next step.`,
        },
      ],
    },

    // --- 3. HOW IS YOUR MARKETING TODAY ---
    {
      id: 'marketing_spend',
      botMessages: [`Moving to your current marketing, roughly how much do you invest in ads or marketing each month?`],
      type: 'single',
      options: [
        {
          label: 'No spend yet',
          value: 'No spend yet',
          reaction: `Interesting, so ${bizName} has grown purely through organic channels without paid ads so far.`,
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
          label: '₹2L to ₹5L / month',
          value: '₹2L to ₹5L / month',
          reaction: `Investing ₹2L to ₹5L a month shows you are actively pushing for scale.`,
        },
        {
          label: '₹5L to ₹10L / month',
          value: '₹5L to ₹10L / month',
          reaction: `A ₹5L to ₹10L monthly budget provides strong fuel for consistent customer acquisition.`,
        },
        {
          label: 'Above ₹10L / month',
          value: 'Above ₹10L / month',
          reaction: `Investing ₹10L+ every month is serious scale in the market.`,
        },
      ],
    },
    {
      id: 'marketing_leads',
      getBotMessages: (ans) =>
        ans.marketing_spend === 'No spend yet'
          ? [
              `Since you are not running paid ads yet, how do customers usually find you, and roughly how many enquiries do you receive per month?`,
            ]
          : [`From that marketing spend, roughly how many leads or enquiries do you generate each month?`],
      type: 'single',
      getOptions: (ans) =>
        ans.marketing_spend === 'No spend yet'
          ? [
              {
                label: 'Referrals & Word of Mouth (Under 50 / mo)',
                value: 'Organic / Referrals (Under 50 leads)',
                reaction: `Word of mouth is the strongest proof that your existing customers value your work.`,
              },
              {
                label: 'Organic Social Media / Content (50 to 200 / mo)',
                value: 'Organic Social Media (50 to 200 leads)',
                reaction: `Generating 50 to 200 enquiries purely from organic content is really impressive.`,
              },
              {
                label: 'Website / Google Search / Walk-ins',
                value: 'Organic Website / Google / Walk-ins',
                reaction: `Customers finding you directly on Google or walking in shows strong organic visibility.`,
              },
              {
                label: 'Cold Calls / Direct B2B Outreach',
                value: 'Direct Outreach / Cold Calls',
                reaction: `Direct outreach takes persistence, and it is a proven way to win B2B deals.`,
              },
              {
                label: 'Not getting regular enquiries yet',
                value: 'No regular leads yet',
                reaction: `That makes sense. Without active campaigns or outreach, enquiry flow naturally stays quiet.`,
              },
            ]
          : [
              {
                label: 'Under 50 leads / month',
                value: 'Under 50 leads',
                reaction: `So your enquiry volume is relatively niche and selective right now.`,
              },
              {
                label: '50 to 200 leads / month',
                value: '50 to 200 leads',
                reaction: `That gives you a steady stream of enquiries coming in every week.`,
              },
              {
                label: '200 to 1,000 leads / month',
                value: '200 to 1,000 leads',
                reaction: `Generating 200 to 1,000 enquiries a month keeps the sales pipeline active.`,
              },
              {
                label: 'Above 1,000 leads / month',
                value: 'Above 1,000 leads',
                reaction: `1,000+ leads a month is massive volume coming into your pipeline.`,
              },
            ],
    },
    {
      id: 'marketing_conversion',
      getBotMessages: (ans) =>
        ans.marketing_spend === 'No spend yet'
          ? [`And out of those organic enquiries, roughly what percentage convert into paying customers?`]
          : [`What does your lead-to-sale conversion rate and overall ROI look like from that marketing spend?`],
      type: 'single',
      getOptions: (ans) =>
        ans.marketing_spend === 'No spend yet'
          ? [
              {
                label: 'Below 5% Conversion',
                value: 'Organic: Below 5% Conversion',
                reaction: `Even with organic enquiries, converting them into paying customers can sometimes be challenging.`,
              },
              {
                label: '5% to 15% Conversion',
                value: 'Organic: 5% to 15% Conversion',
                reaction: `Converting 5% to 15% of incoming enquiries is a solid conversion rate.`,
              },
              {
                label: '15% to 30% Conversion',
                value: 'Organic: 15% to 30% Conversion',
                reaction: `Closing up to 30% of your enquiries shows strong trust when you speak with prospects.`,
              },
              {
                label: 'Above 30% (Mostly referral closures)',
                value: 'Organic: Above 30% Conversion',
                reaction: `Referral enquiries always close at a high rate because trust is already established.`,
              },
              {
                label: 'Not tracked yet',
                value: 'Organic: Not tracked',
                reaction: `Totally understandable. Many teams do not track exact percentages when enquiries come in organically.`,
              },
            ]
          : [
              {
                label: 'Below 2% Conversion | Low ROI',
                value: 'Below 2% Conv | Low ROI',
                reaction: `Seeing leads come in while conversions stay under 2% is a common challenge for growing businesses.`,
              },
              {
                label: '2% to 5% Conversion | 1x to 2x ROI',
                value: '2% to 5% Conv | 1x to 2x ROI',
                reaction: `A 2% to 5% conversion rate keeps things moving, while 1x to 2x ROI leaves room for better efficiency.`,
              },
              {
                label: '5% to 15% Conversion | 3x to 5x ROI',
                value: '5% to 15% Conv | 3x to 5x ROI',
                reaction: `A 3x to 5x return with up to 15% conversion means your campaigns are performing well.`,
              },
              {
                label: 'Above 15% Conversion | 5x+ ROI',
                value: 'Above 15% Conv | 5x+ ROI',
                reaction: `Achieving 15%+ conversion and 5x+ ROI is top-tier performance in any industry.`,
              },
              {
                label: 'Not tracked properly yet',
                value: 'Not tracked',
                reaction: `That happens quite often when you are focused on running daily operations.`,
              },
            ],
    },
    {
      id: 'funnel_automated',
      botMessages: [`Right now, is your lead follow-up and sales process automated?`],
      type: 'single',
      options: [
        {
          label: 'Yes, fully automated',
          value: 'Yes',
          reaction: `Having automation in place already saves a lot of daily manual effort for your team.`,
        },
        {
          label: 'No, handled manually',
          value: 'No',
          reaction: `Handling every follow-up manually across calls and messages definitely takes up significant bandwidth.`,
        },
        {
          label: 'Partially automated',
          value: 'Partly',
          reaction: `So you have a few tools in place, while your team still handles the rest of the follow-ups manually.`,
        },
      ],
    },

    // --- 4. WHAT WE ARE CAPABLE TO OFFER ---
    {
      id: 'capabilities_interest',
      botMessages: [
        `That gives me a clear picture of ${bizName}, ${firstName}. Out of these four areas, which ones are your top priorities right now?`,
      ],
      type: 'multi',
      options: [
        { label: 'Automating your sales', value: 'Automating your sales' },
        { label: 'Optimizing digital spend', value: 'Optimizing digital spend' },
        { label: 'Improving lead quality', value: 'Improving lead quality' },
        { label: 'Others', value: 'Others' },
      ],
    },

    // --- 5. APPOINTMENT PREFERENCE ---
    {
      id: 'appointment_preference',
      botMessages: [
        `Thank you so much for sharing these insights about ${bizName}, ${firstName}! It gives me a clear understanding of your current scale and where you want to take the business next.`,
        `How would you like to schedule your 1-on-1 session with us?`,
      ],
      type: 'single',
      options: [
        {
          label: "I'll book a slot myself",
          value: 'Book by myself',
          reaction: '',
        },
        {
          label: 'Have your team schedule it',
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

  const [selectedCapabilities, setSelectedCapabilities] = useState([]);
  const [activeMobileOption, setActiveMobileOption] = useState(null);

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

    let cumulativeDelay = 1600;

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
      cumulativeDelay += Math.min(Math.max(msg.length * 22, 1600), 2400);
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

  // Helper to resolve the next step index (handles conditional branching after marketing_spend)
  const getNextStepIndex = (fromIdx, currentAnswers) => {
    const current = steps[fromIdx];
    if (current?.id === 'marketing_spend') {
      if (currentAnswers.marketing_spend === 'No spend yet') {
        const capIdx = steps.findIndex((s) => s.id === 'capabilities_interest');
        if (capIdx !== -1) return capIdx;
      } else {
        const roiIdx = steps.findIndex((s) => s.id === 'marketing_conversion');
        if (roiIdx !== -1) return roiIdx;
      }
    }
    return fromIdx + 1;
  };

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

    const nextIdx = getNextStepIndex(currentStepIdx, updatedAnswers);

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

      if (!choseSelfBook) {
        // Directly open the separate Thank You Page!
        setIsCompleted(true);
        setTimeout(() => {
          if (onFinish) {
            onFinish({
              ...updatedAnswers,
              appointment_booked_link_clicked: 'No (Team to schedule)',
            });
          }
        }, 350);
      } else {
        playBotMessages(
          [
            `Great, ${firstName}! Please pick a convenient time slot for ${bizName} using the button below.`,
          ],
          () => {
            setIsCompleted(true);
            scrollToBottom();
          }
        );
      }
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
  };

  const handleSingleSelect = (option) => {
    if (isTyping || isCompleted) return;
    setActiveMobileOption(option.value);
    const step = steps[currentStepIdx];
    const isFinalStep = currentStepIdx === steps.length - 1;
    const updated = {
      ...answers,
      [step.id]: option.value,
      ...(isFinalStep
        ? {
            appointment_booked_link_clicked:
              option.value === 'Book by myself'
                ? 'No (Opened self-booking button)'
                : 'No (Team to schedule)',
          }
        : {}),
    };
    setAnswers(updated);

    // Track every single answer immediately in real-time so drop-offs are recorded
    const resolvedNextIdx = getNextStepIndex(currentStepIdx, updated);
    const nextStepObj = steps[resolvedNextIdx];
    syncLeadData(`CHAT_STEP_${currentStepIdx + 1}_${step.id.toUpperCase()}`, {
      lastStep: nextStepObj
        ? `Answered ${step.id} (Stopped at ${nextStepObj.id})`
        : `Completed Chat (${option.label})`,
      profile,
      qualification: updated,
    });

    setTimeout(() => {
      setActiveMobileOption(null);
      advanceWithHumanReply(updated, option.label, option.reaction);
    }, 180);
  };

  const currentStep = steps[currentStepIdx];
  const currentStepOptions = currentStep
    ? currentStep.getOptions
      ? currentStep.getOptions(answers)
      : currentStep.options
    : [];

  // Ensure multi-select state only ever contains valid options for the active step
  const validOptionValues = new Set(currentStepOptions.map((o) => o.value));
  const validSelectedCapabilities = selectedCapabilities.filter((val) =>
    validOptionValues.has(val)
  );

  useEffect(() => {
    setSelectedCapabilities([]);
  }, [currentStepIdx]);

  const toggleCapability = (val) => {
    setSelectedCapabilities((prev) => {
      const cleanPrev = prev.filter((item) => validOptionValues.has(item));
      if (val === 'Others') {
        return cleanPrev.includes('Others') ? [] : ['Others'];
      }
      const withoutOthers = cleanPrev.filter((item) => item !== 'Others');
      return withoutOthers.includes(val)
        ? withoutOthers.filter((item) => item !== val)
        : [...withoutOthers, val];
    });
  };

  const handleMultiSubmit = () => {
    if (validSelectedCapabilities.length === 0 || isTyping || isCompleted) return;
    const updated = {
      ...answers,
      capabilities_selected: validSelectedCapabilities,
    };
    setAnswers(updated);

    // Track multi-select answer immediately in real-time
    syncLeadData('CHAT_STEP_12_CAPABILITIES', {
      lastStep: 'Answered capabilities_interest (Stopped at appointment_preference)',
      profile,
      qualification: updated,
    });

    advanceWithHumanReply(updated, validSelectedCapabilities.join(', '), null);
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col bg-[#eef0f4]">
      {/* Minimal & Clean Light UI for Both Mobile & Desktop (with reduced whitespace on Desktop) */}
      <div className="w-full flex-1 overflow-hidden bg-[#f5f6f8] flex flex-col">
        
        {/* Top Messenger Header */}
        <div className="bg-white px-4 sm:px-10 py-3 sm:py-3.5 flex items-center justify-between border-b border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <button
              onClick={onBackToProfile}
              className="p-2 -ml-1 rounded-full text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
              title="Back to details"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Top Header DP: Reach Skyline Logo */}
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-black border-2 border-[#d39c12] flex items-center justify-center overflow-hidden p-1">
                <img
                  src="./logo.png"
                  alt="Reach Skyline"
                  className="w-full h-full object-contain object-top"
                />
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0 right-0" />
            </div>

            <div>
              <h2 className="text-[17px] sm:text-lg font-bold text-neutral-900 leading-tight flex items-center gap-2">
                <span>Reach Skyline</span>
              </h2>
              <div className="mt-0.5 flex items-center gap-1.5">
                {isTyping ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#b88208] tracking-wide">
                      typing
                    </span>
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="typing-wave-dot w-1.5 h-1.5 rounded-full bg-[#c89116]" />
                      <span className="typing-wave-dot w-1.5 h-1.5 rounded-full bg-[#c89116]" />
                      <span className="typing-wave-dot w-1.5 h-1.5 rounded-full bg-[#c89116]" />
                      <span className="typing-wave-dot w-1.5 h-1.5 rounded-full bg-[#c89116]" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-neutral-500">Online</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-1.5 text-neutral-700">
            <MoreVertical className="w-5 h-5" />
          </div>
        </div>

        {/* Chat Stream Area (Full-width on desktop with larger bubbles & zero wasted side/middle whitespace) */}
        <div className="chat-stream-bg no-scrollbar flex-1 overflow-y-auto px-3.5 sm:px-10 py-3.5 sm:py-7">
          <div className="w-full space-y-3 sm:space-y-4">
            {/* Chat Bubbles */}
            {chatHistory.map((item, idx) => {
              const isUser = item.sender === 'user';
              const prevItem = idx > 0 ? chatHistory[idx - 1] : null;
              const showStandingRam = !isUser && (!prevItem || prevItem.sender === 'user');

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-start gap-2 sm:gap-5 justify-start"
                >
                  {!isUser ? (
                    <div className="w-11 sm:w-20 shrink-0 flex items-start justify-center mt-0.5">
                      {showStandingRam ? (
                        <div className="w-11 h-11 sm:w-20 sm:h-20 rounded-full bg-[#f5f3ec] border-2 border-[#ebd074] shadow-sm overflow-hidden">
                          <img
                            src={RAM_SIR_AVATAR}
                            alt="Ram"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-11 sm:w-20" />
                      )}
                    </div>
                  ) : (
                    <div className="w-11 sm:w-20 shrink-0" />
                  )}

                  <div
                    className={`relative px-3.5 sm:px-6 py-2.5 sm:py-4 rounded-2xl text-[14px] sm:text-[17px] leading-[1.45] sm:leading-relaxed ${
                      isUser
                        ? 'max-w-[78%] sm:max-w-[75%] bg-[#fdf0c2] text-neutral-900 border border-[#ebd074] font-semibold rounded-tl-sm shadow-sm'
                        : 'max-w-[74%] sm:w-full sm:max-w-[88%] mr-auto bg-white text-neutral-900 border border-neutral-200/90 rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    {showStandingRam && (
                      <span className="inline-block px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#fae8b0] text-[#855800] text-[11.5px] sm:text-[13px] font-bold mb-1.5 sm:mb-2">
                        Ram • Reach Skyline
                      </span>
                    )}
                    <p className="whitespace-pre-line">{item.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5">
                      <span
                        className={`text-[11px] sm:text-xs ${
                          isUser ? 'text-neutral-600' : 'text-neutral-400'
                        }`}
                      >
                        {item.time}
                      </span>
                      {isUser && (
                        <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#b47b05]" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Typing & Dotted Wave Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2 sm:gap-5 justify-start">
                <div className="w-11 h-11 sm:w-20 sm:h-20 rounded-full bg-[#f5f3ec] border-2 border-[#ebd074] shadow-sm overflow-hidden shrink-0 mt-0.5">
                  <img
                    src={RAM_SIR_AVATAR}
                    alt="Ram"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-white border border-neutral-200 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-sm flex items-center gap-2.5">
                  <span className="text-xs sm:text-base font-semibold text-[#b47b05] tracking-wide">
                    typing
                  </span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="typing-wave-dot w-2 h-2 rounded-full bg-[#c89116]" />
                    <span className="typing-wave-dot w-2 h-2 rounded-full bg-[#c89116]" />
                    <span className="typing-wave-dot w-2 h-2 rounded-full bg-[#c89116]" />
                    <span className="typing-wave-dot w-2 h-2 rounded-full bg-[#c89116]" />
                  </div>
                </div>
              </div>
            )}

            {/* Final Schedule Appointment Button inside Chat */}
            {isCompleted && answers.appointment_preference === 'Book by myself' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2 sm:pt-3 pl-0 sm:pl-24 max-w-md"
              >
                {!appointmentRequested ? (
                  <div className="bg-white border border-[#d39c12]/60 rounded-2xl p-4 sm:p-5 shadow-md space-y-3">
                    <button
                      type="button"
                      onClick={handleBookHereClick}
                      className="w-full py-3 px-4 rounded-xl bg-[#d39c12] hover:bg-[#e5b126] active:scale-[0.99] text-black font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>Book Your Appointment Here</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-[#d39c12]/50 rounded-2xl p-4 text-xs sm:text-sm text-[#b47b05] font-semibold flex items-center gap-2 shadow-sm">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Appointment booking session opened (1 booking allowed per request).</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* DESKTOP ONLY (sm+): Docked Right Below Active Message (No Gap!)   */}
            {/* ================================================================= */}
            {!isTyping && !isCompleted && currentStep && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:block pt-3"
              >
                <div className="w-full bg-white border border-[#e3c66b] rounded-2xl px-7 py-5 shadow-[0_6px_24px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex items-end gap-[3px] h-5 shrink-0">
                      <span className="w-1.5 h-2.5 bg-[#c89116] rounded-t-xs" />
                      <span className="w-1.5 h-4 bg-[#c89116] rounded-t-xs" />
                      <span className="w-1.5 h-5 bg-[#c89116] rounded-t-xs" />
                    </div>
                    <p className="text-base font-bold text-neutral-900">
                      {currentStep.type === 'multi'
                        ? 'Select one or more options below:'
                        : 'Tap an option below to reply:'}
                    </p>
                  </div>

                  {currentStep.type === 'single' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                      {currentStepOptions.map((opt, idx) => {
                        const IconComp = getDesktopOptionIcon(currentStep.id, idx);
                        const isSelected = activeMobileOption === opt.value;
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => handleSingleSelect(opt)}
                            className={`option-gold-shimmer text-left px-5 py-4 rounded-xl border transition flex items-center gap-3.5 cursor-pointer ${
                              isSelected
                                ? 'bg-[#fcebb6] border-[#d39c12] text-neutral-950'
                                : 'bg-white hover:bg-[#fdf3cf] border-[#dfbe5b] hover:border-[#d39c12] text-neutral-900'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-[#fdf4d6] flex items-center justify-center shrink-0 text-[#c58b12]">
                              <IconComp className="w-6 h-6" />
                            </div>
                            <span className="text-[15px] font-bold leading-snug">
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {currentStep.type === 'multi' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {currentStepOptions.map((opt, idx) => {
                          const IconComp = getDesktopOptionIcon(currentStep.id, idx);
                          const isSelected = selectedCapabilities.includes(opt.value);
                          return (
                            <button
                              type="button"
                              key={opt.value}
                              onClick={() => toggleCapability(opt.value)}
                              className={`option-gold-shimmer text-left px-5 py-4 rounded-xl border transition flex items-center gap-3.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#fcebb6] border-[#d39c12] text-neutral-950'
                                  : 'bg-white hover:bg-[#fdf3cf] border-[#dfbe5b] text-neutral-900'
                              }`}
                            >
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'bg-[#d39c12] text-black'
                                    : 'bg-[#fdf4d6] text-[#c58b12]'
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="w-5 h-5 stroke-[3]" />
                                ) : (
                                  <IconComp className="w-6 h-6" />
                                )}
                              </div>
                              <span className="text-[15px] font-bold leading-snug">
                                {opt.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={validSelectedCapabilities.length === 0}
                          onClick={handleMultiSubmit}
                          className="px-7 py-3 rounded-xl bg-[#d39c12] hover:bg-[#e5b126] disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                        >
                          <span>Send Selected ({validSelectedCapabilities.length})</span>
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* ================================================================= */}
        {/* MOBILE ONLY (< sm): Option 3 – Minimal & Clean White Floating Card */}
        {/* ================================================================= */}
        {!isTyping && !isCompleted && currentStep && (
          <div className="sm:hidden px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 bg-[#f4f5f7] shrink-0">
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-4">
              {/* Card Title with Gold Bar Chart Icon */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex items-end gap-[2.5px] h-4 shrink-0">
                  <span className="w-[3.5px] h-2 bg-[#c89116] rounded-t-xs" />
                  <span className="w-[3.5px] h-4 bg-[#c89116] rounded-t-xs" />
                  <span className="w-[3.5px] h-3 bg-[#c89116] rounded-t-xs" />
                </div>
                <h3 className="text-[14.5px] font-bold text-neutral-900 leading-snug">
                  {MOBILE_STEP_TITLES[currentStep.id] || 'Select an option below'}
                </h3>
              </div>

              {currentStep.type === 'single' && (
                <div className="space-y-2 max-h-[36vh] overflow-y-auto no-scrollbar">
                  {currentStepOptions.map((opt) => {
                    const isSelected = activeMobileOption === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => handleSingleSelect(opt)}
                        className={`option-gold-shimmer w-full px-3.5 py-2.5 rounded-xl border text-left text-[14px] transition flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-[#fdf0c2] border-[#ebd074] text-neutral-950 font-semibold'
                            : 'bg-white border-[#dfbe5b] text-neutral-900 font-medium active:bg-[#fdf0c2] active:border-[#ebd074]'
                        }`}
                      >
                        <span
                          className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 transition ${
                            isSelected
                              ? 'border-2 border-[#b47b05] bg-white'
                              : 'border-[1.5px] border-[#b48a2c]/70 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#b47b05]" />
                          )}
                        </span>
                        <span className="leading-snug">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentStep.type === 'multi' && (
                <div className="space-y-3">
                  <div className="space-y-2 max-h-[32vh] overflow-y-auto no-scrollbar">
                    {currentStepOptions.map((opt) => {
                      const isSelected = selectedCapabilities.includes(opt.value);
                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => toggleCapability(opt.value)}
                          className={`option-gold-shimmer w-full px-3.5 py-2.5 rounded-xl border text-left text-[14px] transition flex items-center gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-[#fdf0c2] border-[#ebd074] text-neutral-950 font-semibold'
                              : 'bg-white border-[#dfbe5b] text-neutral-900 font-medium'
                          }`}
                        >
                          <span
                            className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'border-2 border-[#b47b05] bg-white'
                                : 'border-[1.5px] border-[#b48a2c]/70 bg-white'
                            }`}
                          >
                            {isSelected && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#b47b05]" />
                            )}
                          </span>
                          <span className="leading-snug">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    disabled={validSelectedCapabilities.length === 0}
                    onClick={handleMultiSubmit}
                    className="w-full py-2.5 px-5 rounded-xl bg-[#d39c12] hover:bg-[#e5b126] disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Send Selected ({validSelectedCapabilities.length})</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
