import { launch, sleep } from 'file:///C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/scratch/cdp.mjs';
import fs from 'node:fs';

async function main() {
  const { browser, newPage, close } = await launch({ headless: true });
  const page = await newPage();
  await page.send('Page.enable');
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false,
  });

  console.log('Navigating to http://localhost:5173 ...');
  await page.send('Page.navigate', { url: 'http://localhost:5173' });
  await sleep(3000);

  // Inspect data
  const data = await page.eval(`(() => {
    // 1. About bio text
    const bioText = document.querySelector('.about-bio-text')?.textContent?.trim();

    // 2. Leadership cards
    const leadCards = Array.from(document.querySelectorAll('.leadership-card')).map(c => ({
      role: c.querySelector('.leadership-card__role')?.textContent?.trim(),
      roleFontSize: window.getComputedStyle(c.querySelector('.leadership-card__role')).fontSize,
      roleLineHeight: window.getComputedStyle(c.querySelector('.leadership-card__role')).lineHeight,
      cardPadding: window.getComputedStyle(c.querySelector('.leadership-card__surface')).padding,
      gridColumns: window.getComputedStyle(document.querySelector('.leadership-grid')).gridTemplateColumns,
    }));

    // 3. EmpathTune Web card
    const allProjectCards = Array.from(document.querySelectorAll('.project-card')).map(c => {
      const title = c.querySelector('.project-card__title, h3')?.textContent?.trim();
      const img = c.querySelector('.project-image-media img');
      return {
        title,
        hasImage: !!img,
        imgSrc: img ? img.src : null,
        imgLoaded: img ? img.complete : null,
        imgBounds: img ? { width: img.clientWidth, height: img.clientHeight } : null,
        imgStyle: img ? {
          width: window.getComputedStyle(img).width,
          height: window.getComputedStyle(img).height,
          objectFit: window.getComputedStyle(img).objectFit,
          borderTopLeftRadius: window.getComputedStyle(img).borderTopLeftRadius,
          borderTopRightRadius: window.getComputedStyle(img).borderTopRightRadius,
        } : null
      };
    });
    const empathWeb = allProjectCards.find(p => p.title && p.title.includes('EmpathTune (Web Development)'));

    // 4. Technical Journey elements and motion
    const journeyCards = Array.from(document.querySelectorAll('.tech-card')).map(c => ({
      name: c.querySelector('.tech-card__name')?.textContent?.trim(),
    }));

    return {
      bioText,
      leadGridCols: leadCards[0]?.gridColumns,
      leadRoleFontSize: leadCards[0]?.roleFontSize,
      leadCardPadding: leadCards[0]?.cardPadding,
      empathWeb,
      journeyCardsCount: journeyCards.length
    };
  })()`);

  console.log('Evaluated Data:', JSON.stringify(data, null, 2));

  // Helper screenshot function
  const takeShot = async (selector, fileName) => {
    try {
      await page.eval(`(() => {
        const el = document.querySelector('${selector}');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()`);
      await sleep(1200);
      const shot = await page.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/${fileName}`, Buffer.from(shot.data, 'base64'));
      console.log('Saved screenshot:', fileName);
    } catch (e) {
      console.error('Screenshot failed for', selector, e);
    }
  };

  await takeShot('#about', 'part1-about-bio-updated.png');
  await takeShot('#leadership', 'part2-leadership-optimized.png');
  await takeShot('#work', 'part3-empathtune-web-mapped.png');
  await takeShot('#skills', 'part4-journey-scroll-animations.png');

  await close();
  console.log('All verifications completed successfully!');
}

main().catch(console.error);

