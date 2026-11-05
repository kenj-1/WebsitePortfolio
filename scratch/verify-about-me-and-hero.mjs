import { launch, sleep } from 'file:///C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/scratch/cdp.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\pepit\\.gemini\\antigravity\\brain\\622fd1f4-729f-468b-96db-de59888378a3';

async function verify() {
  const chrome = await launch({ port: 9394 });
  const page = await chrome.newPage();
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await page.send('Page.navigate', { url: 'http://localhost:5173/' });
  await sleep(1500);

  // 1. Screenshot of updated Hero section
  const heroShot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(ARTIFACT_DIR, 'clean-hero.png'), Buffer.from(heroShot.data, 'base64'));

  // 2. Scroll to About Me section and capture Slide 1
  await page.eval(`(() => {
    const el = document.querySelector('#about');
    if (el) window.scrollTo(0, el.offsetTop - 80);
  })()`);
  await sleep(1200);

  const slide1Shot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(ARTIFACT_DIR, 'about-me-slide-1-fixed.png'), Buffer.from(slide1Shot.data, 'base64'));

  // 3. Click Next button to view Slide 2 and capture Slide 2
  await page.eval(`(() => {
    const nextBtn = document.querySelector('.about-me-controls .about-me-btn:last-child');
    nextBtn?.click();
  })()`);
  await sleep(800);

  const slide2Shot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(ARTIFACT_DIR, 'about-me-slide-2-fixed.png'), Buffer.from(slide2Shot.data, 'base64'));

  const imgStyles = await page.eval(`(() => {
    const container = document.querySelector('.about-me-image-container');
    const img = document.querySelector('.about-me-slide.is-active .about-me-img');
    const cs = img ? getComputedStyle(img) : null;
    const ccs = container ? getComputedStyle(container) : null;
    return {
      containerAspectRatio: ccs?.aspectRatio,
      objectFit: cs?.objectFit,
      objectPosition: cs?.objectPosition,
    };
  })()`);
  console.log('About Me Image Styles:', JSON.stringify(imgStyles, null, 2));

  await chrome.close();
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});

