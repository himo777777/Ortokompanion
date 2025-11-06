'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, CheckCircle, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { SocialstyrelsensGoal } from '@/data/focused-socialstyrelsen-goals';

interface GoalAchievementCelebrationProps {
  goal: SocialstyrelsensGoal;
  isOpen: boolean;
  onClose: () => void;
}

export function GoalAchievementCelebration({
  goal,
  isOpen,
  onClose,
}: GoalAchievementCelebrationProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti!
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Trophy icon with animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="p-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full relative">
                  <Trophy className="w-16 h-16 text-white" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-8 h-8 text-yellow-300" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Celebration text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Grattis! 🎉
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  Du har nått ett nytt kompetensmål!
                </p>
              </motion.div>

              {/* Achievement details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 mt-4">
                  <p className="text-xs text-gray-600 mb-1">Kompetensområde</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {goal.competencyArea.replace('-', ' ')}
                  </p>
                </div>
              </motion.div>

              {/* XP gained */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="flex items-center justify-center gap-3 mb-6 py-4 bg-yellow-50 rounded-xl"
              >
                <Star className="w-6 h-6 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-900">
                  +500 XP
                </span>
                <Star className="w-6 h-6 text-yellow-600" />
              </motion.div>

              {/* CTA button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Fortsätt träna! →
              </motion.button>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: -100,
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${20 + i * 12}%`,
                    bottom: '10%',
                  }}
                >
                  <Star className="w-4 h-4 text-yellow-400" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
