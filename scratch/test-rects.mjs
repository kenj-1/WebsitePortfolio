import { launch, sleep } from 'file:///C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/scratch/cdp.mjs';

async function run() {
  const { newPage, close } = await launch({ headless: true });
  const page = await newPage();
  await page.send('Page.navigate', { url: 'http://localhost:5173' });
  await sleep(2500);

  const rects = await page.eval(`(() => {
    const ids = ['about', 'work', 'hackathons', 'skills', 'leadership', 'recognitions', 'contact'];
    return ids.map(id => {
      const el = document.getElementById(id);
      const r = el ? el.getBoundingClientRect() : null;
      return { id, top: Math.round(r?.top ?? 0), bottom: Math.round(r?.bottom ?? 0) };
    });
  })()`);
  console.log('Rects at top:', rects);

  await page.eval(`document.getElementById('leadership').scrollIntoView({ behavior: 'instant', block: 'start' })`);
  await sleep(500);

  const rectsL = await page.eval(`(() => {
    const ids = ['about', 'work', 'hackathons', 'skills', 'leadership', 'recognitions', 'contact'];
    return ids.map(id => {
      const el = document.getElementById(id);
      const r = el ? el.getBoundingClientRect() : null;
      return { id, top: Math.round(r?.top ?? 0), bottom: Math.round(r?.bottom ?? 0) };
    });
  })()`);
  console.log('Rects at leadership:', rectsL);

  await close();
}

run().catch(console.error);

