import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const VIRTUAL_ID = 'virtual:portfolio-assets';
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_ID;
const TARGET_CATEGORIES = ['hackathons', 'achievements', 'projects'];
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.avif']);

function toTitleCaseFromSlug(slug) {
  return String(slug || '')
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, ch => ch.toUpperCase())
    .trim();
}

function parseMarkdownFile(content, fallbackSlug) {
  const lines = String(content || '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
  let title = toTitleCaseFromSlug(fallbackSlug);
  const bodyLines = [];
  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.slice(2).trim();
    } else if (!line.startsWith('#')) {
      bodyLines.push(line.replace(/^[-*]\s+/, ''));
    }
  }
  return {
    name: title,
    summary: bodyLines[0] || '',
    description: bodyLines.slice(0, 2).join(' '),
    highlights: bodyLines.slice(1, 5),
  };
}

/**
 * Dynamically scans `assets/hackathons`, `assets/achievements`, and `assets/projects`
 * using `fs.statSync` (safe for Windows OneDrive reparse-point directories).
 */
function scanLocalPortfolioAssets(rootDir) {
  const assetsRoot = path.join(rootDir, 'assets');
  const imports = [];
  let importCounter = 0;

  const registerImageImport = absFilePath => {
    const varName = `__asset_img_${importCounter++}`;
    const normalizedPath = absFilePath.replace(/\\/g, '/');
    imports.push(`import ${varName} from ${JSON.stringify(normalizedPath)};`);
    return varName;
  };

  const scanFolderEntry = (category, folderName, folderAbsPath) => {
    const rawNames = fs.existsSync(folderAbsPath) ? fs.readdirSync(folderAbsPath) : [];
    const imageFiles = [];
    const seenSizes = new Map();
    let jsonMeta = {};
    let mdMeta = {};

    // Sort so human-named files come before numeric hashes when deduplicating identical files
    const sortedNames = [...rawNames].sort((a, b) => {
      const aNumeric = /^\d/.test(a);
      const bNumeric = /^\d/.test(b);
      if (aNumeric !== bNumeric) return aNumeric ? 1 : -1;
      return a.localeCompare(b);
    });

    for (const fileName of sortedNames) {
      const fullPath = path.join(folderAbsPath, fileName);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }
      if (!stat.isFile()) continue;

      const ext = path.extname(fileName).toLowerCase();
      if (IMAGE_EXTENSIONS.has(ext)) {
        // Deduplicate byte-identical copies in the same folder (e.g. raw FB filename vs named copy)
        if (seenSizes.has(stat.size)) continue;
        seenSizes.set(stat.size, fileName);
        imageFiles.push({
          fileName,
          absPath: fullPath,
          relPath: `assets/${category}/${folderName}/${fileName}`,
          sizeBytes: stat.size,
        });
      } else if (ext === '.json') {
        try {
          const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          jsonMeta = { ...jsonMeta, ...parsed };
        } catch {
          /* Ignore malformed JSON */
        }
      } else if (ext === '.md') {
        try {
          const rawMd = fs.readFileSync(fullPath, 'utf-8');
          mdMeta = { ...mdMeta, ...parseMarkdownFile(rawMd, folderName) };
        } catch {
          /* Ignore unreadable MD */
        }
      }
    }

    // Skip completely empty folders with no images, JSON, or Markdown
    if (imageFiles.length === 0 && Object.keys(jsonMeta).length === 0 && Object.keys(mdMeta).length === 0) {
      return null;
    }

    // Order images so primaryImage (if specified) or main UI/output screenshot comes first
    const preferredPrimary = jsonMeta.primaryImage;
    imageFiles.sort((a, b) => {
      if (preferredPrimary) {
        if (a.fileName === preferredPrimary) return -1;
        if (b.fileName === preferredPrimary) return 1;
      }
      const aIsTeam = /team|pic/i.test(a.fileName);
      const bIsTeam = /team|pic/i.test(b.fileName);
      if (aIsTeam !== bIsTeam) return aIsTeam ? 1 : -1;
      return a.fileName.localeCompare(b.fileName);
    });

    const galleryExprs = imageFiles.map(img => {
      const varName = registerImageImport(img.absPath);
      const caption =
        jsonMeta.galleryCaptions?.[img.fileName] ||
        `${toTitleCaseFromSlug(folderName)} — ${toTitleCaseFromSlug(img.fileName)}`;
      return `{ fileName: ${JSON.stringify(img.fileName)}, src: ${varName}, caption: ${JSON.stringify(caption)}, sourcePath: ${JSON.stringify(img.relPath)} }`;
    });

    const merged = {
      id: jsonMeta.id || folderName,
      slug: folderName,
      category,
      sourceFolder: `assets/${category}/${folderName}`,
      name: jsonMeta.name || mdMeta.name || toTitleCaseFromSlug(folderName),
      event: jsonMeta.event || toTitleCaseFromSlug(folderName),
      organizer: jsonMeta.organizer || '',
      date: jsonMeta.date || '',
      team: jsonMeta.team || '',
      type:
        jsonMeta.type ||
        (category === 'hackathons'
          ? 'Hackathon & Competition'
          : category === 'achievements'
            ? 'Academic & Technical Achievement'
            : 'Software Project'),
      status:
        jsonMeta.status ||
        (category === 'hackathons'
          ? 'Hackathon Entry'
          : category === 'achievements'
            ? 'Recognition'
            : 'Project'),
      visual: jsonMeta.visual || (category === 'achievements' ? 'achievement' : 'document'),
      role: jsonMeta.role || '',
      context: jsonMeta.context || `Scanned from assets/${category}/${folderName}`,
      imageAlt:
        jsonMeta.imageAlt ||
        `${jsonMeta.name || toTitleCaseFromSlug(folderName)} preview`,
      summary:
        jsonMeta.summary ||
        mdMeta.summary ||
        `Dynamically discovered from assets/${category}/${folderName}.`,
      description:
        jsonMeta.description ||
        mdMeta.description ||
        jsonMeta.summary ||
        `Extracted from local directory assets/${category}/${folderName}.`,
      tags: Array.isArray(jsonMeta.tags) ? jsonMeta.tags : [],
      bullets: Array.isArray(jsonMeta.bullets)
        ? jsonMeta.bullets
        : Array.isArray(jsonMeta.highlights)
          ? jsonMeta.highlights
          : Array.isArray(mdMeta.highlights)
            ? mdMeta.highlights
            : [],
      highlights: Array.isArray(jsonMeta.highlights)
        ? jsonMeta.highlights
        : Array.isArray(jsonMeta.bullets)
          ? jsonMeta.bullets
          : Array.isArray(mdMeta.highlights)
            ? mdMeta.highlights
            : [],
      repoUrl: jsonMeta.repoUrl || '',
      demoUrl: jsonMeta.demoUrl || '',
      demoLabel: jsonMeta.demoLabel || '',
      techStackContext: jsonMeta.techStackContext || '',
      artifactCount: imageFiles.length,
    };

    const primaryImageExpr = galleryExprs.length > 0 ? `${galleryExprs[0]}.src` : 'null';

    return `{
      ...${JSON.stringify(merged)},
      image: ${primaryImageExpr},
      gallery: [${galleryExprs.join(', ')}]
    }`;
  };

  const categoryResults = {
    hackathons: [],
    achievements: [],
    projects: [],
  };

  for (const category of TARGET_CATEGORIES) {
    const categoryDir = path.join(assetsRoot, category);
    if (!fs.existsSync(categoryDir)) continue;

    const entries = fs.readdirSync(categoryDir).sort((a, b) => a.localeCompare(b));
    for (const entryName of entries) {
      const fullEntryPath = path.join(categoryDir, entryName);
      let stat;
      try {
        stat = fs.statSync(fullEntryPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        const folderItem = scanFolderEntry(category, entryName, fullEntryPath);
        if (folderItem) {
          categoryResults[category].push(folderItem);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(entryName).toLowerCase();
        const baseSlug = path.basename(entryName, ext);
        if (ext === '.json') {
          try {
            const parsed = JSON.parse(fs.readFileSync(fullEntryPath, 'utf-8'));
            const itemObj = {
              id: parsed.id || baseSlug,
              slug: baseSlug,
              category,
              sourceFolder: `assets/${category}/${entryName}`,
              name: parsed.name || toTitleCaseFromSlug(baseSlug),
              event: parsed.event || '',
              organizer: parsed.organizer || '',
              date: parsed.date || '',
              team: parsed.team || '',
              type: parsed.type || 'Academic & Technical Achievement',
              status: parsed.status || 'Recognition',
              visual: parsed.visual || 'achievement',
              role: parsed.role || '',
              context: parsed.context || `assets/${category}/${entryName}`,
              summary: parsed.summary || '',
              description: parsed.description || parsed.summary || '',
              tags: Array.isArray(parsed.tags) ? parsed.tags : [],
              bullets: Array.isArray(parsed.bullets)
                ? parsed.bullets
                : Array.isArray(parsed.highlights)
                  ? parsed.highlights
                  : [],
              highlights: Array.isArray(parsed.highlights)
                ? parsed.highlights
                : Array.isArray(parsed.bullets)
                  ? parsed.bullets
                  : [],
              techStackContext:
                parsed.techStackContext ||
                'Demonstrated consistent academic and technical excellence across core Computer Studies coursework, OOP architecture, relational databases, and full-stack software engineering.',
              artifactCount: 1,
              image: null,
              gallery: [],
            };
            categoryResults[category].push(JSON.stringify(itemObj));
          } catch {
            /* Ignore invalid JSON */
          }
        } else if (IMAGE_EXTENSIONS.has(ext)) {
          const varName = registerImageImport(fullEntryPath);
          const itemObj = {
            id: baseSlug,
            slug: baseSlug,
            category,
            sourceFolder: `assets/${category}/${entryName}`,
            name: toTitleCaseFromSlug(baseSlug),
            type:
              category === 'achievements'
                ? 'Academic & Technical Achievement'
                : 'Contest & Hackathon',
            status: 'Verified Artifact',
            visual: 'achievement',
            role: 'Academic Achiever · BS Information Technology',
            context: `Scanned from assets/${category}/${entryName}`,
            summary: `Recognized for academic excellence at Cebu Institute of Technology – University.`,
            description: `Verified academic recognition artifact dynamically scanned from assets/${category}/${entryName}.`,
            tags: [toTitleCaseFromSlug(category), 'CIT–U', 'Academic Excellence'],
            bullets: [
              'Recognized for outstanding academic performance at CIT–U',
              'Applied software engineering and OOP fundamentals across technical coursework',
            ],
            highlights: [
              'Recognized for outstanding academic performance at CIT–U',
              'Applied software engineering and OOP fundamentals across technical coursework',
            ],
            techStackContext:
              'Maintained honor-roll academic standing in BS Information Technology at CIT–U while actively leading software development teams and competing in regional hackathons.',
            artifactCount: 1,
          };
          categoryResults[category].push(
            `{ ...${JSON.stringify(itemObj)}, image: ${varName}, gallery: [{ fileName: ${JSON.stringify(entryName)}, src: ${varName}, caption: ${JSON.stringify(toTitleCaseFromSlug(baseSlug))}, sourcePath: ${JSON.stringify(`assets/${category}/${entryName}`)} }] }`,
          );
        }
      }
    }
  }

  // Scan assets/me for portraits and personal pictures
  const meDir = path.join(assetsRoot, 'me');
  const mePhotos = [];
  if (fs.existsSync(meDir)) {
    const meFiles = fs.readdirSync(meDir).sort();
    let meIdx = 0;
    for (const fileName of meFiles) {
      const fullPath = path.join(meDir, fileName);
      try {
        if (!fs.statSync(fullPath).isFile()) continue;
      } catch {
        continue;
      }
      const ext = path.extname(fileName).toLowerCase();
      if (IMAGE_EXTENSIONS.has(ext)) {
        const varName = registerImageImport(fullPath);
        const caption =
          fileName.includes('image_7ee6e6')
            ? 'Dirk Kenji Balili · Student Builder & Creator'
            : fileName.includes('image_7ee6a3')
              ? 'Student Developer · Fitting Room Mirror Selfie'
              : 'Campus Life & Community Building';
        const objectPos = fileName.includes('image_7ee6e6') ? '50% 18%' : '50% 20%';
        mePhotos.push(`{
          id: ${JSON.stringify(`me-photo-${meIdx + 1}`)},
          fileName: ${JSON.stringify(fileName)},
          src: ${varName},
          alt: ${JSON.stringify(`Dirk Kenji Balili photo ${meIdx + 1}`)},
          caption: ${JSON.stringify(caption)},
          objectPosition: ${JSON.stringify(objectPos)},
          sourcePath: ${JSON.stringify(`assets/me/${fileName}`)}
        }`);
        meIdx++;
      }
    }
  }

  // Scan assets/techstack for technology logos
  const techstackDir = path.join(assetsRoot, 'techstack');
  const techEntries = [];
  if (fs.existsSync(techstackDir)) {
    const techFiles = fs.readdirSync(techstackDir).sort();
    for (const fileName of techFiles) {
      const fullPath = path.join(techstackDir, fileName);
      try {
        if (!fs.statSync(fullPath).isFile()) continue;
      } catch {
        continue;
      }
      const ext = path.extname(fileName).toLowerCase();
      if (IMAGE_EXTENSIONS.has(ext)) {
        const varName = registerImageImport(fullPath);
        const lowerName = fileName.toLowerCase();
        let key = path.basename(fileName, ext);
        if (lowerName.includes('css')) key = 'css';
        else if (lowerName.includes('figma')) key = 'figma';
        else if (lowerName.includes('javascript') || lowerName.includes('js')) key = 'javascript';
        else if (lowerName.includes('python')) key = 'python';
        else if (lowerName.includes('react')) key = 'react';
        else if (lowerName.includes('sql')) key = 'sql';
        else if (lowerName.includes('supabase')) key = 'supabase';
        else if (lowerName.includes('tailwind')) key = 'tailwind-css';
        techEntries.push(`${JSON.stringify(key)}: ${varName}`);
      }
    }
  }

  // Check if the user dropped a custom transparent PNG logo in root or assets/me
  let discoveredLogoExpr = JSON.stringify('/logo.png');
  const candidateDirs = [
    { dir: rootDir, filter: name => /\.png$/i.test(name) },
    { dir: path.join(rootDir, 'assets', 'me'), filter: name => /\.png$/i.test(name) },
  ];
  for (const { dir, filter } of candidateDirs) {
    if (!fs.existsSync(dir)) continue;
    const found = fs.readdirSync(dir).find(name => {
      if (!filter(name)) return false;
      try {
        return fs.statSync(path.join(dir, name)).isFile();
      } catch {
        return false;
      }
    });
    if (found) {
      const varName = registerImageImport(path.join(dir, found));
      discoveredLogoExpr = varName;
      break;
    }
  }

  const code = `
${imports.join('\n')}

export const discoveredLogoUrl = ${discoveredLogoExpr};
export const scannedHackathons = [${categoryResults.hackathons.join(',\n')}];
export const scannedAchievements = [${categoryResults.achievements.join(',\n')}];
export const scannedProjects = [${categoryResults.projects.join(',\n')}];
export const scannedMePhotos = [${mePhotos.join(',\n')}];
export const scannedTechStack = {
  ${techEntries.join(',\n')}
};
export const scannedSummary = {
  scannedDirectories: [
    'assets/hackathons',
    'assets/achievements',
    'assets/projects',
    'assets/me',
    'assets/techstack',
  ],
  counts: {
    hackathons: scannedHackathons.length,
    achievements: scannedAchievements.length,
    projects: scannedProjects.length,
    me: scannedMePhotos.length,
    techstack: Object.keys(scannedTechStack).length,
  },
};
export default {
  hackathons: scannedHackathons,
  achievements: scannedAchievements,
  projects: scannedProjects,
  mePhotos: scannedMePhotos,
  techStack: scannedTechStack,
  summary: scannedSummary,
};
`;

  return code;
}

function portfolioAssetScannerPlugin() {
  let rootDir = process.cwd();
  return {
    name: 'vite-plugin-portfolio-asset-scanner',
    configResolved(config) {
      rootDir = config.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      return null;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return scanLocalPortfolioAssets(rootDir);
      }
      return null;
    },
    configureServer(server) {
      const assetsDir = path.join(rootDir, 'assets');
      if (fs.existsSync(assetsDir)) {
        server.watcher.add(assetsDir);
      }
      server.middlewares.use('/api/local-assets', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            status: 'ok',
            scannedDirectories: ['assets/hackathons', 'assets/achievements', 'assets/projects'],
          }),
        );
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), portfolioAssetScannerPlugin()],
  server: { allowedHosts: ['terminal.local'] },
  build: {
    chunkSizeWarningLimit: 950,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three') || id.includes('node_modules/three-stdlib')) {
            return 'webgl-three';
          }
          if (id.includes('node_modules/@paper-design')) {
            return 'paper-shaders';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
        },
      },
    },
  },
});
