import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Menu,
  X,
  MapPin,
  Music2,
  FileSpreadsheet,
  AlertCircle,
  RotateCcw,
  Trophy,
  Award,
  FolderGit2,
  Images,
  ChevronDown,
  Terminal,
  Download,
  Github,
  ExternalLink,
  Sparkles,
  Layers,
} from 'lucide-react';
import heroPortraitImg from './assets/me/image_7ee6a3.jpg';
import { profile, socialLinks, recognition, leadershipExperiences, academicAwards, techJourney } from './content';
import {
  hackathonAndContestItems,
  portfolioAwards,
  mergedPortfolioProjects,
  assetScanSummary,
} from './assetScanner';
import ThemeToggle from './ThemeToggle';
import SocialLinks from './SocialLinks';
import Skeleton from './Skeleton';
import LiveStatus from './LiveStatus';
import AmbientBackground from './AmbientBackground';
import AmbientEffectsToggle from './AmbientEffectsToggle';
import AboutMeGallery from './AboutMeGallery';
import TechJourney from './TechJourney';
import TiltCard from './TiltCard';
import { ScrollReveal } from './ScrollReveal';
import './style.css';

// Fill optional project fields safely so incomplete drafts can be displayed.
const normalizeProjects = items =>
  (Array.isArray(items) ? items : []).map((project, index) => {
    const bullets =
      Array.isArray(project.bullets) && project.bullets.length > 0
        ? project.bullets
        : Array.isArray(project.highlights)
          ? project.highlights
          : [];
    const highlights =
      Array.isArray(project.highlights) && project.highlights.length > 0
        ? project.highlights
        : bullets;
    return {
      ...project,
      id: project.id || `project-${index}`,
      tags: Array.isArray(project.tags) ? project.tags : [],
      bullets,
      highlights,
      techStackContext: project.techStackContext || '',
      gallery: Array.isArray(project.gallery) ? project.gallery : [],
    };
  });

const portfolioProjects = normalizeProjects(mergedPortfolioProjects);
const portfolioHackathons = normalizeProjects(hackathonAndContestItems);
const portfolioRecognitions = normalizeProjects(portfolioAwards);

const MUSIC_BAR_HEIGHTS = [38, 68, 92, 52, 76, 44, 88, 60, 35, 74, 95, 48];
const SHEET_CELL_KINDS = [
  'head', 'head', 'head', 'head',
  'key', 'cell', 'cell', 'cell',
  'key', 'cell', 'cell', 'cell',
  'key', 'cell', 'cell', 'cell',
  'key', 'cell', 'cell', 'cell',
];

function Arrow({ diagonal = false, size = 17 }) {
  return diagonal ? (
    <ArrowUpRight size={size} aria-hidden="true" />
  ) : (
    <ArrowRight size={size} aria-hidden="true" />
  );
}

function Brand() {
  return (
    <a href="#top" className="brand" aria-label="Kenji Balili, back to top">
      <span className="brand-mark" aria-hidden="true">
        k<span>.</span>
      </span>
      <span className="brand-name">
        KENJI BALILI <small>PERSONAL PORTFOLIO</small>
      </span>
    </a>
  );
}

function BrandRollingButton({ text, href, onClick, className = '', children, ...props }) {
  const label = text || children;
  const content = (
    <div className="relative overflow-hidden h-[24px]">
      <p className="brand-roll-text group-hover:-translate-y-7 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)] transition-transform whitespace-nowrap">
        {label}
      </p>
      <p className="brand-roll-text absolute top-7 left-0 group-hover:top-0 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)] transition-all whitespace-nowrap">
        {label}
      </p>
    </div>
  );

  const buttonClasses = `cursor-pointer bg-gradient-to-b from-[#D97757] to-[#b35b3f] shadow-[0px_4px_32px_0_rgba(217,119,87,0.4)] px-6 py-3 rounded-xl border-[1px] border-slate-500/30 text-white font-medium group inline-flex items-center justify-center no-underline transition-all duration-300 hover:shadow-[0px_6px_36px_0_rgba(217,119,87,0.6)] active:scale-95 ${className}`;

  if (href) {
    return (
      <a href={href} className={buttonClasses} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={buttonClasses} {...props}>
      {content}
    </button>
  );
}

function Header({
  theme,
  onThemeToggle,
  ambientEnabled,
  onAmbientToggle,
  activeSection = 'about',
  onNavigate,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);
  const groupRef = useRef(null);
  const itemRefs = useRef([]);
  const [gliderStyle, setGliderStyle] = useState({ width: 0, offsetLeft: 0, ready: false });

  const links = [
    { id: 'about', label: 'About' },
    { id: 'work', label: 'Projects' },
    { id: 'hackathons', label: 'Contests' },
    { id: 'skills', label: 'Journey' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'recognitions', label: 'Awards' },
    { id: 'contact', label: 'Contact' },
  ];

  const activeIndex = Math.max(
    0,
    links.findIndex(link => link.id === activeSection),
  );

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    onNavigate?.(id);
  };

  useLayoutEffect(() => {
    const updateGlider = () => {
      const groupEl = groupRef.current;
      const activeEl = itemRefs.current[activeIndex];
      if (!groupEl || !activeEl) return;

      const groupRect = groupEl.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      if (activeRect.width === 0) return;

      const activeWidth = Math.round(activeRect.width);
      const activeOffsetLeft = Math.round(activeRect.left - groupRect.left);

      setGliderStyle({
        width: activeWidth,
        offsetLeft: activeOffsetLeft,
        ready: true,
      });
    };

    updateGlider();
    const rafId = requestAnimationFrame(updateGlider);
    const timer = setTimeout(updateGlider, 50);

    if (document.fonts?.ready) {
      document.fonts.ready.then(updateGlider).catch(() => {});
    }

    window.addEventListener('resize', updateGlider);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      window.removeEventListener('resize', updateGlider);
    };
  }, [activeIndex]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = event => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header className="header-wrap">
      <nav className="navigation glass" aria-label="Main navigation">
        <Brand />
        <div
          ref={groupRef}
          className="glass-radio-group"
          role="tablist"
          aria-label="Portfolio sections"
        >
          <div
            className="glass-glider"
            style={{
              width: `${gliderStyle.width}px`,
              transform: `translateX(${gliderStyle.offsetLeft}px)`,
              opacity: gliderStyle.ready ? 1 : 0,
            }}
            aria-hidden="true"
          />
          {links.map((link, idx) => {
            const isActive = activeIndex === idx;
            return (
              <a
                key={link.id}
                ref={el => {
                  itemRefs.current[idx] = el;
                }}
                href={`#${link.id}`}
                className={`glass-radio-item ${isActive ? 'is-active' : ''}`}
                role="tab"
                aria-selected={isActive}
                onClick={e => handleLinkClick(e, link.id)}
              >
                {link.label}
              </a>
            );
          })}
        </div>
        <a
          className="nav-cta"
          href="#contact"
          onClick={e => handleLinkClick(e, 'contact')}
        >
          Let’s connect <Arrow diagonal size={15} />
        </a>
        <div className="appearance-controls" role="group" aria-label="Appearance">
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          <AmbientEffectsToggle enabled={ambientEnabled} onToggle={onAmbientToggle} />
        </div>
        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMenuOpen(open => !open)}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </nav>
      <div
        id="mobile-nav"
        className={`mobile-nav glass ${menuOpen ? 'is-open' : ''}`}
        hidden={!menuOpen}
      >
        {links.map(link => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={e => {
              setMenuOpen(false);
              handleLinkClick(e, link.id);
            }}
          >
            <span>{link.label}</span>
            <Arrow diagonal size={15} />
          </a>
        ))}
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero-section hero-asym" aria-labelledby="hero-title">
      {/* The Softened Glowing Arc / Backdrop */}
      <div className="hero-eclipse-arc" aria-hidden="true" />

      <div className="container hero-asym-container">
        {/* Left Column: Typography, Subtitle, CTA Buttons, Metrics */}
        <div className="hero-left-col">
          <ScrollReveal delay={0}>
            <p className="hero-producer-label hero-producer-label--left">
              <span className="status-dot" aria-hidden="true" />
              <span>A Kenji Balili Production</span>
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 id="hero-title" className="hero-headline-asym">
              Website Portfolio
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.18}>
            <p className="hero-subtitle-asym">
              Crafting captivating digital experiences through engineering and design. Software developer &amp; product builder specializing in intelligent interfaces and scalable architectures.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.26} className="hero-actions-left">
            <BrandRollingButton
              href="#work"
              text={
                <span className="inline-flex items-center gap-2">
                  View Projects <Arrow diagonal size={16} />
                </span>
              }
            />
            <a className="button button-secondary hero-secondary-btn" href="#hackathons">
              Contests <Arrow diagonal size={15} />
            </a>
          </ScrollReveal>

          {/* Metrics Row matching reference */}
          <ScrollReveal delay={0.34} className="hero-metrics-row">
            <div className="hero-metric-item">
              <span className="hero-metric-val">15+</span>
              <span className="hero-metric-label">Projects Built</span>
            </div>
            <div className="hero-metric-divider" aria-hidden="true" />
            <div className="hero-metric-item">
              <span className="hero-metric-val">3+</span>
              <span className="hero-metric-label">Hackathons</span>
            </div>
            <div className="hero-metric-divider" aria-hidden="true" />
            <div className="hero-metric-item">
              <span className="hero-metric-val">1.15</span>
              <span className="hero-metric-label">CIT–U GPA</span>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: The Portrait Focus with Floating Badges */}
        <div className="hero-right-col">
          <ScrollReveal delay={0.22} className="hero-portrait-stage">
            {/* Orbital Rings & Aura Accent */}
            <div className="hero-orbit-ring hero-orbit-ring--outer" aria-hidden="true" />
            <div className="hero-orbit-ring hero-orbit-ring--inner" aria-hidden="true" />
            <div className="hero-portrait-glow" aria-hidden="true" />

            {/* Floating Badges */}
            <div className="hero-floating-pill hero-floating-pill--top-left">
              <span className="hero-pill-icon hero-pill-icon--cyan">
                <Sparkles size={14} />
              </span>
              <span className="hero-pill-text">React &amp; UI/UX</span>
            </div>

            <div className="hero-floating-pill hero-floating-pill--middle-right">
              <span className="hero-pill-icon hero-pill-icon--amber">
                <Terminal size={14} />
              </span>
              <span className="hero-pill-text">Python &amp; Systems</span>
            </div>

            <div className="hero-floating-pill hero-floating-pill--bottom-left">
              <span className="hero-pill-icon hero-pill-icon--purple">
                <Layers size={14} />
              </span>
              <span className="hero-pill-text">Product Design</span>
            </div>

            {/* Main Floating Portrait Frame */}
            <div className="hero-portrait-frame">
              <img
                src={heroPortraitImg}
                alt="Dirk Kenji Balili mirror portrait"
                className="hero-portrait-img"
                loading="eager"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function About({ effectsEnabled = true }) {
  return (
    <section className="section container about-section" id="about" aria-labelledby="about-title">
      <div className="about-layout">
        <div className="about-bio">
          <div className="section-header about-header">
            <ScrollReveal delay={0}>
              <span className="section-micro-label">[ 01 ] // ABOUT</span>
              <h2 id="about-title" className="section-heading">
                About Me
              </h2>
            </ScrollReveal>
          </div>
          <div className="about-content">
            <ScrollReveal delay={0.18}>
              <p className="about-bio-text">
                I am Dirk Kenji Balili, a BSIT Student passionate about life and the things I enjoy. I am endlessly intrigued by building things and pushing the boundaries of what I can create. Outside of coding, I usually enjoy playing guitar, watching movies, and listening to music. Despite being naturally introverted, I want to expose myself to the outside world to see what I am capable of and contribute to things that matter. I truly enjoy building myself up and will keep trying, despite any obstacles, to succeed.
              </p>
            </ScrollReveal>

            {/* Fun Facts Sub-grid */}
            <ScrollReveal delay={0.3} className="fun-facts-grid">
              <div className="fun-fact-card">
                <span className="text-[#D97757] font-bold shrink-0">01.</span>
                <span>I enjoy playing guitar, gaming, watching movies, reading books, listening to music, and traveling.</span>
              </div>
              <div className="fun-fact-card">
                <span className="text-[#D97757] font-bold shrink-0">02.</span>
                <span>Currently enjoying Django, Python, and React. I&apos;m also actively exploring AI with Gemini, Astra, and GPT-3.</span>
              </div>
              <div className="fun-fact-card">
                <span className="text-[#D97757] font-bold shrink-0">03.</span>
                <span>I get cold easily (hence the jackets!), fall asleep fast but wake up just as quickly, and I&apos;m soft-spoken with a soft spot for others—including AI, so I always say &apos;please&apos; and &apos;thank you&apos;. I can get distracted, but I always find my way back into focus.</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4} className="about-highlights">
              <span className="about-chip">CIT–U Academic Achiever</span>
              <span className="about-chip">Dean’s Lister 2025–2026</span>
              <span className="about-chip">Hackathon Builder</span>
            </ScrollReveal>
          </div>
        </div>

        {/* Interactive Photo Slider / Gallery */}
        <ScrollReveal delay={0.3} className="about-gallery-wrap">
          <AboutMeGallery effectsEnabled={effectsEnabled} />
        </ScrollReveal>
      </div>
    </section>
  );
}

function retryImageSource(source, attempt) {
  if (attempt === 0) return source;
  try {
    const url = new URL(source, window.location.href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return source;
    url.searchParams.set('_portfolio_retry', String(attempt));
    return url.href;
  } catch {
    return source;
  }
}

// Keep a successful retry URL for later card/dialog mounts; the browser reuses its image cache.
const successfulImageSources = new Map();

function ProjectImage({
  project,
  overrideSrc,
  overrideAlt,
  onOpen,
  effectsEnabled = true,
  priority = false,
  onAnnounce,
}) {
  const activeImage = overrideSrc || project.image;
  const activeAlt = overrideAlt || project.imageAlt || `${project.name} project screenshot`;
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState(() =>
    successfulImageSources.has(activeImage) ? 'ready' : 'loading',
  );
  const [source, setSource] = useState(
    () => successfulImageSources.get(activeImage) || activeImage,
  );
  const imageRef = useRef(null);
  const visualRef = useRef(null);
  const openButtonRef = useRef(null);
  const requestIdRef = useRef(0);
  const announcedRetryRef = useRef(false);

  useEffect(() => {
    setSource(successfulImageSources.get(activeImage) || activeImage);
    setAttempt(0);
  }, [activeImage]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return undefined;
    const currentRequestId = ++requestIdRef.current;
    let settled = false;

    const finalizeReady = () => {
      if (settled || requestIdRef.current !== currentRequestId) return;
      settled = true;
      successfulImageSources.set(activeImage, source);
      setStatus('ready');
      if (announcedRetryRef.current) {
        announcedRetryRef.current = false;
        onAnnounce?.(`Loaded preview image for ${project.name}.`);
        openButtonRef.current?.focus({ preventScroll: true });
      }
    };

    const finalizeError = () => {
      if (settled || requestIdRef.current !== currentRequestId) return;
      settled = true;
      if (successfulImageSources.get(activeImage) === source) {
        successfulImageSources.delete(activeImage);
      }
      setStatus('error');
      onAnnounce?.(`Preview image for ${project.name} could not load. Retry available.`);
    };

    const handleLoad = async () => {
      if (settled || requestIdRef.current !== currentRequestId) return;
      try {
        await image.decode?.();
      } catch {
        finalizeError();
        return;
      }
      finalizeReady();
    };

    const handleError = () => {
      finalizeError();
    };

    if (image.complete) {
      if (image.naturalWidth > 0) {
        handleLoad();
        return () => {
          requestIdRef.current += 1;
        };
      }
      if (image.currentSrc) {
        handleError();
        return () => {
          requestIdRef.current += 1;
        };
      }
    }

    setStatus('loading');
    image.addEventListener('load', handleLoad);
    image.addEventListener('error', handleError);

    return () => {
      requestIdRef.current += 1;
      image.removeEventListener('load', handleLoad);
      image.removeEventListener('error', handleError);
    };
  }, [activeImage, project.name, source, onAnnounce]);

  const retry = () => {
    announcedRetryRef.current = true;
    onAnnounce?.(`Retrying preview image for ${project.name}…`);
    visualRef.current?.focus({ preventScroll: true });
    setStatus('loading');
    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);
    setSource(
      successfulImageSources.get(activeImage) || retryImageSource(activeImage, nextAttempt),
    );
  };

  const useSrcSet =
    !overrideSrc && attempt === 0 && project.imageSrcSet ? project.imageSrcSet : undefined;

  return (
    <div className="project-visual visual-photo" ref={visualRef} tabIndex={-1}>
      <div className="project-image-media" aria-busy={status === 'loading'}>
        <Skeleton
          active={status === 'loading'}
          delayMs={150}
          shimmer={true}
          effectsEnabled={effectsEnabled}
          className="skeleton--fill"
        />
        <img
          key={source}
          ref={imageRef}
          src={source}
          srcSet={useSrcSet}
          sizes={useSrcSet ? project.imageSizes : undefined}
          width={project.imageWidth || 1280}
          height={project.imageHeight || 720}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          alt={activeAlt}
          className={status === 'ready' ? 'is-ready' : ''}
          aria-hidden={status !== 'ready'}
          style={
            !overrideSrc
              ? {
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderTopLeftRadius: 'inherit',
                  borderTopRightRadius: 'inherit',
                }
              : undefined
          }
        />
      </div>
      {onOpen && status !== 'error' && (
        <button
          ref={openButtonRef}
          type="button"
          className="project-image-open"
          onClick={event => onOpen(event.currentTarget)}
          aria-label={`View details for ${project.name}`}
        />
      )}
      {status === 'error' && (
        <div className="project-image-error">
          <p className="project-image-error__title">
            <AlertCircle size={15} aria-hidden="true" />
            <span>Image couldn’t load.</span>
          </p>
          <div className="project-image-error__actions">
            <button type="button" className="project-image-error__retry" onClick={retry}>
              <RotateCcw size={13} aria-hidden="true" />
              <span>Retry image</span>
            </button>
            {onOpen && (
              <button
                type="button"
                className="project-image-error__details"
                onClick={event => onOpen(event.currentTarget)}
              >
                Open details
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectVisual({
  project,
  overrideSrc,
  overrideAlt,
  onOpen,
  effectsEnabled = true,
  priority = false,
  onAnnounce,
}) {
  const imageSource = overrideSrc || project.image;
  if (imageSource) {
    return (
      <ProjectImage
        key={`${project.id}:${imageSource}`}
        project={project}
        overrideSrc={overrideSrc}
        overrideAlt={overrideAlt}
        onOpen={onOpen}
        effectsEnabled={effectsEnabled}
        priority={priority}
        onAnnounce={onAnnounce}
      />
    );
  }
  if (project.visual === 'achievement') {
    return (
      <div className="project-visual visual-achievement" aria-hidden="true">
        <div className="achievement-emblem">
          {project.orgLogo ? (
            <img
              src={project.orgLogo}
              alt=""
              className="achievement-emblem__logo"
              width="48"
              height="48"
              loading="lazy"
            />
          ) : (
            <Award size={32} />
          )}
        </div>
        <div className="achievement-caption">
          <span>{project.organizer || 'ACADEMIC DISTINCTION'}</span>
          <strong>{project.name}</strong>
          <small>{project.date || project.status}</small>
        </div>
      </div>
    );
  }
  if (project.visual === 'music') {
    return (
      <div className="project-visual visual-music" aria-hidden="true">
        <div className="music-window">
          <div className="window-top">
            <span className="window-dots">● ● ●</span>
            <span>EMPATHTUNE PROTOTYPE</span>
            <Music2 size={15} />
          </div>
          <div className="music-content">
            <div className="album">
              <span>
                e<span>.</span>
              </span>
              <div className="album-wave" />
            </div>
            <div className="music-copy">
              <span>MOOD &amp; FEEDBACK QUEUE</span>
              <b>
                Music that
                <br />
                <i>adapts to you.</i>
              </b>
              <div className="music-bars">
                {MUSIC_BAR_HEIGHTS.map((height, index) => (
                  <i key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </div>
          <div className="music-bottom">
            <span>◁</span>
            <span className="play">▶</span>
            <span>▷</span>
            <div className="track-line">
              <i />
            </div>
            <span>∞</span>
          </div>
        </div>
      </div>
    );
  }
  if (project.visual === 'document') {
    return (
      <div className="project-visual visual-document" aria-hidden="true">
        <div className="paper paper-back">
          <span>DOCS</span>
          <i />
          <i />
          <i className="paper-line-short" />
        </div>
        <div className="paper paper-front">
          <div className="sheet-top">
            <span>EXCELLENT</span>
            <FileSpreadsheet size={18} />
          </div>
          <div className="sheet-grid">
            {SHEET_CELL_KINDS.map((kind, index) => (
              <i key={index} data-cell={kind} />
            ))}
          </div>
          <span className="sheet-footer">STRUCTURED WORKBOOK ↗</span>
        </div>
        <span className="convert-bubble">
          <ArrowRight size={18} />
        </span>
      </div>
    );
  }
  return (
    <div className="project-visual visual-game" aria-hidden="true">
      <div className="game-rings">
        <div className="gem gem-outer">
          <div className="gem gem-inner">✦</div>
        </div>
      </div>
      <div className="game-caption">
        <span>TURN-BASED BATTLES</span>
        <strong>ENCANTADIA</strong>
        <small>JAVA &amp; SWING GAME</small>
      </div>
    </div>
  );
}

function ProjectActionButtons({ project }) {
  const isInDevelopment = project.status === 'in-development' || project.id === 'empathtune-web';

  if (isInDevelopment) {
    return (
      <div className="tech-context-action-wrap">
        <button
          type="button"
          disabled
          className="tech-drawer-btn tech-drawer-btn--disabled"
          aria-disabled="true"
        >
          <span className="tech-drawer-btn__dot" aria-hidden="true" />
          <span>In Development</span>
        </button>
      </div>
    );
  }

  const hasDemo = Boolean(project.demoUrl);
  const hasRepo = Boolean(project.repoUrl);

  if (!hasDemo && !hasRepo) return null;

  return (
    <div className="tech-context-action-wrap">
      {hasDemo && (
        <a
          href={project.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tech-drawer-btn"
          aria-label={`${project.demoLabel || 'View Figma Prototype'} for ${project.name}`}
        >
          <span>{project.demoLabel || 'View Figma Prototype'}</span>
          <ExternalLink size={13} aria-hidden="true" />
        </a>
      )}
      {hasRepo && (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tech-drawer-btn"
          aria-label={`${project.repoLabel || 'View GitHub Repo'} for ${project.name}`}
        >
          <Github size={13} aria-hidden="true" />
          <span>{project.repoLabel || 'View GitHub Repo'}</span>
          <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  featured,
  onOpen,
  motionEnabled,
  motionSuspended,
  onAnnounce,
  ctaLabel = 'View project details',
}) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const handleOpen = trigger => onOpen(project, trigger);
  const galleryCount = Array.isArray(project.gallery) ? project.gallery.length : 0;
  const bullets =
    Array.isArray(project.bullets) && project.bullets.length > 0
      ? project.bullets
      : project.highlights;
  const isRecognitionCard = project.visual === 'achievement';

  return (
    <TiltCard
      as="article"
      className={`project-card ${featured ? 'featured' : ''} ${detailsExpanded ? 'is-expanded' : ''}`}
      tiltClassName="project-card__tilt"
      surfaceClassName={`project-card__surface ${isRecognitionCard ? 'card uiverse-3d-card' : ''}`.trim()}
      enabled={motionEnabled}
      suspended={motionSuspended}
      intensity={featured ? 1.8 : 2.5}
      lift={featured ? 2 : 3}
    >
      {project.image ? (
        <div className="project-visual-frame tilt-depth">
          <ProjectVisual
            project={project}
            onOpen={handleOpen}
            effectsEnabled={motionEnabled}
            onAnnounce={onAnnounce}
          />
          <span className="visual-label">
            {galleryCount > 1 ? (
              <>
                <Images size={12} aria-hidden="true" />
                <span>{galleryCount} artifacts</span>
              </>
            ) : (
              'Project preview'
            )}
          </span>
        </div>
      ) : (
        <button
          type="button"
          className="project-image-button tilt-depth"
          onClick={event => handleOpen(event.currentTarget)}
          aria-label={`View details for ${project.name}`}
        >
          <ProjectVisual project={project} effectsEnabled={motionEnabled} />
          <span className="visual-label">
            {project.visual === 'achievement' ? 'Verified recognition' : 'Concept preview'}
          </span>
        </button>
      )}
      <div className="project-body tilt-depth tilt-depth--near">
        <div className="project-meta">
          <span>{project.type}</span>
          <span className="project-status-badge">{project.status}</span>
        </div>
        <div className="project-title-row">
          {isRecognitionCard ? (
            <h2 className="project-title">{project.name}</h2>
          ) : (
            <h3 className="project-title">{project.name}</h3>
          )}
          <button
            type="button"
            className="round-button"
            onClick={event => handleOpen(event.currentTarget)}
            aria-label={`View details for ${project.name}`}
          >
            <Arrow diagonal size={18} />
          </button>
        </div>
        {(project.role || project.context || project.team) && (
          <p className="project-contribution">
            {project.role ? (
              <>
                <strong>Role:</strong> {project.role}
                {project.team ? ` · ${project.team}` : ''}
                {project.context ? ` · ${project.context}` : ''}
              </>
            ) : (
              project.context
            )}
          </p>
        )}
        <p className="project-summary">{project.summary}</p>
        <div className="tag-row">
          {project.tags.map(tag => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className="project-card-actions">
          <button
            type="button"
            className={`tech-context-toggle ${detailsExpanded ? 'is-expanded' : ''}`}
            aria-expanded={detailsExpanded}
            aria-controls={`tech-drawer-${project.id}`}
            onClick={() => {
              setDetailsExpanded(prev => {
                const next = !prev;
                onAnnounce?.(
                  `${next ? 'Expanded' : 'Collapsed'} details and tech stack context for ${project.name}.`,
                );
                return next;
              });
            }}
          >
            <Terminal size={13} aria-hidden="true" className="tech-context-toggle__terminal" />
            <span>View Details &amp; Tech Stack</span>
            <ChevronDown size={14} aria-hidden="true" className="tech-context-toggle__chevron" />
          </button>

          <button
            type="button"
            className="project-link"
            onClick={event => handleOpen(event.currentTarget)}
          >
            {ctaLabel} <Arrow diagonal size={14} />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {detailsExpanded && (
            <motion.div
              id={`tech-drawer-${project.id}`}
              className="tech-context-drawer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="tech-context-drawer__inner">
                {bullets.length > 0 && (
                  <div className="tech-context-block">
                    <span className="tech-context-label">// KEY HIGHLIGHTS &amp; DELIVERABLES</span>
                    <ul className="tech-context-bullets">
                      {bullets.map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {project.techStackContext && (
                  <div className="tech-context-block">
                    <span className="tech-context-label">// TECH STACK CONTEXT</span>
                    <p className="tech-context-paragraph">{project.techStackContext}</p>
                  </div>
                )}
                <ProjectActionButtons project={project} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TiltCard>
  );
}

function Projects({ items = portfolioProjects, onOpen, motionEnabled, motionSuspended, onAnnounce }) {
  const projectList = normalizeProjects(items);
  return (
    <section className="section work-section" id="work" aria-labelledby="work-title">
      <div className="container">
        <div className="section-header">
          <ScrollReveal delay={0}>
            <span className="section-micro-label">[ 02 ] // SHOWCASE</span>
            <h2 id="work-title" className="section-heading">
              Selected Projects
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <p className="section-subtitle">
              Selected production and academic software systems engineered with strict OOP principles and verified database states.
            </p>
          </ScrollReveal>
        </div>
        {/* Delay 4: Project Cards (0.45s delay, staggered by 0.1s for each card) */}
        <div className="projects-grid">
          {projectList.map((project, index) => (
            <ScrollReveal
              key={project.id}
              delay={0.25 + index * 0.08}
              className="projects-grid__item"
            >
              <ProjectCard
                project={project}
                featured={false}
                onOpen={onOpen}
                motionEnabled={motionEnabled}
                motionSuspended={motionSuspended}
                onAnnounce={onAnnounce}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HackathonsSection({
  items = portfolioHackathons,
  onOpen,
  motionEnabled,
  motionSuspended,
  onAnnounce,
}) {
  const normalized = normalizeProjects(items);

  return (
    <section
      className="section hackathons-section"
      id="hackathons"
      aria-labelledby="hackathons-title"
    >
      <div className="container">
        <div className="hackathons-header-row">
          <div className="section-header">
            <ScrollReveal delay={0}>
              <span className="section-micro-label">[ 03 ] // CONTESTS</span>
              <h2 id="hackathons-title" className="section-heading">
                Hackathons &amp; Competitions
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.12}>
              <p className="section-subtitle">
                Rapid-prototyped competition builds, civic healthtech solutions, and logistics automation challenges.
              </p>
            </ScrollReveal>
          </div>
          <div className="scan-manifest-pill" aria-label="Local asset scanner summary">
            <FolderGit2 size={15} aria-hidden="true" />
            <span>
              Scanned <strong>{normalized.length}</strong> competition builds
            </span>
          </div>
        </div>

        {/* Hackathon Cards Grid */}
        <div className="projects-grid hackathons-grid">
          {normalized.map((contest, index) => (
            <ScrollReveal
              key={contest.id}
              delay={0.25 + index * 0.08}
              className="projects-grid__item"
            >
              <ProjectCard
                project={contest}
                featured={false}
                onOpen={onOpen}
                motionEnabled={motionEnabled}
                motionSuspended={motionSuspended}
                onAnnounce={onAnnounce}
                ctaLabel="View hackathon details"
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeadershipSection({ items = leadershipExperiences }) {
  return (
    <section className="section leadership-section" id="leadership" aria-labelledby="leadership-title">
      <div className="container">
        <div className="section-header">
          <ScrollReveal delay={0}>
            <span className="section-micro-label">[ 05 ] // EXPERIENCE &amp; LEADERSHIP</span>
            <h2 id="leadership-title" className="section-heading">
              Experience &amp; Leadership
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <p className="section-subtitle">
              Technical direction across academic software architectures, competitive hackathons, and student engineering communities.
            </p>
          </ScrollReveal>
        </div>

        <div className="leadership-grid">
          {items.map((entry, index) => (
            <ScrollReveal
              key={entry.id || entry.title}
              delay={0.25 + index * 0.07}
              className="leadership-grid__item"
            >
              <TiltCard
                as="article"
                className="leadership-card"
                tiltClassName="leadership-card__tilt"
                surfaceClassName="leadership-card__surface card uiverse-3d-card"
                enabled={true}
                intensity={2.2}
                lift={3}
              >
                <div className="leadership-card__header tilt-depth">
                  <div className="leadership-card__meta-row">
                    {entry.orgLogo && (
                      <span className="leadership-card__logo-wrap" aria-hidden="true">
                        <img
                          src={entry.orgLogo}
                          alt={entry.organization || ''}
                          width="48"
                          height="48"
                          loading="lazy"
                        />
                      </span>
                    )}
                    <span className="leadership-card__badge">{entry.badge || entry.category}</span>
                    <span className="leadership-card__period">{entry.period}</span>
                  </div>
                  <h3 className="leadership-card__role">{entry.role}</h3>
                  <h4 className="leadership-card__title">{entry.title}</h4>
                  <span className="leadership-card__org">{entry.organization}</span>
                </div>
                <ul className="leadership-card__bullets tilt-depth">
                  {entry.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecognitionsSection({
  items = portfolioRecognitions,
  onOpen,
  motionEnabled,
  motionSuspended,
  onAnnounce,
}) {
  const normalized = normalizeProjects(items);

  return (
    <section
      className="section recognitions-section"
      id="recognitions"
      aria-labelledby="recognitions-title"
    >
      <div className="container">
        <div className="section-header">
          <ScrollReveal delay={0}>
            <span className="section-micro-label">[ 06 ] // RECOGNITIONS</span>
            <h2 id="recognitions-title" className="section-heading">
              Awards &amp; Recognitions
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <p className="section-subtitle">
              Academic honors, scholarship distinctions, and institutional recognition at Cebu Institute of Technology – University.
            </p>
          </ScrollReveal>
        </div>

        <div className="projects-grid recognitions-grid">
          {normalized.map((award, index) => (
            <ScrollReveal
              key={award.id}
              delay={0.25 + index * 0.1}
              className="projects-grid__item"
            >
              <ProjectCard
                project={award}
                featured={false}
                onOpen={onOpen}
                motionEnabled={motionEnabled}
                motionSuspended={motionSuspended}
                onAnnounce={onAnnounce}
                ctaLabel="View award details"
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function EducationRecognition() {
  return (
    <section className="section education-section" id="education" aria-labelledby="education-title">
      <div className="container">
        <div className="section-header">
          <ScrollReveal delay={0}>
            <h2 id="education-title" className="section-heading">
              Education &amp; Academic Background
            </h2>
          </ScrollReveal>
        </div>
        <div className="education-layout">
          <ScrollReveal delay={0.3} className="education-details">
            <span className="fact-label">Education</span>
            <h3>{profile.degree}</h3>
            <p>{profile.school}</p>
            <span className="education-period">{profile.graduation}</span>
          </ScrollReveal>
          <ScrollReveal delay={0.4} className="recognition-list">
            <span className="fact-label">Summary of Honors</span>
            <ul>
              {recognition.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact-section container" id="contact" aria-labelledby="contact-title">
      <div className="contact-panel">
        <div className="contact-inner">
          <div className="contact-main">
            <div className="contact-intro">
              <ScrollReveal delay={0}>
                <span className="section-micro-label">[ 07 ] // CONTACT</span>
                <h2 id="contact-title">Contact</h2>
              </ScrollReveal>
              <ScrollReveal delay={0.12}>
                <p>
                  Available for software engineering internships, technical collaborations, and student community initiatives.
                </p>
                <div className="contact-actions">
                  <BrandRollingButton
                    href={`mailto:${profile.email}`}
                    text={
                      <span className="inline-flex items-center gap-2">
                        Email me <Arrow diagonal size={16} />
                      </span>
                    }
                  />
                  <a
                    className="button button-secondary"
                    href={profile.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Telegram <Arrow diagonal size={15} />
                  </a>
                  <a
                    className="resume-download-btn"
                    href="/assets/Kenji_Resume.pdf"
                    download="Kenji_Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download Kenji's Resume (PDF)"
                  >
                    <span>Download Resume</span>
                    <svg viewBox="0 0 256 256" height="32" width="38" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M74.34 85.66a8 8 0 0 1 11.32-11.32L120 108.69V24a8 8 0 0 1 16 0v84.69l34.34-34.35a8 8 0 0 1 11.32 11.32l-48 48a8 8 0 0 1-11.32 0ZM240 136v64a16 16 0 0 1-16 16H32a16 16 0 0 1-16-16v-64a16 16 0 0 1 16-16h52.4a4 4 0 0 1 2.83 1.17L111 145a24 24 0 0 0 34 0l23.8-23.8a4 4 0 0 1 2.8-1.2H224a16 16 0 0 1 16 16m-40 32a12 12 0 1 0-12 12a12 12 0 0 0 12-12" fill="currentColor"></path>
                    </svg>
                  </a>
                </div>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={0.45} className="contact-details">
              <div className="contact-field">
                <span>Email</span>
                <a href={`mailto:${profile.email}`}>
                  <span>{profile.email}</span>
                  <Arrow diagonal size={15} />
                </a>
              </div>
              <div className="contact-field contact-phone">
                <span>Cell / Telegram</span>
                <a href={profile.phoneUrl} aria-label={`Call Kenji at ${profile.phone}`}>
                  <span>{profile.phone}</span>
                  <Arrow diagonal size={15} />
                </a>
              </div>
              <div className="contact-location">
                <MapPin size={15} aria-hidden="true" />
                <span>{profile.location}</span>
              </div>
              <SocialLinks links={socialLinks} />
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer container">
      <Brand />
      <span>© {new Date().getFullYear()} DIRK KENJI BALILI</span>
      <a href="#top" className="footer-top-link">
        BACK TO TOP ↑
      </a>
    </footer>
  );
}

function ProjectDialog({ project, onClose, effectsEnabled = true, onAnnounce }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [asyncState, setAsyncState] = useState({
    status: 'idle',
    projectId: null,
    extraHighlights: null,
  });

  useEffect(() => {
    setSelectedGalleryIndex(0);
    const node = dialogRef.current;
    if (project && node && !node.open) {
      node.showModal();
      closeButtonRef.current?.focus({ preventScroll: true });
    }
  }, [project]);

  // Support optional async detail loaders (`project.loadDetails`) without delaying local content.
  useEffect(() => {
    if (!project || typeof project.loadDetails !== 'function') {
      setAsyncState({ status: 'idle', projectId: project?.id || null, extraHighlights: null });
      return undefined;
    }
    let cancelled = false;
    const controller = new AbortController();
    setAsyncState(prev => ({
      status: 'loading',
      projectId: project.id,
      // Retain existing content during background refresh of the same project.
      extraHighlights: prev.projectId === project.id ? prev.extraHighlights : null,
    }));

    Promise.resolve(project.loadDetails({ signal: controller.signal }))
      .then(result => {
        if (cancelled) return;
        setAsyncState({
          status: 'ready',
          projectId: project.id,
          extraHighlights: Array.isArray(result?.highlights) ? result.highlights : [],
        });
      })
      .catch(error => {
        if (cancelled || error?.name === 'AbortError') return;
        setAsyncState(prev => ({
          status: 'error',
          projectId: project.id,
          extraHighlights: prev.projectId === project.id ? prev.extraHighlights : null,
        }));
        onAnnounce?.(`Additional details for ${project.name} could not load.`);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [project, onAnnounce]);

  const keepFocusInside = event => {
    if (event.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const controls = [
      ...dialog.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'),
    ].filter(control => control.getClientRects().length > 0);
    if (!controls.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last || document.activeElement === dialog)
    ) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!project) return null;

  const gallery = Array.isArray(project.gallery) ? project.gallery : [];
  const activeGalleryItem = gallery[selectedGalleryIndex] || null;

  const isDetailPending =
    asyncState.status === 'loading' &&
    asyncState.projectId === project.id &&
    !asyncState.extraHighlights;
  const displayHighlights =
    asyncState.projectId === project.id && Array.isArray(asyncState.extraHighlights)
      ? asyncState.extraHighlights
      : project.highlights;

  return (
    <dialog
      className="project-dialog"
      ref={dialogRef}
      aria-labelledby="dialog-title"
      aria-modal="true"
      onClose={onClose}
      onKeyDown={keepFocusInside}
      onClick={event => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="dialog-inner">
        <button
          ref={closeButtonRef}
          type="button"
          className="dialog-close"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close project details"
        >
          <X size={19} aria-hidden="true" />
        </button>
        <div className="dialog-visual">
          <div className="dialog-visual__stage">
            <ProjectVisual
              project={project}
              overrideSrc={activeGalleryItem?.src}
              overrideAlt={activeGalleryItem?.caption}
              effectsEnabled={effectsEnabled}
              priority={true}
              onAnnounce={onAnnounce}
            />
            <span className="visual-label">
              {activeGalleryItem
                ? `${selectedGalleryIndex + 1} / ${gallery.length} · ${activeGalleryItem.fileName}`
                : project.image
                  ? 'Project preview'
                  : 'Concept preview'}
            </span>
          </div>
          {gallery.length > 1 && (
            <div className="dialog-gallery" aria-label="Scanned project artifacts gallery">
              <div className="dialog-gallery__thumbs">
                {gallery.map((item, idx) => (
                  <button
                    key={item.fileName || idx}
                    type="button"
                    className={`dialog-gallery__thumb ${idx === selectedGalleryIndex ? 'is-selected' : ''}`}
                    onClick={() => {
                      setSelectedGalleryIndex(idx);
                      onAnnounce?.(
                        `Viewing artifact ${idx + 1} of ${gallery.length}: ${item.caption}`,
                      );
                    }}
                    aria-label={`View artifact ${idx + 1}: ${item.caption}`}
                    aria-pressed={idx === selectedGalleryIndex}
                  >
                    <img src={item.src} alt="" loading="lazy" decoding="async" />
                    <span>{item.fileName}</span>
                  </button>
                ))}
              </div>
              {activeGalleryItem?.caption && (
                <p className="dialog-gallery__caption">{activeGalleryItem.caption}</p>
              )}
            </div>
          )}
        </div>
        <div className="dialog-content" aria-busy={isDetailPending ? 'true' : undefined}>
          <div className="project-meta">
            <span>{project.type}</span>
            <span className="project-status-badge">{project.status}</span>
          </div>
          <h2 id="dialog-title">
            {project.name}
            <span className="period">.</span>
          </h2>
          <p className="dialog-lead">{project.description}</p>
          {(project.context || project.role || project.organizer || project.team || project.sourceFolder) && (
            <div className="dialog-meta">
              {project.context && (
                <div>
                  <span>Context</span>
                  <strong>{project.context}</strong>
                </div>
              )}
              {project.role && (
                <div>
                  <span>Role</span>
                  <strong>{project.role}</strong>
                </div>
              )}
              {project.team && (
                <div>
                  <span>Team</span>
                  <strong>{project.team}</strong>
                </div>
              )}
              {project.sourceFolder && (
                <div>
                  <span>Local Source</span>
                  <code>{project.sourceFolder}</code>
                </div>
              )}
            </div>
          )}
          {isDetailPending ? (
            <div className="dialog-block">
              <h3>Project details</h3>
              <div className="dialog-skeleton-stack">
                <Skeleton active={true} delayMs={150} effectsEnabled={effectsEnabled} className="skeleton--line" />
                <Skeleton active={true} delayMs={150} effectsEnabled={effectsEnabled} className="skeleton--line skeleton--line-short" />
              </div>
            </div>
          ) : (
            displayHighlights.length > 0 && (
              <div className="dialog-block">
                <h3>Key highlights</h3>
                <ul>
                  {displayHighlights.map(item => (
                    <li key={item}>
                      <span aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
          {project.techStackContext && (
            <div className="dialog-block dialog-tech-context">
              <h3>Tech Stack Context</h3>
              <p className="tech-context-paragraph">{project.techStackContext}</p>
            </div>
          )}
          {project.tags.length > 0 && (
            <div className="dialog-block">
              <h3>Technologies &amp; Focus</h3>
              <div className="tag-row">
                {project.tags.map(tag => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="dialog-action-row">
            <ProjectActionButtons project={project} />
          </div>
          <button
            type="button"
            className="text-link dialog-back"
            onClick={() => dialogRef.current?.close()}
          >
            <ArrowLeft size={16} /> Back to portfolio
          </button>
        </div>
      </div>
    </dialog>
  );
}

function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const projectTriggerRef = useRef(null);

  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  );
  const [ambientEnabled, setAmbientEnabled] = useState(() => {
    try {
      return localStorage.getItem('kenji-portfolio-ambient') !== 'off';
    } catch {
      return true;
    }
  });
  const [themeChosen, setThemeChosen] = useState(() => {
    try {
      return ['light', 'dark'].includes(localStorage.getItem('kenji-portfolio-theme'));
    } catch {
      return false;
    }
  });

  const announce = useCallback(message => {
    setStatusMessage(message || '');
  }, []);

  useEffect(() => {
    if (themeChosen || !window.matchMedia) return undefined;
    const preference = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = () => setTheme(preference.matches ? 'dark' : 'light');
    syncTheme();
    if (preference.addEventListener) preference.addEventListener('change', syncTheme);
    else preference.addListener(syncTheme);
    return () => {
      if (preference.removeEventListener) preference.removeEventListener('change', syncTheme);
      else preference.removeListener(syncTheme);
    };
  }, [themeChosen]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#02030a' : '#f0f0f0');
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.effects = ambientEnabled ? 'on' : 'off';
  }, [ambientEnabled]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeChosen(true);
    setTheme(nextTheme);
    announce(`Switched to ${nextTheme} mode.`);
    try {
      localStorage.setItem('kenji-portfolio-theme', nextTheme);
    } catch {
      /* Keep the current session usable when storage is unavailable. */
    }
  };

  const toggleAmbient = () => {
    const nextEnabled = !ambientEnabled;
    setAmbientEnabled(nextEnabled);
    announce(`Decorative effects turned ${nextEnabled ? 'on' : 'off'}.`);
    try {
      localStorage.setItem('kenji-portfolio-ambient', nextEnabled ? 'on' : 'off');
    } catch {
      /* Keep the current session usable when storage is unavailable. */
    }
  };

  const openProject = useCallback((project, trigger) => {
    if (trigger) projectTriggerRef.current = trigger;
    setSelectedProject(project);
  }, []);

  const closeProject = useCallback(() => {
    setSelectedProject(null);
    window.requestAnimationFrame(() => {
      if (projectTriggerRef.current?.isConnected) {
        projectTriggerRef.current.focus({ preventScroll: true });
      }
    });
  }, []);

  const [techModalOpen, setTechModalOpen] = useState(false);
  const anyModalOpen = Boolean(selectedProject) || techModalOpen;

  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      const valid = ['about', 'work', 'hackathons', 'skills', 'leadership', 'recognitions', 'contact'];
      if (valid.includes(hashId)) return hashId;
    }
    return 'about';
  });
  const isNavigatingRef = useRef(false);
  const navigatingTimerRef = useRef(null);

  useEffect(() => {
    const sectionIds = [
      'about',
      'work',
      'hackathons',
      'skills',
      'leadership',
      'recognitions',
      'contact',
    ];
    const sectionEls = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (sectionEls.length === 0) return undefined;

    let ticking = false;

    const handleScroll = () => {
      if (isNavigatingRef.current) return;
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const scrollY = window.scrollY;
        if (scrollY < 200) {
          setActiveSection('about');
          return;
        }
        if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 70) {
          setActiveSection('contact');
          return;
        }

        const headerLine = 160;
        let matchedId = null;
        for (const el of sectionEls) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerLine && rect.bottom > headerLine) {
            matchedId = el.id;
            break;
          }
        }
        if (matchedId) {
          setActiveSection(matchedId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNavigate = useCallback(id => {
    setActiveSection(id);
    isNavigatingRef.current = true;
    if (navigatingTimerRef.current) clearTimeout(navigatingTimerRef.current);
    navigatingTimerRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 900);

    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
    }
  }, []);

  return (
    <>
      <LiveStatus message={statusMessage} />
      <AmbientBackground enabled={ambientEnabled} theme={theme} suspended={anyModalOpen} />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header
        theme={theme}
        onThemeToggle={toggleTheme}
        ambientEnabled={ambientEnabled}
        onAmbientToggle={toggleAmbient}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />
      <main id="main">
        <div id="top" />
        <Hero theme={theme} effectsEnabled={ambientEnabled} modalOpen={anyModalOpen} />
        <About effectsEnabled={ambientEnabled} />
        <Projects
          onOpen={openProject}
          motionEnabled={ambientEnabled}
          motionSuspended={anyModalOpen}
          onAnnounce={announce}
        />
        <HackathonsSection
          onOpen={openProject}
          motionEnabled={ambientEnabled}
          motionSuspended={anyModalOpen}
          onAnnounce={announce}
        />
        <TechJourney
          items={techJourney}
          projectItems={portfolioProjects}
          effectsEnabled={ambientEnabled}
          onModalChange={setTechModalOpen}
          onSelectProject={openProject}
        />
        <LeadershipSection />
        <RecognitionsSection
          onOpen={openProject}
          motionEnabled={ambientEnabled}
          motionSuspended={anyModalOpen}
          onAnnounce={announce}
        />
        <EducationRecognition />
        <Contact />
      </main>
      <Footer />
      <ProjectDialog
        project={selectedProject}
        onClose={closeProject}
        effectsEnabled={ambientEnabled}
        onAnnounce={announce}
      />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
