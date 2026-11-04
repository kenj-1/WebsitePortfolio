import { useCallback, useEffect, useRef, useState } from 'react';
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
} from 'lucide-react';
import { profile, socialLinks, recognition, leadershipExperiences, academicAwards } from './content';
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

function Header({ theme, onThemeToggle, ambientEnabled, onAmbientToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);
  const links = [
    { href: '#work', label: 'Projects' },
    { href: '#hackathons', label: 'Contests' },
    { href: '#leadership', label: 'Leadership' },
    { href: '#recognitions', label: 'Awards' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ];

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
        <div className="nav-links">
          {links.map(link => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <a className="nav-cta" href="#contact">
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
          <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
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
    <section className="hero-section hero-eclipse" aria-labelledby="hero-title">
      {/* The Glowing Arc */}
      <div className="hero-eclipse-arc" aria-hidden="true" />

      <div className="hero-eclipse-inner container">
        <ScrollReveal delay={0}>
          <p className="hero-producer-label">
            <span className="status-dot" aria-hidden="true" />
            <span>A Kenji Balili Production</span>
          </p>
        </ScrollReveal>

        {/* Main Title in Citadel Architectural Display Font */}
        <ScrollReveal delay={0.12}>
          <h1 id="hero-title" className="hero-headline-eclipse">
            Website Portfolio
          </h1>
        </ScrollReveal>

        {/* Core Role & Soft Light Editorial Accent */}
        <ScrollReveal delay={0.22}>
          <div className="hero-role-display">
            <span className="hero-core-role">SOFTWARE DEVELOPER &amp; PRODUCT BUILDER</span>
            <span className="hero-accent-text">Crafting intelligent interfaces &amp; scalable digital systems</span>
          </div>
        </ScrollReveal>

        {/* Action Buttons */}
        <ScrollReveal delay={0.32} className="hero-actions hero-actions-centered">
          <a className="button button-primary" href="#work">
            View Projects <Arrow diagonal size={16} />
          </a>
          <a className="button button-secondary" href="#hackathons">
            Contests <Arrow diagonal size={15} />
          </a>
        </ScrollReveal>
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
              <h2 id="about-title" className="section-heading">
                About Me
              </h2>
            </ScrollReveal>
          </div>
          <div className="about-content">
            {/* Delay 3: Paragraph Text / Description (0.3s delay) */}
            <ScrollReveal delay={0.3}>
              <p className="about-lead">
                I’m an Information Technology student at Cebu Institute of Technology – University (CIT–U),
                focusing on software architecture, rapid-prototyped systems, and accessible interfaces.
              </p>
              <p className="about-subtext">
                Alongside leading technical projects and hackathon teams, I serve across student engineering
                organizations and explore creative computing, photography, and music.
              </p>
              <div className="about-highlights">
                <span className="about-chip">CIT–U Academic Achiever</span>
                <span className="about-chip">Dean’s Lister 2025–2026</span>
                <span className="about-chip">Hackathon Builder</span>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Delay 4: Interactive Photo Slider / Gallery (0.45s delay) */}
        <ScrollReveal delay={0.45} className="about-gallery-wrap">
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

  return (
    <article
      className={`project-card ${featured ? 'featured' : ''} ${detailsExpanded ? 'is-expanded' : ''}`}
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
          <h3>{project.name}</h3>
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
    </article>
  );
}

function Projects({ items = portfolioProjects, onOpen, motionEnabled, motionSuspended, onAnnounce }) {
  const projectList = normalizeProjects(items);
  return (
    <section className="section work-section" id="work" aria-labelledby="work-title">
      <div className="container">
        <div className="section-header">
          <ScrollReveal delay={0}>
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
              delay={0.45 + index * 0.1}
              className={index === 0 ? 'projects-grid__featured' : 'projects-grid__item'}
            >
              <ProjectCard
                project={project}
                featured={index === 0}
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
          {normalized.map((contest, index) => {
            const isFeatured = index === 0;
            return (
              <ScrollReveal
                key={contest.id}
                delay={0.35 + index * 0.1}
                className={isFeatured ? 'projects-grid__featured' : 'projects-grid__item'}
              >
                <ProjectCard
                  project={contest}
                  featured={isFeatured}
                  onOpen={onOpen}
                  motionEnabled={motionEnabled}
                  motionSuspended={motionSuspended}
                  onAnnounce={onAnnounce}
                  ctaLabel="View hackathon details"
                />
              </ScrollReveal>
            );
          })}
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
              <article className="leadership-card">
                <div className="leadership-card__header">
                  <div className="leadership-card__meta-row">
                    {entry.orgLogo && (
                      <span className="leadership-card__logo-wrap" aria-hidden="true">
                        <img src={entry.orgLogo} alt="" width="32" height="32" loading="lazy" />
                      </span>
                    )}
                    <span className="leadership-card__badge">{entry.badge || entry.category}</span>
                    <span className="leadership-card__period">{entry.period}</span>
                  </div>
                  <h3 className="leadership-card__role">{entry.role}</h3>
                  <h4 className="leadership-card__title">{entry.title}</h4>
                  <span className="leadership-card__org">{entry.organization}</span>
                </div>
                <ul className="leadership-card__bullets">
                  {entry.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </article>
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
                <h2 id="contact-title">Contact</h2>
              </ScrollReveal>
              <ScrollReveal delay={0.12}>
                <p>
                  Available for software engineering internships, technical collaborations, and student community initiatives.
                </p>
                <div className="contact-actions">
                  <a className="button button-primary" href={`mailto:${profile.email}`}>
                    Email me <Arrow diagonal size={16} />
                  </a>
                  <a
                    className="button button-secondary"
                    href={profile.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Telegram <Arrow diagonal size={15} />
                  </a>
                  <a
                    className="button button-resume contact-resume-btn"
                    href="/Kenji_Resume.pdf"
                    download="Kenji_Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download Kenji's Resume (PDF)"
                  >
                    <Download size={15} aria-hidden="true" />
                    <span>Download Resume</span>
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

  const anyModalOpen = Boolean(selectedProject);

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
      />
      <main id="main">
        <div id="top" />
        <Hero theme={theme} effectsEnabled={ambientEnabled} modalOpen={anyModalOpen} />
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
        <LeadershipSection />
        <RecognitionsSection
          onOpen={openProject}
          motionEnabled={ambientEnabled}
          motionSuspended={anyModalOpen}
          onAnnounce={announce}
        />
        <About effectsEnabled={ambientEnabled} />
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
