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

  // 1. Verify Fun Facts text
  const funFacts = await page.eval(`(() => {
    return Array.from(document.querySelectorAll('.fun-fact-card')).map(c => ({
      num: c.querySelector('span:first-child')?.textContent?.trim(),
      text: c.querySelector('span:last-child')?.textContent?.trim(),
    }));
  })()`);
  console.log('Fun Facts:', JSON.stringify(funFacts, null, 2));

  // 2. Verify Navbar items and initial glider position
  const navInitial = await page.eval(`(() => {
    const glider = document.querySelector('.glass-glider');
    const items = Array.from(document.querySelectorAll('.glass-radio-item')).map(a => ({
      text: a.textContent.trim(),
      href: a.getAttribute('href'),
      isActive: a.classList.contains('is-active')
    }));
    return {
      gliderTransform: glider ? window.getComputedStyle(glider).transform : null,
      gliderWidth: glider ? window.getComputedStyle(glider).width : null,
      items
    };
  })()`);
  console.log('Nav Initial State:', JSON.stringify(navInitial, null, 2));

  // Helper screenshot function
  const takeShot = async fileName => {
    const shot = await page.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(
      `C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/${fileName}`,
      Buffer.from(shot.data, 'base64')
    );
    console.log('Saved screenshot:', fileName);
  };

  // Screenshot 1: Navbar at top with Hero and About visible
  await page.eval(`window.scrollTo(0, 0)`);
  await sleep(1000);
  await takeShot('verify-navbar-at-top.png');

  // Screenshot 2: Fun facts cards in About
  await page.eval(`(() => {
    const el = document.querySelector('.fun-facts-grid');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  })()`);
  await sleep(1200);
  await takeShot('verify-fun-facts-populated.png');

  // 3. Test Scroll to #skills (Technical Journey)
  console.log('Testing scroll to #skills ...');
  await page.eval(`(() => {
    const el = document.getElementById('skills');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  })()`);
  await sleep(1500);

  const navJourney = await page.eval(`(() => {
    const glider = document.querySelector('.glass-glider');
    const active = document.querySelector('.glass-radio-item.is-active');
    return {
      activeText: active?.textContent?.trim(),
      gliderTransform: glider ? window.getComputedStyle(glider).transform : null
    };
  })()`);
  console.log('Nav state at #skills:', JSON.stringify(navJourney, null, 2));
  await takeShot('verify-navbar-scrolled-journey.png');

  // 4. Test Click navigation to #leadership
  console.log('Testing click to #leadership ...');
  await page.eval(`(() => {
    const link = document.querySelector('a[href="#leadership"].glass-radio-item');
    if (link) link.click();
  })()`);
  await sleep(1500);

  const navLeadership = await page.eval(`(() => {
    const glider = document.querySelector('.glass-glider');
    const active = document.querySelector('.glass-radio-item.is-active');
    return {
      activeText: active?.textContent?.trim(),
      gliderTransform: glider ? window.getComputedStyle(glider).transform : null
    };
  })()`);
  console.log('Nav state after clicking #leadership:', JSON.stringify(navLeadership, null, 2));
  await takeShot('verify-navbar-clicked-leadership.png');

  await close();
  console.log('All navbar & fun facts tests finished successfully!');
}

main().catch(console.error);

