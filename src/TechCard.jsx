import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, GitBranch } from 'lucide-react';
import Skeleton from './Skeleton';

export default function TechCard({ tech, onOpen, effectsEnabled = true }) {
  const [logoStatus, setLogoStatus] = useState(() => (tech.logo ? 'loading' : 'empty'));
  const imgRef = useRef(null);

  useEffect(() => {
    if (!tech.logo) {
      setLogoStatus('empty');
      return undefined;
    }
    setLogoStatus('loading');
    const img = imgRef.current;
    if (!img) return undefined;
    let cancelled = false;
    const finish = async () => {
      try {
        await img.decode?.();
      } catch {
        if (!cancelled) setLogoStatus('error');
        return;
      }
      if (!cancelled) setLogoStatus('ready');
    };
    if (img.complete) {
      if (img.naturalWidth > 0) finish();
      else if (img.currentSrc) setLogoStatus('error');
    }
    return () => {
      cancelled = true;
    };
  }, [tech.logo]);

  const showLogo = Boolean(tech.logo) && logoStatus !== 'error';
  const fallbackMark = tech.name
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();

  return (
    <button
      type="button"
      className={`tech-card ${tech.isMilestone ? 'tech-card--milestone' : ''}`}
      onClick={event => onOpen(tech, event.currentTarget)}
      aria-label={`${tech.name}, started learning in ${tech.year}. View learning details`}
      aria-describedby={`tech-card-summary-${tech.id}`}
    >
      <span className="tech-card__header">
        <span
          className="tech-card__logo-well"
          aria-hidden="true"
          aria-busy={logoStatus === 'loading' ? 'true' : undefined}
          style={tech.logoScale ? { '--tech-logo-scale': tech.logoScale } : undefined}
        >
          {logoStatus === 'loading' && (
            <Skeleton
              active={true}
              delayMs={150}
              shimmer={true}
              effectsEnabled={effectsEnabled}
              className="skeleton--fill"
            />
          )}
          {showLogo ? (
            <img
              ref={imgRef}
              src={tech.logo}
              alt=""
              width="48"
              height="48"
              loading="lazy"
              decoding="async"
              className={logoStatus === 'ready' ? 'is-ready' : ''}
              onLoad={async event => {
                const target = event.currentTarget;
                try {
                  await target.decode?.();
                  setLogoStatus('ready');
                } catch {
                  setLogoStatus('error');
                }
              }}
              onError={() => setLogoStatus('error')}
            />
          ) : tech.isMilestone ? (
            <span className="tech-card__logo-fallback tech-card__logo-fallback--icon">
              <GitBranch size={22} aria-hidden="true" />
            </span>
          ) : (
            <span className="tech-card__logo-fallback">{fallbackMark}</span>
          )}
        </span>
        <span className="tech-card__action" aria-hidden="true">
          <ArrowUpRight size={15} />
        </span>
      </span>
      <span className="tech-card__category">{tech.category}</span>
      <span className="tech-card__name">{tech.name}</span>
      <span className="tech-card__summary" id={`tech-card-summary-${tech.id}`}>
        {tech.summary || `Started learning in ${tech.year}.`}
      </span>
    </button>
  );
}
