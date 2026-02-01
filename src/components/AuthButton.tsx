'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, User, ChevronDown, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

export default function AuthButton() {
  const { user, isAuthLoading, setViewMode } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error('Login error:', error);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setShowDropdown(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-rose-cream animate-pulse" />
    );
  }

  if (!user) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGoogleLogin}
        disabled={isLoggingIn}
        className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
        style={{
          background: 'white',
          color: 'var(--rose-deep)',
          fontFamily: 'var(--font-display)',
          boxShadow: '0 2px 10px rgba(139, 30, 63, 0.1)',
        }}
      >
        {isLoggingIn ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-rose-light border-t-rose-primary rounded-full"
          />
        ) : (
          <>
            <LogIn size={18} />
            <span className="hidden sm:inline">Sign in</span>
          </>
        )}
      </motion.button>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-full transition-all"
        style={{
          background: 'white',
          color: 'var(--rose-deep)',
          fontFamily: 'var(--font-display)',
          boxShadow: '0 2px 10px rgba(139, 30, 63, 0.1)',
        }}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || 'User'}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'var(--rose-cream)' }}
          >
            <User size={16} style={{ color: 'var(--rose-primary)' }} />
          </div>
        )}
        <span className="hidden sm:inline text-sm max-w-[100px] truncate">
          {user.name || user.email.split('@')[0]}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50"
              style={{
                background: 'white',
                boxShadow: '0 10px 40px rgba(139, 30, 63, 0.15)',
              }}
            >
              <div className="p-3 border-b" style={{ borderColor: 'var(--rose-blush)' }}>
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--night-deep)', fontFamily: 'var(--font-display)' }}
                >
                  {user.name || 'User'}
                </p>
                <p
                  className="text-xs truncate opacity-60"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {user.email}
                </p>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setViewMode('dashboard');
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors hover:bg-rose-cream"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <LayoutDashboard size={16} style={{ color: 'var(--rose-primary)' }} />
                  <span style={{ color: 'var(--night-deep)' }}>My Stories</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors hover:bg-rose-cream"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <LogOut size={16} style={{ color: 'var(--rose-primary)' }} />
                  <span style={{ color: 'var(--night-deep)' }}>Sign out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
