'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Heart,
  Sparkles,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import HeartIcon from './HeartIcon';
import { Memory, LoveStory } from '@/types';

const occasions = [
  { value: 'valentine', label: "Valentine's Day", emoji: '💕' },
  { value: 'anniversary', label: 'Anniversary', emoji: '💍' },
  { value: 'birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'wedding', label: 'Wedding', emoji: '💒' },
  { value: 'proposal', label: 'Proposal', emoji: '💎' },
  { value: 'other', label: 'Other Special Day', emoji: '✨' },
];

export default function CreateStory() {
  const {
    currentStory,
    setPartnerName,
    setYourName,
    setOccasion,
    addMemory,
    updateMemory,
    removeMemory,
    setFinalMessage,
    setViewMode,
    setGeneratedStory,
    setIsGenerating,
    isGenerating,
  } = useStore();

  const [step, setStep] = useState(1);
  const [newMemory, setNewMemory] = useState<Partial<Memory>>({});
  const [showAddMemory, setShowAddMemory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMemory((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAddMemory = () => {
    if (newMemory.note) {
      addMemory({
        note: newMemory.note,
        photo: newMemory.photo,
        date: newMemory.date,
        location: newMemory.location,
      });
      setNewMemory({});
      setShowAddMemory(false);
    }
  };

  const handleGenerateStory = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: currentStory.partnerName,
          yourName: currentStory.yourName,
          occasion: currentStory.occasion,
          customOccasion: currentStory.customOccasion,
          memories: currentStory.memories,
          finalMessage: currentStory.finalMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate story');

      const story = await response.json();
      setGeneratedStory(story as LoveStory);
      setViewMode('preview');
    } catch (error) {
      console.error('Error generating story:', error);
      // For demo, create a mock story
      const mockStory: LoveStory = {
        id: Date.now().toString(),
        partnerName: currentStory.partnerName || 'My Love',
        yourName: currentStory.yourName || 'Me',
        occasion: currentStory.occasion || 'valentine',
        memories: currentStory.memories || [],
        chapters: (currentStory.memories || []).map((memory, index) => ({
          id: `chapter-${index}`,
          title: `Chapter ${index + 1}`,
          narrative: `There's something magical about the way we met, the way we grew, the way we loved. ${memory.note}`,
          memory,
          innerMonologue: "In that moment, I knew you were someone special. Someone I wanted to keep in my life forever.",
          atmosphere: memory.location || "somewhere that would become our special place",
        })),
        finalMessage: currentStory.finalMessage || "Will you be my Valentine?",
        createdAt: new Date(),
      };
      setGeneratedStory(mockStory);
      setViewMode('preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return currentStory.partnerName && currentStory.yourName;
      case 2:
        return currentStory.occasion;
      case 3:
        return currentStory.memories && currentStory.memories.length > 0;
      case 4:
        return currentStory.finalMessage;
      default:
        return false;
    }
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--cream-white)' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : setViewMode('landing'))}
            className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--rose-deep)', fontFamily: 'var(--font-display)' }}
          >
            <ArrowLeft size={20} />
            {step > 1 ? 'Back' : 'Home'}
          </button>

          <div className="flex items-center gap-2">
            <HeartIcon size={24} color="#C44569" />
            <span
              className="text-lg"
              style={{ fontFamily: 'var(--font-script)', color: 'var(--rose-primary)' }}
            >
              Creating Magic
            </span>
          </div>

          <span
            className="text-sm opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Step {step} of {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="progress-romantic">
          <motion.div
            className="progress-romantic-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-32 px-6">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Names */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-12">
                  <h2
                    className="text-4xl font-semibold mb-4"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                  >
                    Who is this story for?
                  </h2>
                  <p
                    className="text-lg opacity-70"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Let&apos;s personalize this beautiful journey
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label
                      className="block text-sm mb-2 opacity-70"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Your partner&apos;s name
                    </label>
                    <input
                      type="text"
                      value={currentStory.partnerName || ''}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Enter their name..."
                      className="input-romantic"
                    />
                  </div>

                  <div className="divider-romantic">
                    <Heart size={16} />
                  </div>

                  <div>
                    <label
                      className="block text-sm mb-2 opacity-70"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Your name
                    </label>
                    <input
                      type="text"
                      value={currentStory.yourName || ''}
                      onChange={(e) => setYourName(e.target.value)}
                      placeholder="Enter your name..."
                      className="input-romantic"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Occasion */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-12">
                  <h2
                    className="text-4xl font-semibold mb-4"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                  >
                    What&apos;s the occasion?
                  </h2>
                  <p
                    className="text-lg opacity-70"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Choose the perfect moment for your surprise
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {occasions.map((occ) => (
                    <motion.button
                      key={occ.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setOccasion(occ.value as LoveStory['occasion'])}
                      className={`p-6 rounded-2xl text-left transition-all ${
                        currentStory.occasion === occ.value
                          ? 'ring-2 ring-rose-primary shadow-lg'
                          : 'card-romantic'
                      }`}
                      style={{
                        background:
                          currentStory.occasion === occ.value
                            ? 'linear-gradient(135deg, #FDF2F0 0%, #FADBD8 100%)'
                            : 'white',
                      }}
                    >
                      <span className="text-3xl mb-3 block">{occ.emoji}</span>
                      <span
                        className="font-medium"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                      >
                        {occ.label}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {currentStory.occasion === 'other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6"
                  >
                    <input
                      type="text"
                      value={currentStory.customOccasion || ''}
                      onChange={(e) => setOccasion('other', e.target.value)}
                      placeholder="What special day is it?"
                      className="input-romantic"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 3: Memories */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-12">
                  <h2
                    className="text-4xl font-semibold mb-4"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                  >
                    Add Your Memories
                  </h2>
                  <p
                    className="text-lg opacity-70"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Each memory becomes a chapter in your love story
                  </p>
                </div>

                {/* Memory list */}
                <div className="space-y-4 mb-8">
                  <AnimatePresence>
                    {(currentStory.memories || []).map((memory, index) => (
                      <motion.div
                        key={memory.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="card-romantic p-4 flex gap-4"
                      >
                        {memory.photo && (
                          <div
                            className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0"
                            style={{ backgroundImage: `url(${memory.photo})` }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm mb-2 line-clamp-2"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            {memory.note}
                          </p>
                          <div className="flex items-center gap-4 text-xs opacity-50">
                            {memory.date && (
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {memory.date}
                              </span>
                            )}
                            {memory.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {memory.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeMemory(memory.id)}
                          className="p-2 opacity-50 hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--rose-primary)' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Add memory form */}
                <AnimatePresence>
                  {showAddMemory ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="card-romantic p-6 space-y-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3
                          className="font-medium"
                          style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                        >
                          New Memory
                        </h3>
                        <button
                          onClick={() => setShowAddMemory(false)}
                          className="p-1 opacity-50 hover:opacity-100"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* Photo upload */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        {newMemory.photo ? (
                          <div className="relative">
                            <div
                              className="w-full h-48 rounded-xl bg-cover bg-center"
                              style={{ backgroundImage: `url(${newMemory.photo})` }}
                            />
                            <button
                              onClick={() => setNewMemory((prev) => ({ ...prev, photo: undefined }))}
                              className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors hover:border-rose-primary"
                            style={{ borderColor: 'var(--rose-light)' }}
                          >
                            <ImageIcon size={24} style={{ color: 'var(--rose-light)' }} />
                            <span
                              className="text-sm opacity-50"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              Add a photo (optional)
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Note */}
                      <textarea
                        value={newMemory.note || ''}
                        onChange={(e) => setNewMemory((prev) => ({ ...prev, note: e.target.value }))}
                        placeholder="Write about this memory... What happened? How did it make you feel?"
                        className="textarea-romantic"
                        rows={4}
                      />

                      {/* Date and Location */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-xs mb-1 opacity-50"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            When was this?
                          </label>
                          <input
                            type="text"
                            value={newMemory.date || ''}
                            onChange={(e) =>
                              setNewMemory((prev) => ({ ...prev, date: e.target.value }))
                            }
                            placeholder="e.g., Summer 2024"
                            className="input-romantic text-sm"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-xs mb-1 opacity-50"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            Where?
                          </label>
                          <input
                            type="text"
                            value={newMemory.location || ''}
                            onChange={(e) =>
                              setNewMemory((prev) => ({ ...prev, location: e.target.value }))
                            }
                            placeholder="e.g., Paris"
                            className="input-romantic text-sm"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleAddMemory}
                        disabled={!newMemory.note}
                        className="btn-romantic w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Memory
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setShowAddMemory(true)}
                      className="w-full p-6 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all hover:border-rose-primary hover:bg-rose-cream/30"
                      style={{ borderColor: 'var(--rose-light)' }}
                    >
                      <Plus size={24} style={{ color: 'var(--rose-primary)' }} />
                      <span
                        className="font-medium"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--rose-primary)' }}
                      >
                        Add a Memory
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Step 4: Final Message */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-12">
                  <h2
                    className="text-4xl font-semibold mb-4"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                  >
                    The Big Question
                  </h2>
                  <p
                    className="text-lg opacity-70"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    What do you want to ask at the end of the story?
                  </p>
                </div>

                <div className="space-y-6">
                  <textarea
                    value={currentStory.finalMessage || ''}
                    onChange={(e) => setFinalMessage(e.target.value)}
                    placeholder="Will you be my Valentine?"
                    className="textarea-romantic text-center text-2xl"
                    style={{ fontFamily: 'var(--font-script)', minHeight: '150px' }}
                    rows={3}
                  />

                  <div className="text-center">
                    <p
                      className="text-sm opacity-50 mb-4"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Quick suggestions:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        'Will you be my Valentine?',
                        'Will you marry me?',
                        'I love you, forever and always',
                        "Here's to another year of us",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setFinalMessage(suggestion)}
                          className="px-4 py-2 rounded-full text-sm transition-all hover:bg-rose-blush"
                          style={{
                            background: 'var(--rose-cream)',
                            fontFamily: 'var(--font-body)',
                            color: 'var(--rose-deep)',
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer with CTA */}
      <footer className="fixed bottom-0 left-0 right-0 glass p-6">
        <div className="max-w-2xl mx-auto">
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="btn-romantic w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleGenerateStory}
              disabled={!canProceed() || isGenerating}
              className="btn-romantic w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles size={20} />
                  </motion.div>
                  Creating Your Story...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Create My Love Story
                  <Heart size={20} />
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
