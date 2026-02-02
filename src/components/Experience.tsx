'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronRight, Volume2, VolumeX, Pause, Play, Grid } from 'lucide-react';
import { useStore } from '@/store/useStore';
import StarryBackground from './StarryBackground';
import HeartIcon from './HeartIcon';
import FallingPetals from './FallingPetals';

export default function Experience() {
  const {
    generatedStory,
    experienceState,
    setCurrentChapter,
    revealChapter,
    setResponse,
    setViewMode,
  } = useStore();

  const [showIntro, setShowIntro] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [showInnerThought, setShowInnerThought] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showFinalReveal, setShowFinalReveal] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const { currentChapter, isRevealed, hasResponded, response } = experienceState;

  const chapter = generatedStory?.chapters[currentChapter];
  const isLastChapter = currentChapter === (generatedStory?.chapters.length || 0) - 1;

  // Typing effect for narrative
  const typeText = useCallback((text: string, onComplete: () => void) => {
    if (isPaused) return;

    let index = 0;
    setDisplayedText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      if (isPaused) {
        clearInterval(interval);
        return;
      }

      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        onComplete();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Handle chapter reveal
  useEffect(() => {
    if (!chapter || showIntro || isPaused) return;

    setShowInnerThought(false);
    setCanProceed(false);
    setDisplayedText('');

    const cleanup = typeText(chapter.narrative, () => {
      setTimeout(() => {
        setShowInnerThought(true);
        setTimeout(() => {
          setCanProceed(true);
        }, 2000);
      }, 1000);
    });

    return cleanup;
  }, [chapter, currentChapter, showIntro, typeText, isPaused]);

  const handleNext = () => {
    if (!canProceed || isPaused) return;

    if (isLastChapter) {
      setShowFinalReveal(true);
    } else {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const handleResponse = (resp: 'yes' | 'no') => {
    setResponse(resp);
  };

  const handleStartExperience = () => {
    setShowIntro(false);
  };

  if (!generatedStory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No story to show...</p>
      </div>
    );
  }

  // Final response screen
  if (hasResponded) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <StarryBackground count={150} />
        <FallingPetals count={30} />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
          <AnimatePresence mode="wait">
            {response === 'yes' ? (
              <motion.div
                key="yes"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mb-8"
                >
                  <HeartIcon size={120} color="#C44569" filled animate />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-5xl md:text-7xl font-semibold mb-6 text-white"
                  style={{ fontFamily: 'var(--font-script)' }}
                >
                  You said Yes!
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="text-xl text-white/80 mb-8"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  This is just the beginning of our beautiful story together...
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="flex flex-wrap justify-center gap-4"
                >
                  {['💕', '✨', '💍', '🌹', '💝'].map((emoji, i) => (
                    <motion.span
                      key={i}
                      className="text-4xl"
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity,
                      }}
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 0.8 }}
                  className="text-lg text-white/60 mt-8"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  With love, {generatedStory.creatorName}
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.5, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('summary')}
                  className="mt-8 px-6 py-3 rounded-full flex items-center gap-2 mx-auto"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  <Grid size={18} />
                  View All Memories
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="no"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <HeartIcon size={80} color="#F5B7B1" filled={false} className="mb-8 mx-auto" />

                <h1
                  className="text-4xl font-semibold mb-6 text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  That&apos;s okay...
                </h1>

                <p
                  className="text-xl text-white/70 mb-8"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Some stories take more time to unfold.
                  <br />I&apos;ll always be here, whenever you&apos;re ready.
                </p>

                <p
                  className="text-lg text-white/50 mb-8"
                  style={{ fontFamily: 'var(--font-script)' }}
                >
                  With hope, {generatedStory.creatorName}
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('summary')}
                  className="px-6 py-3 rounded-full flex items-center gap-2 mx-auto"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  <Grid size={18} />
                  View All Memories
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Check if this is a romantic occasion that warrants yes/no response
  const isRomanticOccasion = generatedStory.occasion === 'valentine' || generatedStory.occasion === 'proposal';

  // Final reveal with message (and question for romantic occasions)
  if (showFinalReveal) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <StarryBackground count={150} />
        <FallingPetals count={25} />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="text-center max-w-2xl"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-8"
            >
              <HeartIcon size={80} color="#C44569" filled animate />
            </motion.div>

            {isRomanticOccasion && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-lg text-white/60 mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {generatedStory.recipientName}, I need to ask you something...
              </motion.p>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isRomanticOccasion ? 1.5 : 0.5, duration: 1 }}
              className="text-4xl md:text-6xl font-semibold mb-12 text-white leading-tight"
              style={{ fontFamily: 'var(--font-script)' }}
            >
              {generatedStory.finalMessage}
            </motion.h1>

            {isRomanticOccasion ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleResponse('yes')}
                  className="px-12 py-4 rounded-full text-xl font-medium transition-all"
                  style={{
                    background: 'var(--gradient-romantic)',
                    color: 'white',
                    fontFamily: 'var(--font-display)',
                    boxShadow: '0 0 40px rgba(196, 69, 105, 0.5)',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-6 h-6" />
                    Yes!
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleResponse('no')}
                  className="px-12 py-4 rounded-full text-xl font-medium transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontFamily: 'var(--font-display)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  Not yet...
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.5 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.p
                  className="text-lg text-white/60"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  With love, {generatedStory.creatorName}
                </motion.p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('summary')}
                    className="px-6 py-3 rounded-full text-lg font-medium transition-all flex items-center gap-2"
                    style={{
                      background: 'var(--gradient-romantic)',
                      color: 'white',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    <Grid className="w-5 h-5" />
                    View All Memories
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode('landing')}
                    className="px-6 py-3 rounded-full text-lg font-medium transition-all flex items-center gap-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    <Heart className="w-5 h-5" />
                    Home
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Intro screen
  if (showIntro) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <StarryBackground count={100} />
        <FallingPetals count={10} />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center max-w-xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="mb-8"
            >
              <HeartIcon size={60} color="#C44569" filled animate />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl text-white/70 mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Dear {generatedStory.recipientName},
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-4xl md:text-5xl font-semibold mb-6 text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Someone has created
              <br />
              <span className="text-gradient">a story for you</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="text-lg text-white/60 mb-12"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Take a deep breath, find a quiet moment,
              <br />
              and let yourself feel...
            </motion.p>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartExperience}
              className="btn-romantic text-lg animate-pulse-glow"
            >
              Begin the Journey
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              className="text-sm text-white/40 mt-8"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {generatedStory.chapters.length} chapters of memories await you
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main experience - chapter view
  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarryBackground count={80} />

      {/* Controls */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-3 rounded-full transition-all"
          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
        >
          {isPaused ? (
            <Play size={20} className="text-white" />
          ) : (
            <Pause size={20} className="text-white" />
          )}
        </button>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 rounded-full transition-all"
          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
        >
          {isMuted ? (
            <VolumeX size={20} className="text-white" />
          ) : (
            <Volume2 size={20} className="text-white" />
          )}
        </button>
      </div>

      {/* Progress indicator */}
      <div className="fixed top-6 left-6 z-50">
        <div className="flex items-center gap-2">
          {generatedStory.chapters.map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full transition-all"
              animate={{
                background:
                  index === currentChapter
                    ? 'var(--rose-primary)'
                    : index < currentChapter
                    ? 'var(--gold-primary)'
                    : 'rgba(255, 255, 255, 0.3)',
                scale: index === currentChapter ? 1.5 : 1,
              }}
            />
          ))}
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: 'rgba(255, 255, 255, 0.3)' }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <AnimatePresence mode="wait">
          {chapter && (
            <motion.div
              key={currentChapter}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="max-w-2xl w-full text-center"
            >
              {/* Chapter title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-2xl mb-2 text-white/60"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Chapter {currentChapter + 1}
              </motion.h2>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-3xl md:text-4xl font-semibold mb-8 text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {chapter.title}
              </motion.h3>

              {/* Photo if exists */}
              {chapter.memory.photo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="mb-8 flex justify-center"
                >
                  <img
                    src={chapter.memory.photo}
                    alt="Memory"
                    className="max-w-full max-h-[20rem] rounded-2xl object-contain"
                    style={{
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                    }}
                  />
                </motion.div>
              )}

              {/* Atmosphere */}
              {chapter.atmosphere && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="text-sm text-white/40 mb-6 italic"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {chapter.atmosphere}
                </motion.p>
              )}

              {/* Narrative with typing effect */}
              <div className="mb-8 min-h-[100px]">
                <p
                  className="text-xl md:text-2xl text-white/90 leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {displayedText}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-0.5 h-6 ml-1 bg-rose-primary align-middle"
                    />
                  )}
                </p>
              </div>

              {/* Inner monologue */}
              <AnimatePresence>
                {showInnerThought && chapter.innerMonologue && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8 p-6 rounded-2xl"
                    style={{ background: 'rgba(196, 69, 105, 0.15)' }}
                  >
                    <p
                      className="text-lg text-rose-light italic"
                      style={{ fontFamily: 'var(--font-script)' }}
                    >
                      &ldquo;{chapter.innerMonologue}&rdquo;
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Date & Location */}
              {(chapter.memory.date || chapter.memory.location) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showInnerThought ? 1 : 0 }}
                  className="flex items-center justify-center gap-4 text-white/40 text-sm mb-8"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {chapter.memory.date && <span>{chapter.memory.date}</span>}
                  {chapter.memory.date && chapter.memory.location && <span>•</span>}
                  {chapter.memory.location && <span>{chapter.memory.location}</span>}
                </motion.div>
              )}

              {/* Continue button */}
              <AnimatePresence>
                {canProceed && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="btn-romantic flex items-center gap-2 mx-auto"
                  >
                    {isLastChapter ? (
                      <>
                        <Heart size={20} />
                        Continue to the End
                      </>
                    ) : (
                      <>
                        Next Memory
                        <ChevronRight size={20} />
                      </>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hint for waiting */}
      {!canProceed && !isTyping && showInnerThought && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-8 left-0 right-0 text-center text-white/30 text-sm"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Take a moment to feel this memory...
        </motion.p>
      )}
    </div>
  );
}
