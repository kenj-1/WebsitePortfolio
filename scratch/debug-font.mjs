import { launch } from 'file:///C:/Users/pepit/.gemini/antigravity/brain/622fd1f4-729f-468b-96db-de59888378a3/scratch/cdp.mjs';

async function main() {
  const { browser, newPage, close } = await launch({ headless: true });
  const page = await newPage();
  await page.send('Page.enable');
  await page.send('Page.navigate', { url: 'http://localhost:5173' });
  await new Promise(r => setTimeout(r, 2000));

  const debug = await page.eval(`(() => {
    const el = document.querySelector('.leadership-card__role');
    const comp = window.getComputedStyle(el);
    const rules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && el.matches(rule.selectorText)) {
            if (rule.style.fontSize) {
              rules.push({ selector: rule.selectorText, fontSize: rule.style.fontSize });
            }
          }
        }
      } catch (e) {}
    }
    return {
      computedFontSize: comp.fontSize,
      fontFamily: comp.fontFamily,
      matchingRulesWithFontSize: rules
    };
  })()`);

  console.log('DEBUG:', JSON.stringify(debug, null, 2));
  await close();
}

main().catch(console.error);

