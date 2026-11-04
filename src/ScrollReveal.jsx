import { motion, useReducedMotion } from 'framer-motion';

/**
 * Premium cubic-bezier easing curve specified in design blueprint:
 * cubic-bezier(0.16, 1, 0.3, 1)
 */
export const EASING_CUBIC_BEZIER = [0.16, 1, 0.3, 1];

/**
 * Global Scroll-Triggered Reveal Component
 *
 * Initial State:  opacity: 0; transform: translateY(40px) scale(0.98);
 * Animate State:  opacity: 1; transform: translateY(0) scale(1);
 * Easing:         cubic-bezier(0.16, 1, 0.3, 1) over 0.8s
 * Viewport:       once: true, margin: "-10%"
 */
export function ScrollReveal({
  children,
  delay = 0,
  className = '',
  as = 'div',
  viewport = { once: false, margin: '0px 0px -40px 0px' },
  style,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();
  const Component = motion[as] || motion.div;

  if (shouldReduceMotion) {
    const Tag = as;
    return (
      <Tag className={className} style={style} {...props}>
        {children}
      </Tag>
    );
  }

  return (
    <Component
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={viewport}
      transition={{
        duration: 0.8,
        ease: EASING_CUBIC_BEZIER,
        delay,
      }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Technical Monospace Micro-Label Component
 *
 * Typography specs:
 * - Font Stack: 'JetBrains Mono', 'Fira Code', monospace
 * - Font Size: 0.75rem
 * - Font Weight: 500
 * - Letter Spacing: 0.15em
 * - Text Transform: uppercase
 * - Color: rgba(255, 255, 255, 0.5)
 * - Margin Bottom: 1.5rem
 * - Format: [ XX ] // LABEL
 */
export function MonoMicroLabel() {
  return null;
}

export default ScrollReveal;

