import { useEffect, useRef, useState } from 'react';
import { heroPhotos } from './content';
import Skeleton from './Skeleton';

const HOLD_MS = 4000;
const MOVE_MS = 800;

function getSlot(index, activeIndex, count, transitioning) {
  if (count <= 1) return 'center';

  const nextIndex = (activeIndex + 1) % count;
  if (count === 2) {
    if (index === activeIndex) return transitioning ? 'right' : 'center';
    return transitioning ? 'center' : 'right';
  }

  const previousIndex = (activeIndex + count - 1) % count;
  const incomingIndex = (activeIndex + 2) % count;

  if (transitioning) {
    if (index === activeIndex) return 'left';
    if (index === nextIndex) return 'center';
    if (index === previousIndex) return count === 3 ? 'right' : 'hidden-left';
    if (index === incomingIndex) return 'right';
    return 'hidden-left';
  }

  if (index === activeIndex) return 'center';
  if (index === nextIndex) return 'right';
  if (index === previousIndex) return 'left';
  if (index === incomingIndex) return 'hidden-right';
  return 'hidden-left';
}

function getLayer(index, activeIndex, count) {
  const slot = getSlot(index, activeIndex, count, false);
  if (slot === 'center') return 3;
  if (slot === 'right') return 2;
  if (slot === 'left') return 1;
  return 0;
}

function PhotoCard({ photo, slot, layer, effectsEnabled }) {
  const [loadedSource, setLoadedSource] = useState(null);
  const [failedSource, setFailedSource] = useState(null);
  const imgRef = useRef(null);
  const source = typeof photo.src === 'string' ? photo.src.trim() : '';
  const hasImage = Boolean(source) && failedSource !== source;
  const imageLoaded = hasImage && loadedSource === source;
  const imagePending = hasImage && !imageLoaded;

  useEffect(() => {
    if (!hasImage) return undefined;
    const img = imgRef.current;
    if (!img) return undefined;
    let cancelled = false;
    const finishLoad = async () => {
      try {
        await img.decode?.();
      } catch {
        if (!cancelled) setFailedSource(source);
        return;
      }
      if (!cancelled) setLoadedSource(source);
    };
    if (img.complete) {
      if (img.naturalWidth > 0) finishLoad();
      else if (img.currentSrc) setFailedSource(source);
    }
    return () => {
      cancelled = true;
    };
  }, [hasImage, source]);

  return (
    <div
      className="profile-card-stack__card"
      data-slot={slot}
      aria-hidden={slot.startsWith('hidden') ? 'true' : undefined}
      style={{ '--profile-card-stack-layer': layer }}
    >
      <div
        className="profile-card-stack__card-media"
        data-image-loaded={imageLoaded ? 'true' : 'false'}
        aria-busy={imagePending ? 'true' : undefined}
      >
        <div className="profile-card-stack__placeholder" aria-hidden="true">
          <span className="profile-card-stack__placeholder-mark">KB</span>
        </div>
        {imagePending && (
          <Skeleton
            active={true}
            delayMs={150}
            shimmer={true}
            effectsEnabled={effectsEnabled}
            className="skeleton--fill"
          />
        )}
        {hasImage && (
          <img
            ref={imgRef}
            className="profile-card-stack__image"
            src={source}
            alt={photo.alt?.trim() || 'Portrait of Kenji Balili'}
            width="360"
            height="480"
            loading={slot === 'center' ? 'eager' : 'lazy'}
            decoding="async"
            style={{ objectPosition: photo.objectPosition || 'center' }}
            onLoad={async event => {
              const target = event.currentTarget;
              try {
                await target.decode?.();
                setLoadedSource(source);
              } catch {
                setFailedSource(source);
              }
            }}
            onError={() => setFailedSource(source)}
          />
        )}
      </div>
    </div>
  );
}

function pauseCardMotion(stage) {
  if (!stage) return [];

  const pausedAnimations = [];
  for (const card of stage.querySelectorAll('.profile-card-stack__card')) {
    if (typeof card.getAnimations !== 'function') continue;
    for (const animation of card.getAnimations()) {
      if (animation.transitionProperty !== 'transform' && animation.transitionProperty !== 'opacity') continue;
      if (animation.playState !== 'running') continue;
      animation.pause();
      pausedAnimations.push(animation);
    }
  }
  return pausedAnimations;
}

function isHoverPointer(event) {
  return (
    event.pointerType === 'mouse' ||
    (event.pointerType === 'pen' && (window.matchMedia?.('(any-hover: hover)').matches ?? false))
  );
}

export default function ProfileCardStack({
  photos = heroPhotos,
  effectsEnabled = true,
  suspended = false,
}) {
  const entries = Array.isArray(photos) ? photos.filter(Boolean) : [];
  const count = entries.length;
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const pausedAnimationsRef = useRef([]);
  const holdRemainingRef = useRef(HOLD_MS);
  const moveRemainingRef = useRef(MOVE_MS);

  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [inViewport, setInViewport] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return undefined;
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (!rootRef.current || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setInViewport(entry.isIntersecting), {
      threshold: 0.05,
    });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setActiveIndex(index => (count ? index % count : 0));
    setTransitioning(false);
    holdRemainingRef.current = HOLD_MS;
    moveRemainingRef.current = MOVE_MS;
    for (const animation of pausedAnimationsRef.current) animation.cancel();
    pausedAnimationsRef.current = [];
  }, [count]);

  useEffect(() => {
    if ((reducedMotion || !effectsEnabled) && transitioning) {
      for (const animation of pausedAnimationsRef.current) animation.cancel();
      pausedAnimationsRef.current = [];
      setActiveIndex(index => (count ? (index + 1) % count : 0));
      setTransitioning(false);
      moveRemainingRef.current = MOVE_MS;
      holdRemainingRef.current = HOLD_MS;
    }
  }, [reducedMotion, effectsEnabled, transitioning, count]);

  const canCycle =
    count > 1 &&
    effectsEnabled &&
    !hovered &&
    !focusWithin &&
    !reducedMotion &&
    inViewport &&
    pageVisible &&
    !suspended;

  useEffect(() => {
    if (!canCycle) {
      if (transitioning) {
        const pause = () => {
          pausedAnimationsRef.current.push(...pauseCardMotion(stageRef.current));
        };
        pause();
        const frame = window.requestAnimationFrame(pause);
        return () => window.cancelAnimationFrame(frame);
      }
      return undefined;
    }

    if (transitioning) {
      for (const animation of pausedAnimationsRef.current) animation.play();
      pausedAnimationsRef.current = [];

      const startedAt = performance.now();
      let completed = false;
      const timer = window.setTimeout(() => {
        completed = true;
        moveRemainingRef.current = MOVE_MS;
        holdRemainingRef.current = HOLD_MS;
        setActiveIndex(index => (count ? (index + 1) % count : 0));
        setTransitioning(false);
      }, moveRemainingRef.current);

      return () => {
        window.clearTimeout(timer);
        if (!completed) {
          moveRemainingRef.current = Math.max(0, moveRemainingRef.current - (performance.now() - startedAt));
        }
      };
    }

    const startedAt = performance.now();
    let completed = false;
    const timer = window.setTimeout(() => {
      completed = true;
      holdRemainingRef.current = HOLD_MS;
      setTransitioning(true);
    }, holdRemainingRef.current);

    return () => {
      window.clearTimeout(timer);
      if (!completed) {
        holdRemainingRef.current = Math.max(0, holdRemainingRef.current - (performance.now() - startedAt));
      }
    };
  }, [canCycle, transitioning, activeIndex, count]);

  useEffect(
    () => () => {
      for (const animation of pausedAnimationsRef.current) animation.cancel();
    },
    [],
  );

  const safeActiveIndex = count ? activeIndex % count : 0;
  const cards = count ? entries : [{ id: 'portrait-fallback', src: '', alt: '', objectPosition: 'center' }];

  return (
    <div
      className="profile-card-stack"
      data-transitioning={transitioning && effectsEnabled && !reducedMotion ? 'true' : 'false'}
      ref={rootRef}
      onPointerEnter={event => {
        if (isHoverPointer(event)) setHovered(true);
      }}
      onPointerLeave={event => {
        if (isHoverPointer(event)) setHovered(false);
      }}
      onFocusCapture={event => {
        if (event.target.matches(':focus-visible')) setFocusWithin(true);
      }}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
      }}
    >
      <div className="profile-card-stack__stage" ref={stageRef}>
        {cards.map((photo, index) => (
          <PhotoCard
            key={photo.id || `portrait-${index}`}
            photo={photo}
            slot={getSlot(index, safeActiveIndex, count, transitioning)}
            layer={getLayer(index, safeActiveIndex, count)}
            effectsEnabled={effectsEnabled}
          />
        ))}
      </div>
    </div>
  );
}
