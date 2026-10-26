import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from './useReducedMotion';

/**
 * Fades up every [data-reveal] element inside `root` as it scrolls into view.
 * Uses IntersectionObserver instead of ScrollTrigger to keep the bundle small.
 */
export function useReveal(root: RefObject<HTMLElement>): void {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target);
        if (!visible.length) return;
        gsap.to(visible, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 });
        visible.forEach((t) => io.unobserve(t));
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [root]);
}
