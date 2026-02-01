'use client';

import { motion } from 'framer-motion';
import { Heart, Sparkles, Gift, Stars, Users, PartyPopper } from 'lucide-react';
import { useStore } from '@/store/useStore';
import HeartIcon from './HeartIcon';
import FallingPetals from './FallingPetals';
import AuthButton from './AuthButton';

export default function Landing() {
  const { setViewMode, user } = useStore();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top, #FDF2F0 0%, #FADBD8 30%, #F5B7B1 60%, #FFFAF8 100%)',
        }}
      />

      {/* Decorative circles */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20"
        style={{ background: 'var(--rose-primary)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'var(--gold-primary)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <FallingPetals count={15} />

      {/* Header with Auth */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartIcon size={28} animate color="#8B1E3F" />
            <span
              className="text-lg sm:text-xl tracking-wide"
              style={{ fontFamily: 'var(--font-script)', color: 'var(--rose-deep)' }}
            >
              Surprise Story
            </span>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-24">
        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(212, 175, 55, 0.15)' }}
          >
            <Sparkles size={16} style={{ color: 'var(--gold-primary)' }} />
            <span
              className="text-sm"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-deep)' }}
            >
              Create memories that last forever
            </span>
          </motion.div>

          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-semibold mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
          >
            Surprise Someone{' '}
            <span className="text-gradient">Special</span>
          </h1>

          <p
            className="text-lg sm:text-xl md:text-2xl mb-12 leading-relaxed opacity-80"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--night-primary)' }}
          >
            Transform your cherished memories into a beautiful, interactive story
            <br className="hidden md:block" />
            for your partner, friends, family, or anyone you care about.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setViewMode('create')}
            className="btn-romantic text-lg flex items-center justify-center gap-3"
          >
            <Sparkles size={20} />
            Create a Surprise
            <Heart size={20} />
          </motion.button>

          {user && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode('dashboard')}
              className="px-6 py-3 rounded-full text-lg flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'white',
                color: 'var(--rose-deep)',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 4px 20px rgba(139, 30, 63, 0.15)',
              }}
            >
              My Stories
            </motion.button>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full"
        >
          {[
            {
              icon: <Heart className="w-8 h-8" style={{ color: 'var(--rose-primary)' }} />,
              title: 'Add Your Memories',
              description: 'Upload photos and write notes about your special moments together',
            },
            {
              icon: <Stars className="w-8 h-8" style={{ color: 'var(--gold-primary)' }} />,
              title: 'AI Crafts Your Story',
              description: 'Our AI transforms your memories into a beautifully written narrative',
            },
            {
              icon: <Gift className="w-8 h-8" style={{ color: 'var(--rose-deep)' }} />,
              title: 'Share the Surprise',
              description: 'Send a magical, interactive experience to someone special',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              className="card-romantic p-6 text-center"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
              >
                {feature.title}
              </h3>
              <p
                className="text-sm opacity-70"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--night-primary)' }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Who it's for */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mt-16 text-center"
        >
          <p
            className="text-sm tracking-widest uppercase opacity-50 mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Perfect for
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { icon: '💕', text: 'Partners' },
              { icon: '👨‍👩‍👧‍👦', text: 'Family' },
              { icon: '🤝', text: 'Friends' },
              { icon: '👴👵', text: 'Grandparents' },
              { icon: '🎓', text: 'Graduates' },
              { icon: '💼', text: 'Colleagues' },
            ].map((item) => (
              <span
                key={item.text}
                className="px-4 py-2 rounded-full text-sm flex items-center gap-2"
                style={{
                  background: 'rgba(196, 69, 105, 0.1)',
                  color: 'var(--rose-deep)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span>{item.icon}</span>
                {item.text}
              </span>
            ))}
          </div>

          <p
            className="text-sm tracking-widest uppercase opacity-50 mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            For any occasion
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Valentine's Day",
              'Birthdays',
              'Anniversaries',
              'Weddings',
              'Graduations',
              "Mother's Day",
              "Father's Day",
              'Thank You',
              'Just Because',
            ].map((occasion) => (
              <span
                key={occasion}
                className="px-4 py-2 rounded-full text-sm"
                style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  color: 'var(--gold-deep)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {occasion}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Sign in prompt for non-logged users */}
        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="mt-12 text-center"
          >
            <p
              className="text-sm opacity-60"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--night-primary)' }}
            >
              Sign in to save your stories and access them anytime
            </p>
          </motion.div>
        )}
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L48 105C96 90 192 60 288 45C384 30 480 30 576 37.5C672 45 768 60 864 67.5C960 75 1056 75 1152 67.5C1248 60 1344 45 1392 37.5L1440 30V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="#FFFAF8"
          />
        </svg>
      </div>
    </div>
  );
}
