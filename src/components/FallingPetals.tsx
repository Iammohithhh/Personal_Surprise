'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  opacity: number;
}

export default function FallingPetals({ count = 20 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const newPetals: Petal[] = [];
    for (let i = 0; i < count; i++) {
      newPetals.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 8,
        size: 10 + Math.random() * 15,
        rotation: Math.random() * 360,
        opacity: 0.4 + Math.random() * 0.4,
      });
    }
    setPetals(newPetals);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            className="absolute"
            style={{
              left: `${petal.x}%`,
              top: '-5%',
            }}
            initial={{ y: '-10vh', rotate: 0, opacity: 0 }}
            animate={{
              y: '110vh',
              rotate: petal.rotation + 720,
              opacity: [0, petal.opacity, petal.opacity, 0],
            }}
            transition={{
              duration: petal.duration,
              delay: petal.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <svg
              width={petal.size}
              height={petal.size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C12 2 8 6 8 10C8 14 12 18 12 18C12 18 16 14 16 10C16 6 12 2 12 2Z"
                fill="#F5B7B1"
              />
              <path
                d="M12 6C12 6 9 9 9 12C9 15 12 18 12 18C12 18 15 15 15 12C15 9 12 6 12 6Z"
                fill="#C44569"
                fillOpacity="0.5"
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
