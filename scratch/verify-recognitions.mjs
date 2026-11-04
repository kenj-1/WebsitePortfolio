import { launch, sleep } from './cdp.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'C:\\Users\\pepit\\.gemini\\antigravity\\brain\\622fd1f4-729f-468b-96db-de59888378a3\\scratch';

async function verify() {
  const chrome = await launch({ port: 9394 });
  const page = await chrome.newPage();
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await page.send('Page.navigate', { url: 'http://localhost:5174/' });

  for (let i = 0; i < 25; i++) {
    await sleep(400);
    const text = await page.eval('document.querySelector(".hero-headline-eclipse")?.textContent?.trim()').catch(() => null);
    if (text) break;
  }
  await sleep(1500);

  // 1. Inspect Hackathons section
  await page.eval('document.querySelector("#hackathons")?.scrollIntoView({ behavior: "instant" })');
  await sleep(700);

  const hackathonsData = await page.eval(`(() => {
    const sec = document.querySelector("#hackathons");
    if (!sec) return { error: "hackathons section not found" };
    const cardTitles = Array.from(sec.querySelectorAll("h3")).map(h => h.textContent.trim());
    return {
      title: sec.querySelector(".section-heading")?.textContent?.trim(),
      cardTitles,
      hasParangal: cardTitles.some(t => t.includes("Parangal")),
      hasDeansList: cardTitles.some(t => t.includes("Dean")),
    };
  })()`);
  console.log('HACKATHONS SECTION CHECK:', JSON.stringify(hackathonsData, null, 2));

  const hackathonShot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, 'hackathons-clean.png'), Buffer.from(hackathonShot.data, 'base64'));

  // 2. Inspect Recognitions section
  await page.eval('document.querySelector("#recognitions")?.scrollIntoView({ behavior: "instant" })');
  await sleep(700);

  const recognitionsData = await page.eval(`(() => {
    const sec = document.querySelector("#recognitions");
    if (!sec) return { error: "recognitions section not found" };
    const cards = Array.from(sec.querySelectorAll(".project-card"));
    return {
      title: sec.querySelector(".section-heading")?.textContent?.trim(),
      subtitle: sec.querySelector(".section-subtitle")?.textContent?.trim(),
      cardCount: cards.length,
      cards: cards.map(c => ({
        name: c.querySelector("h3")?.textContent?.trim(),
        status: c.querySelector(".project-status-badge")?.textContent?.trim(),
        summary: c.querySelector(".project-summary")?.textContent?.trim(),
        tags: Array.from(c.querySelectorAll(".tag")).map(t => t.textContent.trim()),
      })),
    };
  })()`);
  console.log('RECOGNITIONS SECTION CHECK:', JSON.stringify(recognitionsData, null, 2));

  const recShot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, 'recognitions-section.png'), Buffer.from(recShot.data, 'base64'));

  // 3. Test expand drawer on first award card
  await page.eval(`(() => {
    const firstToggle = document.querySelector("#recognitions .tech-context-toggle");
    firstToggle?.click();
  })()`);
  await sleep(600);

  const recExpandedShot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, 'recognitions-card-expanded.png'), Buffer.from(recExpandedShot.data, 'base64'));

  await chrome.close();
}

verify().catch(console.error);

