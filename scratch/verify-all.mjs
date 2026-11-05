import { launch, sleep } from 'file:///C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/scratch/cdp.mjs';
import fs from 'node:fs';

async function main() {
  const { newPage, close } = await launch({ headless: true });
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

  const takeShot = async fileName => {
    const shot = await page.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      `C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/${fileName}`,
      Buffer.from(shot.data, 'base64')
    );
    console.log('Saved screenshot:', fileName);
  };

  // 1. Initial navbar state
  const initialNav = await page.eval(`(() => {
    const glider = document.querySelector('.glass-glider');
    const activeItem = document.querySelector('.glass-radio-item.is-active');
    const group = document.querySelector('.glass-radio-group');
    const gliderRect = glider.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();
    const groupRect = group.getBoundingClientRect();
    return {
      activeText: activeItem?.textContent?.trim(),
      activeWidth: Math.round(activeRect.width),
      gliderWidth: Math.round(gliderRect.width),
      activeLeftRel: Math.round(activeRect.left - groupRect.left),
      gliderLeftRel: Math.round(gliderRect.left - groupRect.left),
      gliderInlineStyle: glider.getAttribute('style')
    };
  })()`);
  console.log('Initial Nav (About):', JSON.stringify(initialNav, null, 2));
  await takeShot('verify-nav-about-dynamic.png');

  // 2. Click Leadership to verify dynamic resizing for longer text
  console.log('Clicking Leadership link...');
  await page.eval(`(() => {
    const link = document.querySelector('a[href="#leadership"].glass-radio-item');
    if (link) link.click();
  })()`);
  await sleep(1200);

  const leadershipNav = await page.eval(`(() => {
    const glider = document.querySelector('.glass-glider');
    const activeItem = document.querySelector('.glass-radio-item.is-active');
    const group = document.querySelector('.glass-radio-group');
    const gliderRect = glider.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();
    const groupRect = group.getBoundingClientRect();
    return {
      activeText: activeItem?.textContent?.trim(),
      activeWidth: Math.round(activeRect.width),
      gliderWidth: Math.round(gliderRect.width),
      activeLeftRel: Math.round(activeRect.left - groupRect.left),
      gliderLeftRel: Math.round(gliderRect.left - groupRect.left),
      gliderInlineStyle: glider.getAttribute('style')
    };
  })()`);
  console.log('Leadership Nav:', JSON.stringify(leadershipNav, null, 2));
  await takeShot('verify-nav-leadership-dynamic.png');

  // 3. Click Contact link
  console.log('Clicking Contact link...');
  await page.eval(`(() => {
    const link = document.querySelector('a[href="#contact"].glass-radio-item');
    if (link) link.click();
  })()`);
  await sleep(1200);

  const contactNav = await page.eval(`(() => {
    const glider = document.querySelector('.glass-glider');
    const activeItem = document.querySelector('.glass-radio-item.is-active');
    const group = document.querySelector('.glass-radio-group');
    const gliderRect = glider.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();
    const groupRect = group.getBoundingClientRect();
    return {
      activeText: activeItem?.textContent?.trim(),
      activeWidth: Math.round(activeRect.width),
      gliderWidth: Math.round(gliderRect.width),
      activeLeftRel: Math.round(activeRect.left - groupRect.left),
      gliderLeftRel: Math.round(gliderRect.left - groupRect.left),
    };
  })()`);
  console.log('Contact Nav:', JSON.stringify(contactNav, null, 2));
  await takeShot('verify-nav-contact-dynamic.png');

  // 4. Inspect EmpathTune Web card in Projects section
  console.log('Scrolling to EmpathTune Web project card...');
  await page.eval(`(() => {
    const card = document.getElementById('project-card-empathtune-web') ||
      Array.from(document.querySelectorAll('.project-card')).find(c => c.textContent.includes('EmpathTune (Web Development)'));
    if (card) card.scrollIntoView({ behavior: 'instant', block: 'center' });
  })()`);
  await sleep(1500);

  const empathtuneCardInfo = await page.eval(`(() => {
    const card = Array.from(document.querySelectorAll('.project-card')).find(c => c.textContent.includes('EmpathTune (Web Development)'));
    if (!card) return null;
    const img = card.querySelector('.project-image-media img');
    const style = img ? window.getComputedStyle(img) : null;
    return {
      found: true,
      imgSrc: img ? img.src : null,
      width: style?.width,
      height: style?.height,
      objectFit: style?.objectFit,
      naturalWidth: img?.naturalWidth,
      naturalHeight: img?.naturalHeight,
    };
  })()`);
  console.log('EmpathTune Card Info:', JSON.stringify(empathtuneCardInfo, null, 2));
  await takeShot('verify-empathtune-card.png');

  // 5. Open EmpathTune Web details modal
  console.log('Opening EmpathTune details modal...');
  await page.eval(`(() => {
    const card = Array.from(document.querySelectorAll('.project-card')).find(c => c.textContent.includes('EmpathTune (Web Development)'));
    const btn = card?.querySelector('.card-action-open') || card?.querySelector('button');
    if (btn) btn.click();
  })()`);
  await sleep(1200);

  const modalInfo = await page.eval(`(() => {
    const dialog = document.querySelector('[role=\"dialog\"]');
    if (!dialog) return null;
    const images = Array.from(dialog.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt
    }));
    return {
      isOpen: true,
      title: dialog.querySelector('h2')?.textContent?.trim(),
      images
    };
  })()`);
  console.log('Modal Info:', JSON.stringify(modalInfo, null, 2));
  await takeShot('verify-empathtune-modal.png');

  await close();
  console.log('All verification steps completed successfully!');
}

main().catch(console.error);
