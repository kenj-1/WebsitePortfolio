import { useEffect, useRef } from 'react';

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

/**
 * Pointer-driven 3D tilt + specular glare for a card.
 *
 * - Pointer coordinates are only stored on move; all maths and DOM writes happen once per
 *   `requestAnimationFrame` (no React state, no per-move layout reads).
 * - DOM reads (`getBoundingClientRect`) are cached and only repeated after resize/scroll/observer
 *   invalidation; reads and writes are separated inside the frame.
 * - An `IntersectionObserver` attaches the pointer/scroll/resize listeners only while the card is
 *   in (or near) the viewport and detaches them when it scrolls away.
 * - Writes CSS custom properties on `surfaceRef`:
 *     --project-card-tilt-x / --project-card-tilt-y / --project-card-lift
 *     --tilt-progress (0–1 hover engagement, used for translateZ depth and glare strength)
 *     --tilt-glare-x / --tilt-glare-y (highlight position, opposite to the cursor)
 *   and toggles `data-tilting` on `cardRef` only when engagement starts/ends.
 * - Angles are capped at 3° and lift at 3 px; disabled for reduced motion, coarse pointers,
 *   hidden tabs, the global effects-off setting, and keyboard (focus-visible) interaction.
 */
export default function useProjectCardMotion({
  enabled = true,
  suspended = false,
  intensity = 2.5,
  lift = 3,
} = {}) {
  const cardRef = useRef(null);
  const surfaceRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const surface = surfaceRef.current;
    if (!card || !surface) return undefined;

    const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const maxAngle = clamp(Number(intensity) || 0, 0, 3);
    const maxLift = clamp(Number(lift) || 0, 0, 3);
    const hasObserver = typeof IntersectionObserver !== 'undefined';
    const motion = {
      frame: 0,
      lastFrame: 0,
      rect: null,
      needsMeasure: true,
      inView: !hasObserver,
      attached: false,
      tilting: false,
      pointerInside: false,
      keyboardFocus: false,
      pointerX: 0,
      pointerY: 0,
      x: 0,
      y: 0,
      lift: 0,
      progress: 0,
      glareX: 50,
      glareY: 50,
      targetX: 0,
      targetY: 0,
      targetLift: 0,
      targetProgress: 0,
      targetGlareX: 50,
      targetGlareY: 50,
    };

    const allowed = () =>
      enabled &&
      !suspended &&
      motion.inView &&
      !document.hidden &&
      Boolean(finePointer?.matches) &&
      !reducedMotion?.matches;

    // DOM write phase.
    const write = () => {
      surface.style.setProperty('--project-card-tilt-x', `${motion.x.toFixed(3)}deg`);
      surface.style.setProperty('--project-card-tilt-y', `${motion.y.toFixed(3)}deg`);
      surface.style.setProperty('--project-card-lift', `${motion.lift.toFixed(3)}px`);
      surface.style.setProperty('--tilt-progress', motion.progress.toFixed(3));
      surface.style.setProperty('--tilt-glare-x', `${motion.glareX.toFixed(2)}%`);
      surface.style.setProperty('--tilt-glare-y', `${motion.glareY.toFixed(2)}%`);
      const tilting = motion.progress > 0.01;
      if (tilting !== motion.tilting) {
        motion.tilting = tilting;
        card.dataset.tilting = String(tilting);
      }
    };

    const stop = () => {
      if (motion.frame) window.cancelAnimationFrame(motion.frame);
      motion.frame = 0;
      motion.lastFrame = 0;
    };

    const setRestTargets = () => {
      motion.targetX = 0;
      motion.targetY = 0;
      motion.targetLift = 0;
      motion.targetProgress = 0;
      motion.targetGlareX = 50;
      motion.targetGlareY = 50;
    };

    // DOM read phase (rect is cached; re-read only when invalidated).
    const computeTargets = () => {
      if (!allowed() || !motion.pointerInside || motion.keyboardFocus) {
        setRestTargets();
        return;
      }
      if (motion.needsMeasure || !motion.rect) {
        motion.rect = card.getBoundingClientRect();
        motion.needsMeasure = false;
      }
      const { left, right, top, bottom, width, height } = motion.rect;
      if (
        !width ||
        !height ||
        motion.pointerX < left ||
        motion.pointerX > right ||
        motion.pointerY < top ||
        motion.pointerY > bottom
      ) {
        motion.pointerInside = false;
        setRestTargets();
        return;
      }
      const horizontal = clamp((motion.pointerX - left - width / 2) / (width / 2), -1, 1);
      const vertical = clamp((motion.pointerY - top - height / 2) / (height / 2), -1, 1);
      motion.targetX = -vertical * maxAngle;
      motion.targetY = horizontal * maxAngle;
      motion.targetLift = -maxLift;
      motion.targetProgress = 1;
      // Light source mirrors the cursor: the highlight sits on the opposite side of the card.
      motion.targetGlareX = 50 - horizontal * 50;
      motion.targetGlareY = 50 - vertical * 50;
    };

    const frame = now => {
      motion.frame = 0;
      if (!allowed()) return;

      computeTargets();

      const elapsed = motion.lastFrame ? clamp(now - motion.lastFrame, 1, 64) : 16.7;
      motion.lastFrame = now;
      const follow = 1 - Math.exp(-elapsed / 60);
      motion.x += (motion.targetX - motion.x) * follow;
      motion.y += (motion.targetY - motion.y) * follow;
      motion.lift += (motion.targetLift - motion.lift) * follow;
      motion.progress += (motion.targetProgress - motion.progress) * follow;
      motion.glareX += (motion.targetGlareX - motion.glareX) * follow;
      motion.glareY += (motion.targetGlareY - motion.glareY) * follow;

      const unsettled =
        Math.abs(motion.targetX - motion.x) > 0.02 ||
        Math.abs(motion.targetY - motion.y) > 0.02 ||
        Math.abs(motion.targetLift - motion.lift) > 0.02 ||
        Math.abs(motion.targetProgress - motion.progress) > 0.005 ||
        Math.abs(motion.targetGlareX - motion.glareX) > 0.2 ||
        Math.abs(motion.targetGlareY - motion.glareY) > 0.2;

      if (!unsettled) {
        motion.x = motion.targetX;
        motion.y = motion.targetY;
        motion.lift = motion.targetLift;
        motion.progress = motion.targetProgress;
        motion.glareX = motion.targetGlareX;
        motion.glareY = motion.targetGlareY;
        motion.lastFrame = 0;
      }

      write();

      if (unsettled) motion.frame = window.requestAnimationFrame(frame);
    };

    const schedule = () => {
      if (!motion.frame && allowed()) {
        motion.frame = window.requestAnimationFrame(frame);
      }
    };

    const reset = immediate => {
      setRestTargets();
      if (immediate) {
        stop();
        motion.x = 0;
        motion.y = 0;
        motion.lift = 0;
        motion.progress = 0;
        motion.glareX = 50;
        motion.glareY = 50;
        write();
      } else {
        schedule();
      }
    };

    const hoverPointer = event =>
      event.pointerType === 'mouse' ||
      (event.pointerType === 'pen' && Boolean(finePointer?.matches));

    const onEnter = event => {
      if (!allowed() || !hoverPointer(event)) return;
      motion.pointerInside = true;
      motion.needsMeasure = true;
      motion.pointerX = event.clientX;
      motion.pointerY = event.clientY;
      schedule();
    };

    const onMove = event => {
      if (!allowed() || !hoverPointer(event)) return;
      motion.pointerInside = true;
      motion.pointerX = event.clientX;
      motion.pointerY = event.clientY;
      schedule();
    };

    const onLeave = () => {
      motion.pointerInside = false;
      motion.rect = null;
      reset(false);
    };

    const onFocusIn = event => {
      if (!event.target.matches(':focus-visible')) return;
      motion.keyboardFocus = true;
      reset(true);
    };

    const onFocusOut = event => {
      if (card.contains(event.relatedTarget)) return;
      motion.keyboardFocus = false;
      if (motion.pointerInside) {
        motion.needsMeasure = true;
        schedule();
      }
    };

    // Resize/scroll/observer: invalidate the cached rect so the next frame re-measures.
    const onGeometryChange = () => {
      motion.needsMeasure = true;
      motion.rect = null;
      if (motion.pointerInside) schedule();
    };

    const onModeChange = () => {
      if (!allowed()) {
        motion.pointerInside = false;
        motion.rect = null;
        reset(true);
      }
    };

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onGeometryChange);

    // Pointer-related listeners exist only while the card is in the viewport.
    const attach = () => {
      if (motion.attached) return;
      motion.attached = true;
      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointermove', onMove, { passive: true });
      card.addEventListener('pointerleave', onLeave);
      card.addEventListener('pointercancel', onLeave);
      window.addEventListener('resize', onGeometryChange, { passive: true });
      window.addEventListener('scroll', onGeometryChange, { passive: true });
      resizeObserver?.observe(card);
    };

    const detach = () => {
      if (!motion.attached) return;
      motion.attached = false;
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
      card.removeEventListener('pointercancel', onLeave);
      window.removeEventListener('resize', onGeometryChange);
      window.removeEventListener('scroll', onGeometryChange);
      resizeObserver?.disconnect();
    };

    const intersectionObserver = hasObserver
      ? new IntersectionObserver(
          entries => {
            const last = entries[entries.length - 1];
            const visible = Boolean(last?.isIntersecting);
            if (visible === motion.inView) return;
            motion.inView = visible;
            if (visible) {
              motion.needsMeasure = true;
              attach();
            } else {
              motion.pointerInside = false;
              motion.rect = null;
              reset(true);
              detach();
            }
          },
          { rootMargin: '80px 0px', threshold: 0 },
        )
      : null;

    // Focus and media-query listeners are cheap and must work regardless of visibility.
    card.addEventListener('focusin', onFocusIn);
    card.addEventListener('focusout', onFocusOut);
    document.addEventListener('visibilitychange', onModeChange);
    finePointer?.addEventListener?.('change', onModeChange);
    reducedMotion?.addEventListener?.('change', onModeChange);

    if (intersectionObserver) intersectionObserver.observe(card);
    else attach();
    onModeChange();

    return () => {
      stop();
      reset(true);
      intersectionObserver?.disconnect();
      detach();
      card.removeEventListener('focusin', onFocusIn);
      card.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('visibilitychange', onModeChange);
      finePointer?.removeEventListener?.('change', onModeChange);
      reducedMotion?.removeEventListener?.('change', onModeChange);
    };
  }, [enabled, suspended, intensity, lift]);

  return { cardRef, surfaceRef };
}
