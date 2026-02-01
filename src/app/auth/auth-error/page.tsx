'use client';

import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AuthError() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--cream-white)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-romantic p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--rose-cream)' }}
        >
          <AlertCircle size={32} style={{ color: 'var(--rose-deep)' }} />
        </motion.div>

        <h1
          className="text-2xl font-semibold mb-3"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--night-deep)' }}
        >
          Authentication Error
        </h1>

        <p
          className="opacity-70 mb-6"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          We couldn't sign you in. This might be because the sign-in was cancelled or there was a technical issue.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors"
            style={{
              background: 'var(--rose-cream)',
              color: 'var(--rose-deep)',
              fontFamily: 'var(--font-display)',
            }}
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white transition-colors"
            style={{
              background: 'var(--gradient-romantic)',
              fontFamily: 'var(--font-display)',
            }}
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </motion.div>
    </div>
  );
}
