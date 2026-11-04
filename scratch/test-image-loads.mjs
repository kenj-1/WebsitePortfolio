import { launch, sleep } from 'file:///C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/scratch/cdp.mjs';

async function check() {
  const chrome = await launch({ port: 9394 });
  const page = await chrome.newPage();
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Page.navigate', { url: 'http://localhost:5174/' });
  await sleep(1000);

  // Scroll into view!
  await page.eval('document.querySelector("#recognitions")?.scrollIntoView({ behavior: "instant" })');
  await sleep(1500);

  const images = await page.eval(`(() => {
    const imgs = Array.from(document.querySelectorAll("#recognitions img"));
    return imgs.map(img => ({
      alt: img.alt,
      src: img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      renderedWidth: getComputedStyle(img).width,
      renderedHeight: getComputedStyle(img).height,
    }));
  })()`);

  console.log('Images status after scroll:', JSON.stringify(images, null, 2));

  const fs = await import('node:fs');
  const shot = await page.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/recognitions-scrolled.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved scratch/recognitions-scrolled.png');

  await chrome.close();
}

check().catch(console.error);
