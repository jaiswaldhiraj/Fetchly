'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  animate?: boolean;
  delay?: number;
}

export default function Card({
  children,
  className,
  hoverable = false,
  animate = true,
  delay = 0,
}: CardProps) {
  const Wrapper = animate ? motion.div : 'div';
  const animateProps = animate
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay, ease: 'easeOut' },
      }
    : {};

  return (
    <Wrapper
      className={cn(
        'glass-card p-6',
        hoverable && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-brand transition-all duration-200',
        className
      )}
      {...animateProps}
    >
      {children}
    </Wrapper>
  );
}
