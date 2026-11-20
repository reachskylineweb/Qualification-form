import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import OnboardingForm from './components/OnboardingForm';
import ChatbotFlow from './components/ChatbotFlow';
import { syncLeadData } from './utils/leadSync';

export default function App() {
  const [stage, setStage] = useState('onboarding'); // 'onboarding' | 'chat'
  const [profileData, setProfileData] = useState(null);
  const [hasUnsavedProgress, setHasUnsavedProgress] = useState(false);
  const [isFlowFinished, setIsFlowFinished] = useState(false);

  // Custom Gold & Black Confirmation Modal state (for F5 / Ctrl+R / Back / Leave attempts)
  const [confirmExitModal, setConfirmExitModal] = useState({
    open: false,
    actionType: '', // 'reload' | 'back_to_form'
  });

  // 1. Native Browser Close Tab / Reload Guard (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedProgress && !isFlowFinished) {
        e.preventDefault();
        e.returnValue =
          'If you refresh or close this page now, your entered details and chat progress will be lost.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedProgress, isFlowFinished]);

  // 2. Intercept F5 / Ctrl+R / Cmd+R keyboard refresh to show our custom Gold & Black warning popup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!hasUnsavedProgress || isFlowFinished) return;

      const isF5 = e.key === 'F5';
      const isCtrlR = (e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R');

      if (isF5 || isCtrlR) {
        e.preventDefault();
        setConfirmExitModal({ open: true, actionType: 'reload' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedProgress, isFlowFinished]);

  // 3. Intercept Browser Back Button while in Chat or OTP verification
  useEffect(() => {
    if (!hasUnsavedProgress || isFlowFinished) return;

    window.history.pushState({ reachskylineGuard: true }, '');
    const handlePopState = () => {
      if (hasUnsavedProgress && !isFlowFinished) {
        window.history.pushState({ reachskylineGuard: true }, '');
        setConfirmExitModal({
          open: true,
          actionType: stage === 'chat' ? 'back_to_form' : 'reload',
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasUnsavedProgress, isFlowFinished, stage]);

  const handleProfileComplete = async (data) => {
    setProfileData(data);
    setHasUnsavedProgress(true);
    setIsFlowFinished(false);
    setStage('chat');
  };

  const handleChatFinish = async (answers) => {
    setIsFlowFinished(true);
    setHasUnsavedProgress(false);
    await syncLeadData('COMPLETED', {
      profile: profileData,
      qualification: answers,
    });
  };

  const handleRequestBackFromChat = () => {
    if (!isFlowFinished) {
      setConfirmExitModal({ open: true, actionType: 'back_to_form' });
    } else {
      setStage('onboarding');
    }
  };

  const handleConfirmDiscard = () => {
    const type = confirmExitModal.actionType;
    setConfirmExitModal({ open: false, actionType: '' });

    if (type === 'back_to_form') {
      setStage('onboarding');
    } else {
      setHasUnsavedProgress(false);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-slate-100 flex flex-col justify-center relative">
      <AnimatePresence mode="wait">
        {stage === 'onboarding' ? (
          <motion.main
            key="onboarding-stage"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-6 sm:py-12"
          >
            <OnboardingForm
              initialData={profileData}
              onComplete={handleProfileComplete}
              onDirtyChange={(isDirty) => setHasUnsavedProgress(isDirty)}
            />
          </motion.main>
        ) : (
          <motion.main
            key="chat-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-[100dvh] flex flex-col overflow-hidden"
          >
            <ChatbotFlow
              profile={profileData}
              onFinish={handleChatFinish}
              onBackToProfile={handleRequestBackFromChat}
            />
          </motion.main>
        )}
      </AnimatePresence>

      {/* Custom Gold & Black Data Loss Warning Popup */}
      <AnimatePresence>
        {confirmExitModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-md rounded-2xl bg-[#111111] border border-[#d39c12]/60 p-6 shadow-[0_0_50px_-10px_rgba(211,156,18,0.35)] text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-[#d39c12]/15 border border-[#d39c12]/40 flex items-center justify-center mx-auto text-[#d39c12]">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Unsaved Progress Will Be Lost!
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  If you refresh, go back, or close this page right now, all the details and answers you have entered so far will be lost.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmExitModal({ open: false, actionType: '' })}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#d39c12] hover:bg-[#e5b126] text-black font-semibold text-xs sm:text-sm transition cursor-pointer"
                >
                  Stay & Continue
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#1d1d1d] hover:bg-rose-950/60 text-neutral-300 hover:text-rose-300 border border-neutral-700 hover:border-rose-500/40 font-medium text-xs sm:text-sm transition cursor-pointer"
                >
                  Discard & Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
