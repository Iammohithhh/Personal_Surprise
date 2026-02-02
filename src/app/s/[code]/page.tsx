'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Experience from '@/components/Experience';
import HeartIcon from '@/components/HeartIcon';
import { Story } from '@/types';

export default function SharedStoryPage() {
  const params = useParams();
  const code = params.code as string;
  const { getSharedStory, setGeneratedStory, resetExperience } = useStore();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Try to get the story from the store
    const sharedStory = getSharedStory(code);

    if (sharedStory) {
      setStory(sharedStory);
      setGeneratedStory(sharedStory);
      resetExperience();
    } else {
      setNotFound(true);
    }

    setLoading(false);
  }, [code, getSharedStory, setGeneratedStory, resetExperience]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: 'var(--gradient-night)' }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <HeartIcon size={64} color="#C44569" animate />
        </motion.div>
        <p
          className="mt-6 text-white/70"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Loading your surprise...
        </p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: 'var(--cream-white)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="card-romantic p-8 max-w-md w-full text-center"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--rose-cream)' }}
          >
            <AlertCircle size={32} style={{ color: 'var(--rose-deep)' }} />
          </div>

          <h1
            className="text-2xl font-semibold mb-3"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
          >
            Story Not Found
          </h1>

          <p
            className="opacity-70 mb-6"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            This story link may have expired or the story doesn't exist. Ask the person who sent you this link to share it again.
          </p>

          <a
            href="/"
            className="btn-romantic inline-flex items-center gap-2"
          >
            <Heart size={18} />
            Create Your Own Story
          </a>
        </motion.div>
      </div>
    );
  }

  // Show the experience
  return <Experience />;
}
