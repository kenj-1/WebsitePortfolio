import {
  discoveredLogoUrl,
  scannedHackathons,
  scannedAchievements,
  scannedProjects,
  scannedMePhotos,
  scannedTechStack,
  scannedSummary,
} from 'virtual:portfolio-assets';
import { projects as staticProjects, academicAwards as staticAcademicAwards } from './content';
import fallbackMe1 from './assets/me/image_7ee6e6.jpg';
import fallbackMe2 from './assets/me/image_7ee6a3.jpg';

const staticMePhotos = [
  {
    id: 'me-photo-1',
    fileName: 'image_7ee6e6.jpg',
    src: fallbackMe1,
    alt: 'Dirk Kenji Balili',
    caption: 'Dirk Kenji Balili · Student Builder & Creator',
    objectPosition: '50% 18%',
  },
  {
    id: 'me-photo-2',
    fileName: 'image_7ee6a3.jpg',
    src: fallbackMe2,
    alt: 'Dirk Kenji Balili',
    caption: 'Student Developer · Fitting Room Mirror Selfie',
    objectPosition: '50% 20%',
  },
];

export const workspaceLogoUrl = discoveredLogoUrl || '/logo.png';
export const aboutMePhotos =
  Array.isArray(scannedMePhotos) && scannedMePhotos.length > 0
    ? scannedMePhotos
    : staticMePhotos;
export const scannedTechStackLogos = scannedTechStack || {};

function normalizeCardItem(item, index, defaultCategory = 'project') {
  const gallery = Array.isArray(item.gallery) ? item.gallery : [];
  const primaryImage = item.image || (gallery.length > 0 ? gallery[0].src : null);
  const bullets = Array.isArray(item.bullets) && item.bullets.length > 0
    ? item.bullets
    : Array.isArray(item.highlights)
      ? item.highlights
      : [];
  const highlights = Array.isArray(item.highlights) && item.highlights.length > 0
    ? item.highlights
    : bullets;

  return {
    ...item,
    id: item.id || `${defaultCategory}-${index}`,
    category: item.category || defaultCategory,
    image: primaryImage,
    gallery,
    artifactCount:
      typeof item.artifactCount === 'number' && item.artifactCount > 0
        ? item.artifactCount
        : gallery.length > 0
          ? gallery.length
          : 1,
    tags: Array.isArray(item.tags) ? item.tags : [],
    bullets,
    highlights,
    techStackContext: item.techStackContext || '',
  };
}

export const hackathonEntries = (Array.isArray(scannedHackathons) ? scannedHackathons : [])
  .map((item, idx) => normalizeCardItem(item, idx, 'hackathons'))
  .sort((a, b) => {
    // Prioritize Nagaalaga as the featured hackathon entry
    if (a.id === 'regional-nagacity-hackathon') return -1;
    if (b.id === 'regional-nagacity-hackathon') return 1;
    return 0;
  });

export const achievementEntries = (
  Array.isArray(scannedAchievements) ? scannedAchievements : []
).map((item, idx) => normalizeCardItem(item, idx, 'achievements'));

/**
 * Items for the "Hackathons & Competitions" section.
 * Contains exclusively hackathons and competitive prototyping events.
 * Academic awards and honors are moved to the dedicated Recognitions section.
 */
export const hackathonAndContestItems = [
  ...hackathonEntries,
];

/**
 * Academic awards and honors mapped for the dedicated Recognitions section.
 */
export const portfolioAwards = (() => {
  const byId = new Map();
  for (const award of staticAcademicAwards) {
    byId.set(award.id, normalizeCardItem(award, byId.size, 'achievements'));
  }
  for (const scanned of achievementEntries) {
    if (byId.has(scanned.id)) {
      const existing = byId.get(scanned.id);
      byId.set(scanned.id, {
        ...existing,
        ...scanned,
        summary: existing.summary || scanned.summary,
        description: existing.description || scanned.description,
        highlights: existing.highlights || scanned.highlights,
        orgLogo: existing.orgLogo || scanned.orgLogo,
      });
    } else {
      byId.set(scanned.id, scanned);
    }
  }
  return Array.from(byId.values());
})();

/**
 * Projects dynamically enriched from `assets/projects` and `src/content.js`.
 */
export const mergedPortfolioProjects = (() => {
  const scannedList = (Array.isArray(scannedProjects) ? scannedProjects : []).map((item, idx) =>
    normalizeCardItem(item, idx, 'projects'),
  );
  const byId = new Map();

  // Seed with static projects from content.js in the exact showcase order
  for (const base of staticProjects) {
    byId.set(base.id, normalizeCardItem(base, byId.size, 'projects'));
  }

  // Merge or append dynamically scanned projects from assets/projects/*
  for (const scanned of scannedList) {
    if (byId.has(scanned.id)) {
      const existing = byId.get(scanned.id);
      byId.set(scanned.id, {
        ...existing,
        ...scanned,
        image: scanned.image || existing.image,
        imageSrcSet: scanned.image ? undefined : existing.imageSrcSet,
        imageSizes: scanned.image ? undefined : existing.imageSizes,
        gallery: scanned.gallery.length > 0 ? scanned.gallery : existing.gallery || [],
        bullets:
          Array.isArray(scanned.bullets) && scanned.bullets.length > 0
            ? scanned.bullets
            : existing.bullets,
        highlights:
          Array.isArray(scanned.highlights) && scanned.highlights.length > 0
            ? scanned.highlights
            : existing.highlights,
        status: scanned.status || existing.status,
        repoUrl: scanned.repoUrl || existing.repoUrl,
        demoUrl: scanned.demoUrl || existing.demoUrl,
        demoLabel: scanned.demoLabel || existing.demoLabel,
        techStackContext: scanned.techStackContext || existing.techStackContext || '',
      });
    } else {
      byId.set(scanned.id, scanned);
    }
  }

  // Share the EmpathTune mood-prompt & Google OAuth/Supabase screenshots with EmpathTune (Web Development)
  const empathAndroid = byId.get('empathtune-android');
  const empathWeb = byId.get('empathtune-web');
  if (empathAndroid && empathWeb && (!empathWeb.image || empathWeb.gallery.length === 0)) {
    const androidGallery = Array.isArray(empathAndroid.gallery) ? empathAndroid.gallery : [];
    const loginShot = androidGallery.find(img => /login/i.test(img.fileName));
    const dashboardShot = androidGallery.find(img => /dashboard/i.test(img.fileName));
    const figmaShot = androidGallery.find(img => /figma/i.test(img.fileName));
    const webGallery = [loginShot, dashboardShot, figmaShot].filter(Boolean);

    byId.set('empathtune-web', {
      ...empathWeb,
      image: loginShot?.src || dashboardShot?.src || empathAndroid.image,
      gallery: webGallery.length > 0 ? webGallery : androidGallery,
      artifactCount: webGallery.length > 0 ? webGallery.length : androidGallery.length,
    });
  }

  // Also attach Oltek hackathon gallery to the ExcelLent project card if present
  const oltek = hackathonEntries.find(h => h.id === 'oltek-hackathon');
  if (oltek && byId.has('excellent')) {
    const existing = byId.get('excellent');
    byId.set('excellent', {
      ...existing,
      name: 'Excellent - Oltek',
      gallery: oltek.gallery.length > 0 ? oltek.gallery : existing.gallery || [],
      sourceFolder: oltek.sourceFolder,
      repoUrl: existing.repoUrl || oltek.repoUrl || 'https://github.com/kenj-1/Oltek.git',
      bullets:
        Array.isArray(existing.bullets) && existing.bullets.length > 0
          ? existing.bullets
          : oltek.bullets,
      highlights:
        Array.isArray(existing.highlights) && existing.highlights.length > 0
          ? existing.highlights
          : oltek.highlights,
      techStackContext: existing.techStackContext || oltek.techStackContext || '',
    });
  }

  return Array.from(byId.values());
})();

export const assetScanSummary = scannedSummary;
