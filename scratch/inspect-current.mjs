import { launch, sleep } from 'file:///C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/scratch/cdp.mjs';

async function check() {
  const chrome = await launch({ port: 9394 });
  const page = await chrome.newPage();
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Page.navigate', { url: 'http://localhost:5174/' });
  await sleep(1500);

  const heroText = await page.eval('document.querySelector(".hero-section")?.innerText');
  console.log('Hero Text:\n', heroText);

  const recognitionsLogos = await page.eval(`(() => {
    const section = document.querySelector("#recognitions");
    if (!section) return "NO RECOGNITIONS";
    const cards = Array.from(section.querySelectorAll(".project-card"));
    return cards.map(c => {
      const title = c.querySelector(".project-title")?.innerText;
      const img = c.querySelector(".achievement-emblem__logo");
      return {
        title,
        imgSrc: img?.src,
        imgNaturalWidth: img?.naturalWidth,
        imgNaturalHeight: img?.naturalHeight,
        renderedWidth: img ? getComputedStyle(img).width : null,
        renderedHeight: img ? getComputedStyle(img).height : null,
      };
    });
  })()`);
  console.log('Recognitions Logos:\n', JSON.stringify(recognitionsLogos, null, 2));

  await chrome.close();
}

check().catch(console.error);

