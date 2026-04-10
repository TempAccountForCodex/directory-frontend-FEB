import React from 'react';

// Passthrough mock — no animations in tests
export const motion: Record<string, React.FC<any>> = new Proxy({}, {
  get: (_target, prop: string) => {
    const MotionComponent: React.FC<any> = ({ children, ...props }) => {
      const { initial, animate, exit, transition, whileHover, whileTap, variants, ...rest } = props;
      return React.createElement(prop as keyof JSX.IntrinsicElements, rest, children);
    };
    MotionComponent.displayName = `motion.${prop}`;
    return MotionComponent;
  },
});

export const AnimatePresence: React.FC<{ children: React.ReactNode; mode?: string }> = ({ children }) => (
  <>{children}</>
);

export const useAnimation = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
  set: () => {},
});

export const useMotionValue = (initial: number) => ({ get: () => initial, set: () => {} });
export const useTransform = (_v: any, _input: any, output: any[]) => ({ get: () => output[0] });
export const useSpring = (v: any) => v;
export const useInView = () => [null, true];

export default { motion, AnimatePresence };
