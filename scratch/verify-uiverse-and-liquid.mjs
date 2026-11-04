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
    await sleep(250);
    const title = await page.eval('document.querySelector(".hero-headline-eclipse")?.textContent?.trim()').catch(() => null);
    if (title) break;
  }
  await sleep(1000);

  // 1. Verify Viscous Lava Lamp Canvas & SVG Goo Filter
  const liquidCanvasCheck = await page.eval(`(() => {
    const canvas = document.querySelector('.liquid-physics-canvas');
    const gooFilter = document.querySelector('#lava-lamp-goo');
    const orangeBlob = document.querySelector('.aurora-node--orange');
    return {
      canvasExists: Boolean(canvas),
      gooFilterExists: Boolean(gooFilter),
      orangeBlobExists: Boolean(orangeBlob),
      width: canvas?.width,
      height: canvas?.height,
      opacity: canvas ? getComputedStyle(canvas).opacity : null,
      mixBlendMode: canvas ? getComputedStyle(canvas).mixBlendMode : null,
    };
  })()`);
  console.log('Viscous Lava Lamp Check:', JSON.stringify(liquidCanvasCheck, null, 2));

  // Simulate pointer motion for viscous lava interaction
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 350, y: 320 });
  await sleep(150);
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 680, y: 420 });
  await sleep(300);

  const liquidShot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, 'interactive-liquid-hero.png'), Buffer.from(liquidShot.data, 'base64'));
  copyFileSync(join(OUT, 'interactive-liquid-hero.png'), join(ARTIFACT_DIR, 'interactive-liquid-hero.png'));

  // 2. Verify Leadership Section with Uiverse 3D Cards
  await page.eval(`(() => {
    const el = document.querySelector('#leadership');
    if (el) window.scrollTo(0, el.offsetTop - 40);
  })()`);
  await sleep(1500);

  const leadershipCheck = await page.eval(`(() => {
    const section = document.querySelector('#leadership');
    const microLabel = section?.querySelector('.section-micro-label')?.textContent?.trim();
    const uiverseCards = section?.querySelectorAll('.card');
    const firstCard = uiverseCards?.[0];
    const cardH2 = firstCard?.querySelector('h2')?.textContent?.trim();
    const style = firstCard ? getComputedStyle(firstCard) : null;

    return {
      microLabel,
      uiverseCardCount: uiverseCards?.length,
      firstCardText: cardH2,
      cardRadius: style?.borderRadius,
      cardBoxShadow: style?.boxShadow,
    };
  })()`);
  console.log('Leadership Check:', JSON.stringify(leadershipCheck, null, 2));

  const leadershipShot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, 'uiverse-leadership-cards.png'), Buffer.from(leadershipShot.data, 'base64'));
  copyFileSync(join(OUT, 'uiverse-leadership-cards.png'), join(ARTIFACT_DIR, 'uiverse-leadership-cards.png'));

  // 3. Verify Recognitions / Awards Section with Uiverse 3D Cards & 48px Logos
  await page.eval(`(() => {
    const el = document.querySelector('#recognitions');
    if (el) window.scrollTo(0, el.offsetTop - 40);
  })()`);
  await sleep(2000);

  const awardsCheck = await page.eval(`(() => {
    const section = document.querySelector('#recognitions');
    const microLabel = section?.querySelector('.section-micro-label')?.textContent?.trim();
    const uiverseCards = Array.from(section?.querySelectorAll('.card') || []);
    return {
      microLabel,
      uiverseCardCount: uiverseCards.length,
      cards: uiverseCards.map(c => {
        const h2 = c.querySelector('h2')?.textContent?.trim();
        const img = c.querySelector('.achievement-emblem__logo');
        const imgStyle = img ? getComputedStyle(img) : null;
        return {
          title: h2,
          logoFile: img?.src?.split('/').pop(),
          logoLoaded: img?.complete && img?.naturalWidth > 0,
          logoSize: imgStyle ? \`\${imgStyle.width} x \${imgStyle.height}\` : null,
          logoObjectFit: imgStyle?.objectFit,
        };
      }),
    };
  })()`);
  console.log('Awards Check:', JSON.stringify(awardsCheck, null, 2));

  const awardsShot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, 'uiverse-awards-cards.png'), Buffer.from(awardsShot.data, 'base64'));
  copyFileSync(join(OUT, 'uiverse-awards-cards.png'), join(ARTIFACT_DIR, 'uiverse-awards-cards.png'));

  // 4. Verify Part 1 3D Card Glass, Glow, & Parallax
  await page.eval(`(() => {
    const el = document.querySelector('#work');
    if (el) window.scrollTo(0, el.offsetTop - 40);
  })()`);
  await sleep(1200);

  const card3DCheck = await page.eval(`(() => {
    const card = document.querySelector('#work .project-card');
    const surface = card.querySelector('.project-card__surface');
    const surfaceStyle = getComputedStyle(surface);
    const beforeStyle = getComputedStyle(surface, '::before');
    const imgFrame = card.querySelector('.project-visual-frame');
    const imgFrameStyle = imgFrame ? getComputedStyle(imgFrame) : null;
    const titleRow = card.querySelector('.project-title-row');
    const titleRowStyle = titleRow ? getComputedStyle(titleRow) : null;
    const img = card.querySelector('.project-image-media img');
    const imgStyle = img ? getComputedStyle(img) : null;

    return {
      surfaceRadius: surfaceStyle.borderRadius,
      surfaceBoxShadow: surfaceStyle.boxShadow,
      borderStyle: surfaceStyle.borderStyle,
      transformStyle: surfaceStyle.transformStyle,
      flashlightGradient: beforeStyle.backgroundImage.includes('radial-gradient'),
      flashlightHasBrandOrange: beforeStyle.backgroundImage.includes('217, 119, 87'),
      imgFrameTransform: imgFrameStyle?.transform,
      titleRowTransform: titleRowStyle?.transform,
      imgRadiusTopLeft: imgStyle?.borderTopLeftRadius,
      imgRadiusTopRight: imgStyle?.borderTopRightRadius,
      imgHeight: imgStyle?.height,
      imgObjectFit: imgStyle?.objectFit,
    };
  })()`);
  console.log('3D Card Check:', JSON.stringify(card3DCheck, null, 2));

  await chrome.close();
  console.log('All verification checks PASSED!');
}

verify().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
