'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Calendar, MapPin, Share2, Home } from 'lucide-react';
import { useStore } from '@/store/useStore';
import HeartIcon from './HeartIcon';

export default function Summary() {
  const { generatedStory, setViewMode } = useStore();

  if (!generatedStory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No story to summarize...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-white)' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setViewMode('landing')}
            className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--rose-deep)', fontFamily: 'var(--font-display)' }}
          >
            <Home size={20} />
            Home
          </button>

          <div className="flex items-center gap-2">
            <HeartIcon size={24} color="#C44569" />
            <span
              className="text-lg"
              style={{ fontFamily: 'var(--font-script)', color: 'var(--rose-primary)' }}
            >
              Memory Collection
            </span>
          </div>

          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Story header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1
              className="text-3xl md:text-4xl font-semibold mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
            >
              Our Memory Collection
            </h1>
            <p
              className="text-lg opacity-70"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {generatedStory.chapters.length} precious memories for {generatedStory.recipientName}
            </p>
            <p
              className="text-md opacity-50 mt-2"
              style={{ fontFamily: 'var(--font-script)', color: 'var(--rose-primary)' }}
            >
              Created by {generatedStory.creatorName}
            </p>
          </motion.div>

          {/* Memories grid */}
          <div className="space-y-8">
            {generatedStory.chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-romantic overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  {chapter.memory.photo ? (
                    <div className="md:w-1/3 flex-shrink-0">
                      <img
                        src={chapter.memory.photo}
                        alt={`Memory ${index + 1}`}
                        className="w-full h-48 md:h-full object-contain bg-gray-100"
                      />
                    </div>
                  ) : (
                    <div
                      className="md:w-1/3 flex-shrink-0 h-48 md:h-auto flex items-center justify-center"
                      style={{ background: 'var(--rose-cream)' }}
                    >
                      <Heart size={48} style={{ color: 'var(--rose-light)' }} />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ background: 'var(--gradient-romantic)' }}
                      >
                        {index + 1}
                      </span>
                      <h2
                        className="text-xl font-medium"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                      >
                        {chapter.title}
                      </h2>
                    </div>

                    <p
                      className="text-base opacity-80 mb-4"
                      style={{ fontFamily: 'var(--font-body)', lineHeight: 1.7 }}
                    >
                      {chapter.narrative}
                    </p>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-3 text-sm opacity-60">
                      {chapter.memory.date && (
                        <span
                          className="flex items-center gap-1"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          <Calendar size={14} />
                          {chapter.memory.date}
                        </span>
                      )}
                      {chapter.memory.location && (
                        <span
                          className="flex items-center gap-1"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          <MapPin size={14} />
                          {chapter.memory.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Final message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: generatedStory.chapters.length * 0.1 }}
            className="mt-12 p-8 rounded-2xl text-center"
            style={{ background: 'var(--gradient-romantic)' }}
          >
            <HeartIcon size={48} color="white" filled className="mx-auto mb-4" />
            <p
              className="text-2xl md:text-3xl text-white font-medium"
              style={{ fontFamily: 'var(--font-script)' }}
            >
              &ldquo;{generatedStory.finalMessage}&rdquo;
            </p>
            <p
              className="text-white/70 mt-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              — {generatedStory.creatorName}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => setViewMode('experience')}
              className="btn-romantic flex items-center justify-center gap-2"
            >
              <Heart size={20} />
              Replay Experience
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className="px-6 py-3 rounded-full flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'white',
                color: 'var(--rose-deep)',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 4px 20px rgba(139, 30, 63, 0.15)',
              }}
            >
              <Share2 size={18} />
              Share Story
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
