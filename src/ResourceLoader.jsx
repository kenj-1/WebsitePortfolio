import Skeleton from './Skeleton';

// Retained for compatibility with existing imports; delegates to the accessible Skeleton primitive.
export default function ResourceLoader({ active, resourceKey, effectsEnabled = true }) {
  return (
    <Skeleton
      key={resourceKey || 'resource'}
      active={active}
      delayMs={150}
      shimmer={true}
      effectsEnabled={effectsEnabled}
      className="skeleton--fill"
    />
  );
}
