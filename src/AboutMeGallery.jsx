import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Images, Sparkles } from 'lucide-react';
import { aboutMePhotos } from './assetScanner';

/**
 * About Me Photo Slider / Gallery
 *
 * Displays personal photos from `assets/me` inside a premium 3D frosted-glass card
 * with specular glare, smooth slide navigation, and responsive controls.
 */
export default function AboutMeGallery({
  photos = aboutMePhotos,
  effectsEnabled = true,
  className = '',
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedMap, setLoadedMap] = useState({});

  const items = Array.isArray(photos) && photos.length > 0 ? photos : [];
  const total = items.length;

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex(prev => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex(prev => (prev + 1) % total);
  }, [total]);

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    },
    [handlePrev, handleNext],
  );

  const activePhoto = items[currentIndex] || null;

  if (!activePhoto) {
    return (
      <div className={`about-me-gallery about-me-gallery--empty ${className}`}>
        <div className="about-me-placeholder">
          <Images size={32} aria-hidden="true" />
          <span>Photos from assets/me will appear here</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`about-me-gallery ${className}`}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="About Dirk Kenji Balili Photo Gallery"
    >
      <div className="about-me-card glass">
        <div className="about-me-frame">
          <div className="about-me-image-container">
            {items.map((photo, index) => {
              const isActive = index === currentIndex;
              return (
                <div
                  key={photo.id || photo.fileName || index}
                  className={`about-me-slide ${isActive ? 'is-active' : ''}`}
                  aria-hidden={!isActive}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt || `Photo of Dirk Kenji Balili (${index + 1})`}
                    className={`about-me-img ${loadedMap[photo.src] ? 'is-loaded' : ''}`}
                    style={photo.objectPosition ? { objectPosition: photo.objectPosition } : undefined}
                    onLoad={() => setLoadedMap(prev => ({ ...prev, [photo.src]: true }))}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              );
            })}
          </div>

          {/* Top subtle badge */}
          <div className="about-me-badge" aria-hidden="true">
            <Sparkles size={12} />
            <span>DIRK KENJI BALILI</span>
          </div>

          {/* Bottom Bar: Caption & Slider Controls */}
          <div className="about-me-bar">
            <div className="about-me-meta">
              <span className="about-me-counter mono-digits" aria-live="polite">
                [ {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} ]
              </span>
              <p className="about-me-caption">{activePhoto.caption || 'CIT–U · Software & Projects'}</p>
            </div>

            {total > 1 && (
              <div className="about-me-controls" role="group" aria-label="Photo navigation">
                <button
                  type="button"
                  className="about-me-btn about-me-btn--prev"
                  onClick={handlePrev}
                  aria-label="Previous photo"
                  title="Previous photo (Left arrow)"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>

                <div className="about-me-dots" aria-hidden="true">
                  {items.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      tabIndex={-1}
                      className={`about-me-dot ${dotIdx === currentIndex ? 'is-active' : ''}`}
                      onClick={() => setCurrentIndex(dotIdx)}
                      aria-label={`Jump to slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="about-me-btn about-me-btn--next"
                  onClick={handleNext}
                  aria-label="Next photo"
                  title="Next photo (Right arrow)"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

