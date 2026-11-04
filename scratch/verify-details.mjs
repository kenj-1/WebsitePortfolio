import { launch, sleep } from 'file:///C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/scratch/cdp.mjs';

async function verifyDetails() {
  const chrome = await launch({ port: 9394 });
  const page = await chrome.newPage();
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Page.navigate', { url: 'http://localhost:5174/' });
  await sleep(1500);

  const report = await page.eval(`(() => {
    const sec = document.querySelector("#recognitions");
    if (!sec) return { error: "No recognitions section" };

    const label = sec.querySelector(".section-micro-label")?.textContent;
    const cards = Array.from(sec.querySelectorAll(".project-card"));

    const cardDetails = cards.map(c => {
      const surface = c.querySelector(".project-card__surface");
      const surfaceStyle = surface ? getComputedStyle(surface) : null;
      const emblem = c.querySelector(".achievement-emblem");
      const emblemStyle = emblem ? getComputedStyle(emblem) : null;
      const img = c.querySelector(".achievement-emblem__logo");
      const imgStyle = img ? getComputedStyle(img) : null;
      const title = c.querySelector(".project-title")?.textContent?.trim();
      const role = c.querySelector(".project-meta")?.textContent?.trim();
      const badge = c.querySelector(".project-status-badge")?.textContent?.trim();

      return {
        title,
        role,
        badge,
        imgSrc: img?.src?.split("/").pop(),
        imgRendered: imgStyle ? \`\${imgStyle.width} x \${imgStyle.height}\` : null,
        imgObjectFit: imgStyle?.objectFit,
        emblemRadius: emblemStyle?.borderRadius,
        emblemBorder: emblemStyle?.border,
        surfaceBg: surfaceStyle?.backgroundColor,
        surfaceBoxShadow: surfaceStyle?.boxShadow,
      };
    });

    return {
      microLabel: label,
      cardsCount: cards.length,
      cards: cardDetails,
    };
  })()`);

  console.log('Report:', JSON.stringify(report, null, 2));
  await chrome.close();
}

verifyDetails().catch(console.error);

