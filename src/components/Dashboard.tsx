'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Eye, Edit3, Heart, Calendar, User, Gift } from 'lucide-react';
import { useStore } from '@/store/useStore';
import HeartIcon from './HeartIcon';
import { Story, Occasion, RecipientType } from '@/types';
import { useState } from 'react';

const occasionLabels: Record<Occasion, string> = {
  valentine: "Valentine's Day",
  anniversary: 'Anniversary',
  birthday: 'Birthday',
  wedding: 'Wedding',
  proposal: 'Proposal',
  friendship: 'Friendship Day',
  graduation: 'Graduation',
  thank_you: 'Thank You',
  congratulations: 'Congratulations',
  get_well: 'Get Well',
  new_year: 'New Year',
  mothers_day: "Mother's Day",
  fathers_day: "Father's Day",
  just_because: 'Just Because',
  other: 'Other',
};

const recipientTypeLabels: Record<RecipientType, string> = {
  partner: 'Partner',
  friend: 'Friend',
  family: 'Family',
  parent: 'Parent',
  sibling: 'Sibling',
  grandparent: 'Grandparent',
  colleague: 'Colleague',
  other: 'Someone Special',
};

const recipientTypeEmoji: Record<RecipientType, string> = {
  partner: '💕',
  friend: '🤝',
  family: '👨‍👩‍👧‍👦',
  parent: '❤️',
  sibling: '👫',
  grandparent: '🌸',
  colleague: '🤝',
  other: '✨',
};

export default function Dashboard() {
  const {
    user,
    savedStories,
    removeSavedStory,
    loadStoryForEdit,
    setViewMode,
    setGeneratedStory,
    resetExperience,
  } = useStore();

  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);

  const handleCreateNew = () => {
    setViewMode('create');
  };

  const handleViewStory = (story: Story) => {
    setGeneratedStory(story);
    resetExperience();
    setViewMode('experience');
  };

  const handleEditStory = (story: Story) => {
    loadStoryForEdit(story);
  };

  const handleDeleteStory = (id: string) => {
    removeSavedStory(id);
    setStoryToDelete(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-white)' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setViewMode('landing')}
            className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--rose-deep)', fontFamily: 'var(--font-display)' }}
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <HeartIcon size={24} color="#C44569" />
            <span
              className="text-lg"
              style={{ fontFamily: 'var(--font-script)', color: 'var(--rose-primary)' }}
            >
              My Stories
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
            style={{
              background: 'var(--gradient-romantic)',
              color: 'white',
              fontFamily: 'var(--font-display)',
            }}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Create New</span>
          </motion.button>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1
              className="text-3xl md:text-4xl font-semibold mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
            >
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h1>
            <p
              className="text-lg opacity-60"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {savedStories.length === 0
                ? "You haven't created any stories yet. Start your first one!"
                : `You have ${savedStories.length} ${savedStories.length === 1 ? 'story' : 'stories'} saved.`}
            </p>
          </motion.div>

          {/* Stories grid */}
          {savedStories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-romantic p-12 text-center"
            >
              <Gift
                size={64}
                className="mx-auto mb-6 opacity-30"
                style={{ color: 'var(--rose-primary)' }}
              />
              <h2
                className="text-2xl font-medium mb-4"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
              >
                No stories yet
              </h2>
              <p
                className="text-lg opacity-60 mb-8 max-w-md mx-auto"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Create your first surprise story and make someone's day special!
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateNew}
                className="btn-romantic inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Your First Story
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {savedStories.map((story, index) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-romantic overflow-hidden group"
                  >
                    {/* Story preview image or gradient */}
                    <div
                      className="h-32 relative"
                      style={{
                        background: story.memories[0]?.photo
                          ? `url(${story.memories[0].photo}) center/cover`
                          : 'var(--gradient-romantic)',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <span
                          className="text-white text-sm flex items-center gap-1"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          <span>{recipientTypeEmoji[story.recipientType]}</span>
                          {recipientTypeLabels[story.recipientType]}
                        </span>
                        <span
                          className="text-white/80 text-xs px-2 py-1 rounded-full"
                          style={{ background: 'rgba(0,0,0,0.3)' }}
                        >
                          {story.chapters?.length || story.memories.length} chapters
                        </span>
                      </div>
                    </div>

                    {/* Story info */}
                    <div className="p-4">
                      <h3
                        className="text-lg font-medium mb-1 truncate"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
                      >
                        For {story.recipientName}
                      </h3>
                      <div
                        className="flex items-center gap-2 text-sm opacity-60 mb-3"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        <Calendar size={14} />
                        <span>{formatDate(story.createdAt)}</span>
                        <span>•</span>
                        <span>{occasionLabels[story.occasion]}</span>
                      </div>

                      {story.finalMessage && (
                        <p
                          className="text-sm opacity-70 line-clamp-2 mb-4 italic"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          "{story.finalMessage}"
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewStory(story)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors"
                          style={{
                            background: 'var(--rose-cream)',
                            color: 'var(--rose-deep)',
                            fontFamily: 'var(--font-display)',
                          }}
                        >
                          <Eye size={16} />
                          View
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditStory(story)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors"
                          style={{
                            background: 'var(--rose-blush)',
                            color: 'var(--rose-deep)',
                            fontFamily: 'var(--font-display)',
                          }}
                        >
                          <Edit3 size={16} />
                          Edit
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setStoryToDelete(story.id)}
                          className="p-2 rounded-lg transition-colors hover:bg-red-50"
                          style={{ color: '#e74c3c' }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add new story card */}
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: savedStories.length * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateNew}
                className="card-romantic p-8 flex flex-col items-center justify-center gap-4 min-h-[280px] border-2 border-dashed transition-colors hover:border-rose-primary"
                style={{ borderColor: 'var(--rose-blush)' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--rose-cream)' }}
                >
                  <Plus size={32} style={{ color: 'var(--rose-primary)' }} />
                </div>
                <span
                  className="text-lg"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--rose-deep)' }}
                >
                  Create New Story
                </span>
              </motion.button>
            </div>
          )}
        </div>
      </main>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {storyToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setStoryToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-xl font-medium mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
              >
                Delete Story?
              </h3>
              <p
                className="text-sm opacity-70 mb-6"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                This action cannot be undone. The story and all its memories will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStoryToDelete(null)}
                  className="flex-1 px-4 py-3 rounded-xl transition-colors"
                  style={{
                    background: 'var(--rose-cream)',
                    color: 'var(--night-deep)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteStory(storyToDelete)}
                  className="flex-1 px-4 py-3 rounded-xl text-white transition-colors"
                  style={{
                    background: '#e74c3c',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
