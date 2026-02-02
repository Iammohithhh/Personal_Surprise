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
  FileText,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import HeartIcon from './HeartIcon';
import { Memory, Story, StoryChapter, Occasion, RecipientType } from '@/types';

const recipientTypes = [
  { value: 'partner', label: 'Partner / Spouse', emoji: '💕' },
  { value: 'friend', label: 'Friend', emoji: '🤝' },
  { value: 'family', label: 'Family Member', emoji: '👨‍👩‍👧‍👦' },
  { value: 'parent', label: 'Parent', emoji: '👨‍👧' },
  { value: 'sibling', label: 'Sibling', emoji: '👫' },
  { value: 'grandparent', label: 'Grandparent', emoji: '👴👵' },
  { value: 'colleague', label: 'Colleague', emoji: '💼' },
  { value: 'other', label: 'Someone Special', emoji: '✨' },
];

const occasions = [
  { value: 'valentine', label: "Valentine's Day", emoji: '💕' },
  { value: 'birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'anniversary', label: 'Anniversary', emoji: '💍' },
  { value: 'wedding', label: 'Wedding', emoji: '💒' },
  { value: 'proposal', label: 'Proposal', emoji: '💎' },
  { value: 'friendship', label: 'Friendship Day', emoji: '🤝' },
  { value: 'graduation', label: 'Graduation', emoji: '🎓' },
  { value: 'mothers_day', label: "Mother's Day", emoji: '👩‍👧' },
  { value: 'fathers_day', label: "Father's Day", emoji: '👨‍👧' },
  { value: 'thank_you', label: 'Thank You', emoji: '🙏' },
  { value: 'congratulations', label: 'Congratulations', emoji: '🎉' },
  { value: 'get_well', label: 'Get Well Soon', emoji: '💐' },
  { value: 'new_year', label: 'New Year', emoji: '🎊' },
  { value: 'just_because', label: 'Just Because', emoji: '💝' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

const messageSuggestions: Record<string, string[]> = {
  partner: [
    'Will you be my Valentine?',
    'I love you more every day',
    'Will you marry me?',
    "Here's to forever with you",
  ],
  friend: [
    "Thank you for being you",
    "You're the best friend anyone could ask for",
    "Here's to our friendship",
    "I'm so grateful for you",
  ],
  family: [
    'Thank you for everything',
    "I'm so lucky to have you",
    'You mean the world to me',
    'Family forever',
  ],
  parent: [
    'Thank you for everything you do',
    "I couldn't have done it without you",
    'You inspire me every day',
    'I love you, always',
  ],
  default: [
    'Thank you for being in my life',
    'You are truly special',
    "Here's to many more memories",
    'With love and gratitude',
  ],
};

export default function CreateStory() {
  const {
    currentStory,
    setRecipientName,
    setCreatorName,
    setRecipientType,
    setOccasion,
    addMemory,
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
  const [storyStyle, setStoryStyle] = useState<'short' | 'medium' | 'none'>('short');
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

  // Memory is valid if it has at least a photo OR a note
  const isMemoryValid = () => {
    return newMemory.photo || newMemory.note;
  };

  const handleAddMemory = () => {
    if (isMemoryValid()) {
      addMemory({
        note: newMemory.note,
        photo: newMemory.photo,
        date: newMemory.date,
        location: newMemory.location,
      });
      setNewMemory({});
      setShowAddMemory(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerateStory = async () => {
    setIsGenerating(true);

    try {
      // Strip photos from memories before sending - they're huge base64 strings!
      // We'll re-attach them after getting the response
      const memoriesWithoutPhotos = (currentStory.memories || []).map(m => ({
        id: m.id,
        note: m.note,
        date: m.date,
        location: m.location,
        hasPhoto: !!m.photo, // Just indicate if there's a photo
      }));

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: currentStory.recipientName,
          creatorName: currentStory.creatorName,
          recipientType: currentStory.recipientType,
          occasion: currentStory.occasion,
          customOccasion: currentStory.customOccasion,
          memories: memoriesWithoutPhotos,
          finalMessage: currentStory.finalMessage,
          storyStyle: storyStyle,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate story');

      const story = await response.json();

      // Re-attach photos to the chapters from original memories
      const originalMemories = currentStory.memories || [];
      if (story.chapters) {
        story.chapters = story.chapters.map((chapter: StoryChapter, index: number) => ({
          ...chapter,
          memory: {
            ...chapter.memory,
            photo: originalMemories[index]?.photo,
          },
        }));
      }
      // Also update the memories array in the story
      story.memories = originalMemories;

      setGeneratedStory(story as Story);
      setViewMode('preview');
    } catch (error) {
      console.error('Error generating story:', error);
      // For demo, create a mock story
      const mockStory: Story = {
        id: Date.now().toString(),
        recipientName: currentStory.recipientName || 'Someone Special',
        creatorName: currentStory.creatorName || 'Me',
        recipientType: currentStory.recipientType || 'friend',
        occasion: currentStory.occasion || 'just_because',
        memories: currentStory.memories || [],
        chapters: (currentStory.memories || []).map((memory, index) => ({
          id: `chapter-${index}`,
          title: `Chapter ${index + 1}`,
          narrative: memory.note
            ? `There's something magical about this moment. ${memory.note}`
            : 'A picture is worth a thousand words, and this one speaks volumes about how much you mean to me.',
          memory,
          innerMonologue: "In that moment, I knew you were someone special. Someone I wanted to keep in my life forever.",
          atmosphere: memory.location || "a place that holds special meaning",
        })),
        finalMessage: currentStory.finalMessage || "Thank you for being you",
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
        return currentStory.recipientName && currentStory.creatorName && currentStory.recipientType;
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

  const getSuggestions = () => {
    const type = currentStory.recipientType || 'default';
    return messageSuggestions[type] || messageSuggestions.default;
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
              className="text-lg hidden sm:inline"
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
            {/* Step 1: Who */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-8">
                  <h2
                    className="text-3xl sm:text-4xl font-semibold mb-4"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                  >
                    Who is this surprise for?
                  </h2>
                  <p
                    className="text-lg opacity-70"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Let&apos;s personalize this experience
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Recipient Type */}
                  <div>
                    <label
                      className="block text-sm mb-3 opacity-70"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Who are they to you?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {recipientTypes.map((type) => (
                        <motion.button
                          key={type.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setRecipientType(type.value as RecipientType)}
                          className={`p-3 rounded-xl text-center transition-all ${
                            currentStory.recipientType === type.value
                              ? 'ring-2 ring-rose-primary'
                              : 'card-romantic'
                          }`}
                          style={{
                            background:
                              currentStory.recipientType === type.value
                                ? 'linear-gradient(135deg, #FDF2F0 0%, #FADBD8 100%)'
                                : 'white',
                          }}
                        >
                          <span className="text-2xl block mb-1">{type.emoji}</span>
                          <span
                            className="text-xs"
                            style={{ fontFamily: 'var(--font-body)', color: 'var(--night-deep)' }}
                          >
                            {type.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Names */}
                  <div>
                    <label
                      className="block text-sm mb-2 opacity-70"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Their name
                    </label>
                    <input
                      type="text"
                      value={currentStory.recipientName || ''}
                      onChange={(e) => setRecipientName(e.target.value)}
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
                      value={currentStory.creatorName || ''}
                      onChange={(e) => setCreatorName(e.target.value)}
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
                <div className="text-center mb-8">
                  <h2
                    className="text-3xl sm:text-4xl font-semibold mb-4"
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

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {occasions.map((occ) => (
                    <motion.button
                      key={occ.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setOccasion(occ.value as Occasion)}
                      className={`p-4 rounded-xl text-left transition-all ${
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
                      <span className="text-2xl mb-2 block">{occ.emoji}</span>
                      <span
                        className="text-sm font-medium"
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
                <div className="text-center mb-8">
                  <h2
                    className="text-3xl sm:text-4xl font-semibold mb-4"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                  >
                    Add Your Memories
                  </h2>
                  <p
                    className="text-lg opacity-70"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Each memory becomes a chapter in your story
                  </p>
                  <p
                    className="text-sm opacity-50 mt-2"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Add a photo, a note, or both - all fields are optional
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
                        {memory.photo ? (
                          <div className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img
                              src={memory.photo}
                              alt="Memory"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center"
                            style={{ background: 'var(--rose-cream)' }}
                          >
                            <FileText size={24} style={{ color: 'var(--rose-light)' }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {memory.note ? (
                            <p
                              className="text-sm mb-2 line-clamp-2"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              {memory.note}
                            </p>
                          ) : (
                            <p
                              className="text-sm mb-2 italic opacity-50"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              Photo memory
                            </p>
                          )}
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
                          onClick={() => {
                            setShowAddMemory(false);
                            setNewMemory({});
                          }}
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
                            <div className="w-full min-h-[12rem] max-h-[20rem] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                              <img
                                src={newMemory.photo}
                                alt="Memory preview"
                                className="max-w-full max-h-[20rem] object-contain"
                              />
                            </div>
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
                      <div>
                        <label
                          className="block text-xs mb-1 opacity-50"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          Write about this memory (optional)
                        </label>
                        <textarea
                          value={newMemory.note || ''}
                          onChange={(e) => setNewMemory((prev) => ({ ...prev, note: e.target.value }))}
                          placeholder="What happened? How did it make you feel?"
                          className="textarea-romantic"
                          rows={3}
                        />
                      </div>

                      {/* Date and Location */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-xs mb-1 opacity-50"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            When? (optional)
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
                            Where? (optional)
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
                        disabled={!isMemoryValid()}
                        className="btn-romantic w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Memory
                      </button>

                      {!isMemoryValid() && (
                        <p className="text-xs text-center opacity-50" style={{ fontFamily: 'var(--font-body)' }}>
                          Add at least a photo or a note
                        </p>
                      )}
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
                <div className="text-center mb-8">
                  <h2
                    className="text-3xl sm:text-4xl font-semibold mb-4"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                  >
                    Your Final Message
                  </h2>
                  <p
                    className="text-lg opacity-70"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    What do you want to say at the end?
                  </p>
                </div>

                <div className="space-y-6">
                  <textarea
                    value={currentStory.finalMessage || ''}
                    onChange={(e) => setFinalMessage(e.target.value)}
                    placeholder="Write your message..."
                    className="textarea-romantic text-center text-xl sm:text-2xl"
                    style={{ fontFamily: 'var(--font-script)', minHeight: '150px' }}
                    rows={3}
                  />

                  <div className="text-center">
                    <p
                      className="text-sm opacity-50 mb-4"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      Suggestions for {recipientTypes.find(r => r.value === currentStory.recipientType)?.label || 'your recipient'}:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {getSuggestions().map((suggestion) => (
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

                  {/* Story Style Options */}
                  <div className="card-romantic p-5 mt-6">
                    <p
                      className="text-sm font-medium mb-3"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                    >
                      How should AI write your story?
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'short', label: 'Short & Sweet', desc: 'Brief, heartfelt' },
                        { value: 'medium', label: 'Medium', desc: 'Balanced narrative' },
                        { value: 'none', label: 'My Words Only', desc: 'Use my notes as-is' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setStoryStyle(option.value as 'short' | 'medium' | 'none')}
                          className={`p-3 rounded-xl text-center transition-all ${
                            storyStyle === option.value
                              ? 'ring-2 ring-rose-primary'
                              : ''
                          }`}
                          style={{
                            background:
                              storyStyle === option.value
                                ? 'linear-gradient(135deg, #FDF2F0 0%, #FADBD8 100%)'
                                : 'var(--rose-cream)',
                          }}
                        >
                          <span
                            className="text-sm font-medium block"
                            style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                          >
                            {option.label}
                          </span>
                          <span
                            className="text-xs opacity-60"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            {option.desc}
                          </span>
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
                  Create My Surprise Story
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
