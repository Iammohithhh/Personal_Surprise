'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Play, Share2, Heart, Eye, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import HeartIcon from './HeartIcon';

export default function Preview() {
  const { generatedStory, setViewMode, resetExperience } = useStore();

  if (!generatedStory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No story generated yet...</p>
      </div>
    );
  }

  const handleStartExperience = () => {
    resetExperience();
    setViewMode('experience');
  };

  const handleShare = async () => {
    // In a real app, this would generate a unique URL
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `A Special Story for ${generatedStory.recipientName}`,
          text: `${generatedStory.creatorName} has created something special for you...`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const getStoryTitle = () => {
    const type = generatedStory.recipientType;
    if (type === 'partner') return 'A Love Story';
    if (type === 'friend') return 'A Friendship Story';
    if (type === 'parent' || type === 'grandparent') return 'A Family Tribute';
    if (type === 'sibling') return 'A Sibling Story';
    return 'A Special Story';
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-white)' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setViewMode('create')}
            className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--rose-deep)', fontFamily: 'var(--font-display)' }}
          >
            <ArrowLeft size={20} />
            Edit Story
          </button>

          <div className="flex items-center gap-2">
            <HeartIcon size={24} color="#C44569" />
            <span
              className="text-lg"
              style={{ fontFamily: 'var(--font-script)', color: 'var(--rose-primary)' }}
            >
              Preview
            </span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:bg-rose-cream"
            style={{ color: 'var(--rose-deep)', fontFamily: 'var(--font-display)' }}
          >
            <Share2 size={18} />
            Share
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Story header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'var(--rose-cream)' }}
            >
              <Sparkles size={16} style={{ color: 'var(--gold-primary)' }} />
              <span
                className="text-sm"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--rose-deep)' }}
              >
                Your story is ready
              </span>
            </motion.div>

            <h1
              className="text-4xl md:text-5xl font-semibold mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
            >
              {getStoryTitle()} for{' '}
              <span className="text-gradient">{generatedStory.recipientName}</span>
            </h1>

            <p
              className="text-xl opacity-70"
              style={{ fontFamily: 'var(--font-script)', color: 'var(--rose-primary)' }}
            >
              Created with care by {generatedStory.creatorName}
            </p>
          </motion.div>

          {/* Story stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 mb-12"
          >
            {[
              { label: 'Chapters', value: generatedStory.chapters.length, icon: '📖' },
              { label: 'Memories', value: generatedStory.memories.length, icon: '💝' },
              {
                label: 'Occasion',
                value:
                  generatedStory.occasion === 'other'
                    ? generatedStory.customOccasion
                    : generatedStory.occasion,
                icon: '✨',
              },
            ].map((stat, index) => (
              <div key={index} className="card-romantic p-4 text-center">
                <span className="text-2xl mb-2 block">{stat.icon}</span>
                <span
                  className="text-2xl font-semibold block"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--rose-deep)' }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-sm opacity-50"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Chapter previews */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4 mb-12"
          >
            <h2
              className="text-xl font-medium mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
            >
              Story Chapters
            </h2>

            {generatedStory.chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="card-romantic p-6"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--gradient-romantic)' }}
                  >
                    <span className="text-white font-semibold">{index + 1}</span>
                  </div>

                  <div className="flex-1">
                    <h3
                      className="text-lg font-medium mb-2"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                    >
                      {chapter.title}
                    </h3>

                    <p
                      className="text-sm opacity-70 line-clamp-2 mb-2"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {chapter.narrative}
                    </p>

                    {chapter.atmosphere && (
                      <span
                        className="text-xs px-3 py-1 rounded-full inline-block"
                        style={{
                          background: 'var(--rose-cream)',
                          color: 'var(--rose-deep)',
                          fontFamily: 'var(--font-body)',
                          fontStyle: 'italic',
                        }}
                      >
                        {chapter.atmosphere}
                      </span>
                    )}
                  </div>

                  {chapter.memory.photo && (
                    <div
                      className="w-16 h-16 rounded-xl bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${chapter.memory.photo})` }}
                    />
                  )}
                </div>
              </motion.div>
            ))}

            {/* Final message preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + generatedStory.chapters.length * 0.1 }}
              className="p-6 rounded-2xl"
              style={{
                background: 'var(--gradient-romantic)',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p
                    className="text-white/70 text-sm mb-1"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    The Final Question
                  </p>
                  <p
                    className="text-white text-xl"
                    style={{ fontFamily: 'var(--font-script)' }}
                  >
                    &ldquo;{generatedStory.finalMessage}&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer with actions */}
      <footer className="fixed bottom-0 left-0 right-0 glass p-6">
        <div className="max-w-3xl mx-auto flex gap-4">
          <button
            onClick={handleStartExperience}
            className="btn-romantic flex-1 flex items-center justify-center gap-2"
          >
            <Eye size={20} />
            Preview Experience
          </button>
          <button
            onClick={handleStartExperience}
            className="btn-romantic flex-1 flex items-center justify-center gap-2"
            style={{
              background: 'var(--gradient-night)',
            }}
          >
            <Play size={20} />
            Start for {generatedStory.recipientName}
          </button>
        </div>
      </footer>
    </div>
  );
}
