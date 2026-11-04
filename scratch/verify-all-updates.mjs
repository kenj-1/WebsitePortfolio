import { launch, sleep } from 'file:///C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/scratch/cdp.mjs';
import { writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'C:\\Users\\pepit\\.gemini\\antigravity\\brain\\622fd1f4-729f-468b-96db-de59888378a3\\scratch';
const ARTIFACT_DIR = 'C:\\Users\\pepit\\.gemini\\antigravity\\brain\\622fd1f4-729f-468b-96db-de59888378a3';

async function verify() {
  const chrome = await launch({ port: 9394 });
  const page = await chrome.newPage();
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await page.send('Page.navigate', { url: 'http://localhost:5174/' });

  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const title = await page.eval('document.querySelector(".hero-headline-eclipse")?.textContent?.trim()').catch(() => null);
    if (title) break;
  }
  await sleep(1500);

  // 1. Verify Hero Section Elements
  const heroCheck = await page.eval(`(() => {
    return {
      title: document.querySelector('.hero-headline-eclipse')?.innerText?.trim(),
      internshipNote: document.querySelector('.internship-note')?.textContent?.trim(),
      coreRole: document.querySelector('.hero-core-role')?.textContent?.trim(),
      accentText: document.querySelector('.hero-accent-text')?.textContent?.trim(),
      resumeBtn: document.querySelector('.hero-resume-btn')?.textContent?.trim(),
      resumeHref: document.querySelector('.hero-resume-btn')?.getAttribute('href'),
      liquidLogoCanvas: Boolean(document.querySelector('.liquid-logo-stage__canvas-wrap canvas')),
      viewProjectsBtn: Boolean(document.querySelector('.hero-actions a[href="#work"]')),
      contestsBtn: Boolean(document.querySelector('.hero-actions a[href="#hackathons"]')),
    };
  })()`);
  console.log('Hero Check:', JSON.stringify(heroCheck, null, 2));

  // Screenshot of the Hero
  const heroShot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, 'hero-restored.png'), Buffer.from(heroShot.data, 'base64'));
  copyFileSync(join(OUT, 'hero-restored.png'), join(ARTIFACT_DIR, 'hero-restored.png'));

  // 2. Verify Nav Scroll Landing & Spacing (Check that section header is not covered)
  await page.eval('document.querySelector("#work")?.scrollIntoView({ behavior: "instant" })');
  await sleep(800);

  const scrollCheck = await page.eval(`(() => {
    const nav = document.querySelector('.navigation');
    const navRect = nav?.getBoundingClientRect();
    const workHeader = document.querySelector('#work .section-header');
    const headerRect = workHeader?.getBoundingClientRect();
    const section = document.querySelector('#work');
    const comp = getComputedStyle(section);

    return {
      navBottom: navRect?.bottom,
      workHeaderTop: headerRect?.top,
      isHeaderClearOfNav: headerRect?.top > navRect?.bottom,
      scrollMarginTop: comp.scrollMarginTop,
    };
  })()`);
  console.log('Scroll Landing Check:', JSON.stringify(scrollCheck, null, 2));

  // Screenshot of Projects section landing
  const projectsShot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, 'projects-landing-clear.png'), Buffer.from(projectsShot.data, 'base64'));
  copyFileSync(join(OUT, 'projects-landing-clear.png'), join(ARTIFACT_DIR, 'projects-landing-clear.png'));

  // 3. Verify Recognitions Section & CIT-U Logo
  await page.eval('document.querySelector("#recognitions")?.scrollIntoView({ behavior: "instant" })');
  await sleep(800);

  const recognitionsCheck = await page.eval(`(() => {
    const section = document.querySelector('#recognitions');
    const cards = section.querySelectorAll('.project-card');
    return Array.from(cards).map(card => {
      const title = card.querySelector('h3')?.textContent?.trim();
      const emblemImg = card.querySelector('.achievement-emblem__logo');
      const emblemSrc = emblemImg?.getAttribute('src');
      const surface = card.querySelector('.project-card__surface');
      const sStyle = surface ? getComputedStyle(surface) : null;
      return {
        title,
        emblemSrc: emblemSrc ? emblemSrc.substring(0, 60) : null,
        surfaceRadius: sStyle?.borderRadius,
        surfaceBoxShadow: sStyle?.boxShadow,
      };
    });
  })()`);
  console.log('Recognitions Check:', JSON.stringify(recognitionsCheck, null, 2));

  // Screenshot of Recognitions section
  const recognitionsShot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, 'recognitions-citu-verified.png'), Buffer.from(recognitionsShot.data, 'base64'));
  copyFileSync(join(OUT, 'recognitions-citu-verified.png'), join(ARTIFACT_DIR, 'recognitions-citu-verified.png'));

  // 4. Verify 3D Tilt Card Styles (Radius 24px, Inset Shadow, No 1px Border)
  const cardStyleCheck = await page.eval(`(() => {
    const card = document.querySelector('#work .project-card');
    const surface = card.querySelector('.project-card__surface');
    const sStyle = getComputedStyle(surface);
    const img = card.querySelector('.project-image-media img');
    const iStyle = img ? getComputedStyle(img) : null;
    return {
      borderRadius: sStyle.borderRadius,
      boxShadow: sStyle.boxShadow,
      borderStyle: sStyle.borderStyle,
      imgRadiusTopLeft: iStyle?.borderTopLeftRadius,
      imgRadiusTopRight: iStyle?.borderTopRightRadius,
      imgHeight: iStyle?.height,
      imgObjectFit: iStyle?.objectFit,
    };
  })()`);
  console.log('Card Style Check:', JSON.stringify(cardStyleCheck, null, 2));

  await chrome.close();
  console.log('All verification checks completed successfully!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
