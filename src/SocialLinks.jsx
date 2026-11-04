import { useEffect, useId, useState } from 'react';
import { ExternalLink, Facebook, Github, Instagram, Linkedin, Mail, Phone, Send, Youtube } from 'lucide-react';

const icons = { mail: Mail, phone: Phone, telegram: Send, github: Github, linkedin: Linkedin, instagram: Instagram, facebook: Facebook, youtube: Youtube };

function resolveLink(url) {
  if (typeof url !== 'string') return null;
  const href = url.trim();
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(href)) {
    const domain = href.slice(href.lastIndexOf('@') + 1);
    return /(^|\.)example\.(com|org|net)$/i.test(domain) ? null : { href, external: false };
  }
  if (/^tel:\+?[0-9]{7,15}$/.test(href)) return { href, external: false };

  try {
    const parsed = new URL(href);
    if (!['https:', 'http:'].includes(parsed.protocol) || !parsed.hostname || /(^|\.)example\.(com|org|net)$/i.test(parsed.hostname)) return null;
    return { href: parsed.href, external: true };
  } catch {
    return null;
  }
}

function SocialLink({ link, destination }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const tooltipId = useId();
  const visible = (hovered || focused) && !dismissed;
  const Icon = icons[link.icon] || ExternalLink;

  useEffect(() => {
    if (!hovered && !focused) setDismissed(false);
  }, [hovered, focused]);

  useEffect(() => {
    if (!visible) return;
    const dismissOnEscape = (event) => {
      if (event.key === 'Escape') setDismissed(true);
    };
    document.addEventListener('keydown', dismissOnEscape);
    return () => document.removeEventListener('keydown', dismissOnEscape);
  }, [visible]);

  return (
    <li className="social-links__item" data-open={visible}>
      <a
        className="social-links__anchor"
        href={destination.href}
        {...(destination.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        aria-label={link.label}
        aria-describedby={visible ? tooltipId : undefined}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <Icon size={21} strokeWidth={1.9} aria-hidden="true" focusable="false" />
        <span id={tooltipId} className="social-links__tooltip" role="tooltip" aria-hidden={!visible}>
          <span className="social-links__tooltip-text">{link.platform}</span>
        </span>
      </a>
    </li>
  );
}

export default function SocialLinks({ links = [] }) {
  const availableLinks = links
    .map((link) => ({ link, destination: resolveLink(link?.url) }))
    .filter(({ link, destination }) => destination && link.platform && link.label);

  if (availableLinks.length === 0) return null;

  return (
    <nav className="social-links" aria-label="Contact links">
      <ul className="social-links__list">
        {availableLinks.map(({ link, destination }) => (
          <SocialLink key={`${link.platform}-${destination.href}`} link={link} destination={destination} />
        ))}
      </ul>
    </nav>
  );
}
