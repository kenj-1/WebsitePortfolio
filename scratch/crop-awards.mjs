import { launch, sleep } from 'file:///C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/scratch/cdp.mjs';
import { writeFileSync } from 'node:fs';

async function cropCards() {
  const chrome = await launch({ port: 9394 });
  const page = await chrome.newPage();
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await page.send('Page.navigate', { url: 'http://localhost:5174/' });
  await sleep(1500);

  // Scroll directly so #recognitions is at top of screen
  await page.eval(`(() => {
    const el = document.querySelector("#recognitions");
    if (el) {
      window.scrollTo(0, el.offsetTop - 40);
    }
  })()`);
  await sleep(1500);

  const shot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/awards-section-viewport.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved awards-section-viewport.png');

  // Also Leadership section
  await page.eval(`(() => {
    const el = document.querySelector("#leadership");
    if (el) {
      window.scrollTo(0, el.offsetTop - 40);
    }
  })()`);
  await sleep(1500);

  const shotLead = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/leadership-section-viewport.png', Buffer.from(shotLead.data, 'base64'));
  console.log('Saved leadership-section-viewport.png');

  await chrome.close();
}

cropCards().catch(console.error);
