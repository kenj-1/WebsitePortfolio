import { launch, sleep } from 'file:///C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/scratch/cdp.mjs';

async function run() {
  const { newPage, close } = await launch({ headless: true });
  const page = await newPage();
  await page.send('Page.navigate', { url: 'http://localhost:5173' });
  await sleep(2500);

  const res = await page.eval(`(() => {
    const link = document.querySelector('a[href="#leadership"].glass-radio-item');
    link.click();
    return {
      gliderTransform: document.querySelector('.glass-glider')?.style?.transform,
      items: Array.from(document.querySelectorAll('.glass-radio-item')).map(a => ({ text: a.textContent.trim(), class: a.className }))
    };
  })()`);
  console.log('Result immediately:', res);

  await sleep(2000);

  const resAfter = await page.eval(`(() => {
    return {
      gliderTransform: document.querySelector('.glass-glider')?.style?.transform,
      items: Array.from(document.querySelectorAll('.glass-radio-item')).map(a => ({ text: a.textContent.trim(), class: a.className }))
    };
  })()`);
  console.log('Result after 2s:', resAfter);

  await close();
}

run().catch(console.error);

