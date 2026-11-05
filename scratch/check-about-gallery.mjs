import { launch, sleep } from 'file:///C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/scratch/cdp.mjs';

async function main() {
  const { browser, newPage, close } = await launch({ headless: true });
  const page = await newPage();
  await page.send('Page.enable');
  await page.send('Page.navigate', { url: 'http://localhost:5173' });
  await sleep(2500);

  const galleryInfo = await page.eval(`(() => {
    const el = document.querySelector('.about-me-gallery');
    if (!el) return { found: false, aboutSection: document.querySelector('#about')?.outerHTML?.slice(0, 500) };
    const imgs = Array.from(el.querySelectorAll('img')).map(img => ({
      src: img.src,
      currentSrc: img.currentSrc,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      offsetParent: !!img.offsetParent,
      bounds: img.getBoundingClientRect()
    }));
    return {
      found: true,
      html: el.outerHTML.slice(0, 500),
      bounds: el.getBoundingClientRect(),
      images: imgs
    };
  })()`);

  console.log('Gallery Info:', JSON.stringify(galleryInfo, null, 2));
  await close();
}

main().catch(console.error);
