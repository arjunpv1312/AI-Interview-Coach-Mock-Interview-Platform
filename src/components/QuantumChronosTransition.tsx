import React, { useEffect, useMemo, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';

export type ChronosDirection = 'forward' | 'rewind';

interface QuantumChronosTransitionProps {
  /** Monotonically incremented trigger key; increment to replay distortion */
  triggerKey: number;
  /** 'forward' = 2026 -> 5026 (+3,000 yrs), 'rewind' = 5026 -> 2026 */
  direction: ChronosDirection;
  /** Optional subtitle shown briefly inside the temporal aperture */
  label?: string;
}

interface ChronosParticle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  delay: number;
  streakLength: number;
  angleDeg: number;
  tone: 'violet' | 'amethyst' | 'silver';
}

function buildDeterministicParticles(count: number): ChronosParticle[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const particles: ChronosParticle[] = [];

  for (let i = 0; i < count; i++) {
    const t = (i + 1) / count;
    const theta = i * goldenAngle;
    const innerR = 36 + (i % 5) * 18;
    const outerR = 160 + t * 280;

    const startX = Math.cos(theta) * innerR;
    const startY = Math.sin(theta) * innerR;
    const endX = Math.cos(theta) * outerR;
    const endY = Math.sin(theta) * outerR;

    const angleDeg = (theta * 180) / Math.PI;
    const size = 2 + (i % 3);
    const delay = (i % 9) * 0.018;
    const streakLength = 12 + (i % 4) * 9;
    const tone: ChronosParticle['tone'] =
      i % 5 === 0 ? 'silver' : i % 2 === 0 ? 'violet' : 'amethyst';

    particles.push({
      id: i,
      startX,
      startY,
      endX,
      endY,
      size,
      delay,
      streakLength,
      angleDeg,
      tone,
    });
  }

  return particles;
}

export function QuantumChronosTransition({
  triggerKey,
  direction,
  label,
}: QuantumChronosTransitionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  const fromYear = direction === 'forward' ? 2026 : 5026;
  const toYear = direction === 'forward' ? 5026 : 2026;

  const yearValue = useMotionValue(fromYear);
  const roundedYear = useTransform(yearValue, (v) => Math.round(v));
  const [displayYear, setDisplayYear] = useState(toYear);

  const particles = useMemo(() => buildDeterministicParticles(38), []);

  useEffect(() => {
    const unsubscribe = roundedYear.on('change', (latest) => {
      setDisplayYear(latest);
    });
    return () => unsubscribe();
  }, [roundedYear]);

  useEffect(() => {
    if (triggerKey <= 0 || prefersReducedMotion) {
      setVisible(false);
      setDisplayYear(toYear);
      return;
    }

    setVisible(true);
    yearValue.set(fromYear);

    const controls = animate(yearValue, toYear, {
      duration: 0.62,
      ease: [0.16, 1, 0.3, 1],
    });

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 760);

    return () => {
      controls.stop();
      window.clearTimeout(hideTimer);
    };
  }, [triggerKey, direction, fromYear, toYear, prefersReducedMotion, yearValue]);

  if (prefersReducedMotion) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`chronos-${triggerKey}-${direction}`}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center overflow-hidden"
        >
          {/* Radial temporal field wash */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: [0, 0.55, 0], scale: [0.85, 1.15, 1.35] }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="absolute w-[640px] h-[640px] rounded-full bg-radial from-violet-600/25 via-purple-500/10 to-transparent blur-2xl"
          />

          {/* Concentric temporal distortion wavefronts */}
          {[0, 1, 2].map((ringIdx) => {
            const initialScale =
              direction === 'forward' ? 0.35 + ringIdx * 0.12 : 1.55 - ringIdx * 0.15;
            const targetScale =
              direction === 'forward' ? 1.55 + ringIdx * 0.25 : 0.3 + ringIdx * 0.1;

            return (
              <motion.div
                key={ringIdx}
                initial={{
                  scale: initialScale,
                  opacity: 0,
                  rotate: direction === 'forward' ? -18 : 18,
                }}
                animate={{
                  scale: targetScale,
                  opacity: [0, 0.75 - ringIdx * 0.18, 0],
                  rotate: direction === 'forward' ? 24 : -24,
                }}
                transition={{
                  duration: 0.68,
                  delay: ringIdx * 0.055,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute w-72 h-72 rounded-full border border-violet-500/45 dark:border-violet-400/50"
              />
            );
          })}

          {/* Particle distortion field (radial warp streaks) */}
          <div className="relative w-0 h-0">
            {particles.map((p) => {
              const originX = direction === 'forward' ? p.startX : p.endX;
              const originY = direction === 'forward' ? p.startY : p.endY;
              const targetX = direction === 'forward' ? p.endX : p.startX;
              const targetY = direction === 'forward' ? p.endY : p.startY;

              const colorClass =
                p.tone === 'silver'
                  ? 'bg-[#362f47] dark:bg-violet-200'
                  : p.tone === 'violet'
                    ? 'bg-violet-600 dark:bg-violet-400'
                    : 'bg-purple-600 dark:bg-purple-300';

              return (
                <motion.span
                  key={p.id}
                  initial={{
                    x: originX,
                    y: originY,
                    scaleX: 0.5,
                    opacity: 0,
                    rotate: p.angleDeg,
                  }}
                  animate={{
                    x: targetX,
                    y: targetY,
                    scaleX: [0.6, 2.4, 0.4],
                    opacity: [0, 0.95, 0],
                    rotate: p.angleDeg + (direction === 'forward' ? 14 : -14),
                  }}
                  transition={{
                    duration: 0.64,
                    delay: p.delay,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    width: `${p.streakLength}px`,
                    height: `${p.size}px`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${colorClass}`}
                />
              );
            })}
          </div>

          {/* Quantum Chronos Year Aperture Readout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, filter: 'blur(6px)' }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.88, 1, 1, 1.04],
              filter: ['blur(6px)', 'blur(0px)', 'blur(0px)', 'blur(4px)'],
            }}
            transition={{
              duration: 0.72,
              times: [0, 0.22, 0.72, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex flex-col items-center justify-center px-6 py-3.5 rounded-2xl bg-white/90 dark:bg-black/90 border border-violet-500/45 shadow-2xl shadow-violet-500/20 backdrop-blur-md"
          >
            <span className="text-[11px] font-medium tracking-wide text-[#5a5170] dark:text-[#a69cbe]">
              {label ||
                (direction === 'forward'
                  ? 'Quantum Chronos · Shifting +3,000 Years'
                  : 'Quantum Chronos · Returning to 2026 Baseline')}
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight text-violet-700 dark:text-violet-300 mt-0.5">
              Year {displayYear}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
