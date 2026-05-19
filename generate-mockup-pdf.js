// UrheberDB Mockup – Screenshot & PDF Generator
// Usage: node generate-mockup-pdf.js
// Requires: puppeteer-core, pdfkit (npm install --save-dev puppeteer-core@21 pdfkit)

const puppeteer = require('puppeteer-core');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE   = 'http://localhost:4200';
const DIR    = path.join(__dirname, 'mockup-screenshots');
const PDF_OUT = path.join(__dirname, 'UrheberDB-Mockup.pdf');

const VIEWPORT = { width: 1440, height: 900 };

// ──────────────────────────────────────────────
async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function capture(page, title, filename, list) {
  await wait(1600);
  const p = path.join(DIR, filename);
  await page.screenshot({ path: p, fullPage: false });
  list.push({ title, path: p });
  console.log('  ✓', title);
}

async function spaNavigate(page, path) {
  // Use Angular router via sidebar links or direct router navigation
  // This avoids full page reloads that reset in-memory Signals
  await page.evaluate((p) => {
    // Find Angular router from the app
    const appEl = document.querySelector('app-root');
    if (window.ng && appEl) {
      try {
        const injector = window.ng.getInjector(appEl);
        // Try to get Router token
        const allServices = injector['_records'] || injector['records'];
      } catch(e) {}
    }
    // Fallback: click matching router link in DOM
    const link = document.querySelector(`[routerLink="${p}"], a[href="${p}"]`);
    if (link) { link.click(); return; }
    // Fallback 2: use history + popstate (works for Angular location strategy)
    window.history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }, path);
  await wait(1200);
}

async function clickSidebarLink(page, text) {
  await page.evaluate((t) => {
    const links = Array.from(document.querySelectorAll('.sidebar-menu a'));
    const link = links.find(l => l.textContent.trim().includes(t));
    if (link) link.click();
  }, text);
  await wait(1500);
}

async function waitForTypeCards(page) {
  try {
    await page.waitForFunction(
      () => document.querySelectorAll('.type-card').length > 0,
      { timeout: 6000 }
    );
  } catch(e) {
    console.log('    ⚠️  Timeout warten auf type-cards');
  }
}

// ──────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: VIEWPORT
  });

  const page = await browser.newPage();
  const shots = [];

  try {
    // ── 1. Willkommen-Seite ──────────────────
    console.log('\n[Öffentliche Seiten]');
    await page.goto(`${BASE}/welcome`, { waitUntil: 'networkidle0' });
    await capture(page, 'Willkommen-Seite', '01-welcome.png', shots);

    // ── 2. Login-Seite ────────────────────────
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' });
    await capture(page, 'Login-Seite', '02-login.png', shots);

    // ── 3. MediaKey – E-Mail ─────────────────
    await page.goto(`${BASE}/mediakey`, { waitUntil: 'networkidle0' });
    await capture(page, 'MediaKey – E-Mail eingeben', '03-mediakey-email.png', shots);

    // ── 4. MediaKey – Passwort ────────────────
    await page.type('.mk-input', 'max.mustermann@orf.at');
    await page.click('.mk-btn');
    await wait(700);
    await capture(page, 'MediaKey – Passwort eingeben', '04-mediakey-password.png', shots);

    // ── 5. Einloggen → Dashboard ──────────────
    console.log('\n[Einloggen ...]');
    const pwInput = await page.$('.mk-input-password-wrap input');
    if (pwInput) await pwInput.type('Demo1234');
    await page.click('.mk-btn');
    await wait(2200); // 800ms mock delay + navigation
    await capture(page, 'Dashboard – Identitätsnachweis ausstehend', '05-dashboard-unverified.png', shots);

    // ── 6. Identitätsnachweis via in-page button ──────────────────
    console.log('\n[Identitätsnachweis]');
    // Click any button/link that leads to identitaetsnachweis
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('a, button'))
        .find(e => (e.getAttribute && e.getAttribute('routerlink') === '/identitaetsnachweis')
               || (e.textContent || '').includes('Reisepass'));
      if (el) el.click();
    });
    await wait(1500);
    await capture(page, 'Identitätsnachweis', '06-identitaetsnachweis.png', shots);

    // ── 6b. Identitätsnachweis – Reisepass-Formular aufklappen ──
    const methodOptions2 = await page.$$('.method-option');
    if (methodOptions2.length > 1) await methodOptions2[1].click(); // Reisepass
    await wait(800);
    await capture(page, 'Identitätsnachweis – Reisepass / Personalausweis', '06b-identitaetsnachweis-reisepass.png', shots);

    // ── 7. ID-Austria klicken → antrag/neu ───
    const methodOptions = await page.$$('.method-option');
    if (methodOptions.length > 0) await methodOptions[0].click();
    await wait(1200);
    // Navigate to dashboard via sidebar link
    await clickSidebarLink(page, 'Dashboard');
    await capture(page, 'Dashboard – Kein Antrag vorhanden', '07-dashboard-empty.png', shots);

    // ── 8. Neuer Antrag – Schritt 1 via sidebar ──────────────────
    console.log('\n[Antrag erstellen – Natürliche Person]');
    await clickSidebarLink(page, 'Neuer Antrag');
    await waitForTypeCards(page);
    await wait(300);
    await capture(page, 'Neuer Antrag – Personenart wählen', '08-antrag-step1.png', shots);

    // ── 9. Natürliche Person – Schritt 2 ──────
    let typeCards;
    try { await page.waitForSelector('.type-card', { timeout: 5000 }); } catch(e) {}
    typeCards = await page.$$('.type-card');
    console.log('    type-cards gefunden:', typeCards.length);
    if (typeCards.length > 0) {
      await typeCards[0].click(); // Natürliche Person
      await wait(500);
      // Click enabled Weiter button
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent.trim().includes('Weiter') && !b.disabled);
        if (btn) btn.click();
      });
      await wait(800);
      await capture(page, 'Neuer Antrag – Angaben Natürliche Person (Honorarnummer)', '09-antrag-nat-step2.png', shots);

      // ── 9b. "Ohne Honorarnummer" klicken → Adressformular zeigen ──
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent.includes('Ohne Honorarnummer') || b.textContent.includes('ohne Honorarnummer'));
        if (btn) btn.click();
      });
      await wait(700);
      await capture(page, 'Neuer Antrag – Adressangaben (ohne Honorarnummer)', '09b-antrag-nat-adresse.png', shots);

      // ── zurück auf Honorarnummer-Suche ──
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button, a'))
          .find(b => b.textContent.includes('Doch Honorarnummer') || b.textContent.includes('Honorarnummer eingeben'));
        if (btn) btn.click();
      });
      await wait(500);

      // Type valid Honorarnummer to auto-fill the form (clears validators)
      const honorarInput = await page.$('input[placeholder*="Honorar"], input[placeholder*="Personaln"], .personalnummer-input input, input[class*="p-inputtext"]:not([type="email"]):not([type="password"])');
      if (honorarInput) {
        await honorarInput.click();
        await honorarInput.type('H12345');
      }
      // Click search button
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => (b.textContent.includes('Suchen') || b.textContent.includes('suchen') || b.className.includes('search'))
               && !b.disabled);
        if (btn) btn.click();
      });
      await wait(1200); // mock API delay

      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent.trim().includes('Weiter') && !b.disabled);
        if (btn) btn.click();
      });
      await wait(800);

      // Step 3 – Werke
      await capture(page, 'Neuer Antrag – Werke angeben', '10-antrag-nat-step3.png', shots);

      // Submit
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent.trim().includes('einreichen') && !b.disabled);
        if (btn) btn.click();
      });
      await wait(2200);
      console.log('    URL nach Submit:', page.url());
      await capture(page, 'Dashboard – Natürliche Person (mit Antrag)', '11-dashboard-nat.png', shots);
    } else {
      console.log('    ⚠️  Keine type-cards gefunden – isVerified prüfen');
    }

    // ── 10. Neuer Antrag – Juristische Person ──
    console.log('\n[Antrag erstellen – Juristische Person]');
    console.log('    URL vor Navigation:', page.url());
    await page.click('a[routerlink="/antrag/neu"], a[ng-reflect-router-link="/antrag/neu"]').catch(async () => {
      await clickSidebarLink(page, 'Neuer Antrag');
    });
    console.log('    URL nach Navigation:', page.url());
    await waitForTypeCards(page);
    await wait(500);
    let typeCards2;
    try { await page.waitForSelector('.type-card', { timeout: 5000 }); } catch(e) {}
    typeCards2 = await page.$$('.type-card');
    console.log('    type-cards gefunden:', typeCards2.length);
    if (typeCards2.length > 1) {
      await typeCards2[1].click(); // Juristische Person
      await wait(500);
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent.trim().includes('Weiter') && !b.disabled);
        if (btn) btn.click();
      });
      await wait(800);
      await capture(page, 'Neuer Antrag – Angaben Juristische Person', '12-antrag-jur-step2.png', shots);

      // Fill form fields
      const inputs2 = await page.$$('input.p-inputtext, input[pInputText]');
      console.log('    Eingabefelder gefunden:', inputs2.length);
      if (inputs2[0]) { await inputs2[0].click(); await inputs2[0].type('ORF GmbH'); }
      if (inputs2[1]) { await inputs2[1].click(); await inputs2[1].type('+43 1 878 78 0'); }
      await wait(400);

      // Inject files via Angular component to pass validation
      await page.evaluate(() => {
        const comp = window.ng && window.ng.getComponent(document.querySelector('app-antrag'));
        if (comp) {
          const f = new File(['mock'], 'mock.pdf', { type: 'application/pdf' });
          comp.firmenbuchFile = f;
          comp.vollmachtFile = f;
          comp.jurSubmitted = false; // reset validation state
        }
      });
      await wait(300);

      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent.trim().includes('Weiter') && !b.disabled);
        if (btn) btn.click();
      });
      await wait(1000);
      console.log('    Step nach Weiter:', await page.evaluate(() => {
        const h3 = document.querySelector('app-antrag .page-card h3');
        return h3 ? h3.textContent.trim().slice(0, 30) : 'unknown';
      }));

      await capture(page, 'Neuer Antrag – Werke (Juristische Person)', '13-antrag-jur-step3.png', shots);

      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent.trim().includes('einreichen') && !b.disabled);
        if (btn) btn.click();
      });
      await wait(2200);
      console.log('    URL nach Jur-Submit:', page.url());
      await capture(page, 'Dashboard – Juristische Person (mit Antrag)', '14-dashboard-jur.png', shots);

      // ── 14c. Zweiten Antrag via globalen Service-Hook ──
      console.log('\n[Zweiter Juristischer Antrag (via __antragService)]');
      const injected = await page.evaluate(() => {
        try {
          const svc = window.__antragService;
          if (!svc) return 'no __antragService';
          svc.submitAntrag('Juristische Person', 'KIDS GmbH');
          return 'ok:' + svc.getJurAntraege().length;
        } catch(e) { return 'error:' + e.message; }
      });
      console.log('    Ergebnis:', injected);
      await wait(800);
      // Trigger change detection
      await page.evaluate(() => {
        try { window.ng && window.ng.applyChanges(document.querySelector('app-root')); } catch(e) {}
      });
      await wait(800);

      // ── 14d. Dropdown öffnen ──
      console.log('\n[Dashboard – Dropdown öffnen]');
      const dropdownExists = await page.evaluate(() => !!document.querySelector('p-dropdown'));
      console.log('    Dropdown vorhanden:', dropdownExists);
      if (dropdownExists) {
        const bb = await page.evaluate(() => {
          const el = document.querySelector('p-dropdown');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        });
        if (bb) await page.mouse.click(bb.x, bb.y);
        await wait(1500);
      }
      const panelVisible = await page.evaluate(() => !!document.querySelector('.p-dropdown-panel'));
      console.log('    Dropdown-Panel sichtbar:', panelVisible);
      await capture(page, 'Dashboard – Antragsauswahl Dropdown (Juristische Person)', '14d-dashboard-jur-dropdown.png', shots);
    } else {
      console.log('    ⚠️  Nicht genug type-cards');
    }

    // ── 11. Meine Anträge ──────────────────────
    console.log('\n[Meine Anträge]');
    await clickSidebarLink(page, 'Meine Anträge');
    await capture(page, 'Meine Anträge', '15-antraege.png', shots);

  } catch (err) {
    console.error('\n⚠️  Fehler:', err.message);
    console.error(err.stack);
  }

  await browser.close();
  console.log(`\n${shots.length} Screenshots erstellt. PDF wird erstellt ...`);
  buildPDF(shots);
}

// ──────────────────────────────────────────────
function buildPDF(shots) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 45, left: 40, right: 40, bottom: 40 },
    info: {
      Title: 'UrheberDB – Mockup-Dokumentation',
      Author: 'ORF',
      Subject: 'Screenflow der UrheberDB-Anwendung'
    }
  });

  doc.pipe(fs.createWriteStream(PDF_OUT));

  // ── Deckblatt ────────────────────────────────
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a1a1a');
  doc.rect(0, doc.page.height / 2 - 100, doc.page.width, 4).fill('#e2001a');

  doc.fontSize(36).font('Helvetica-Bold').fillColor('#ffffff')
     .text('UrheberDB', 40, doc.page.height / 2 - 75, { align: 'center' });
  doc.fontSize(16).font('Helvetica').fillColor('#cccccc')
     .text('Mockup-Screenflow', 40, doc.page.height / 2 - 30, { align: 'center' });
  doc.fontSize(11).fillColor('#999999')
     .text(`Stand: ${new Date().toLocaleDateString('de-AT', { day: '2-digit', month: 'long', year: 'numeric' })}`,
           40, doc.page.height / 2 + 10, { align: 'center' });

  // ── Screenshots ──────────────────────────────
  shots.forEach((s, i) => {
    doc.addPage();

    // Header bar
    doc.rect(0, 0, doc.page.width, 38).fill('#1a1a1a');
    doc.fontSize(9).font('Helvetica').fillColor('#999')
       .text('UrheberDB Mockup', 40, 14);
    doc.fontSize(9).fillColor('#ccc')
       .text(`${i + 1} / ${shots.length}`, 0, 14, { align: 'right', width: doc.page.width - 40 });

    // Title
    doc.fontSize(15).font('Helvetica-Bold').fillColor('#1a1a1a')
       .text(s.title, 40, 50);

    // Red accent line
    doc.rect(40, 73, 515, 2).fill('#e2001a');

    // Screenshot
    if (fs.existsSync(s.path)) {
      doc.image(s.path, 40, 83, { width: 515, align: 'center' });
    } else {
      doc.fontSize(11).font('Helvetica').fillColor('#aaa')
         .text('Screenshot nicht verfügbar', 40, 90);
    }
  });

  doc.end();

  doc.on('finish', () => {
    console.log(`\n✅  PDF erfolgreich erstellt:\n   ${PDF_OUT}\n`);
  });
}

// ──────────────────────────────────────────────
main().catch(err => {
  console.error('Unerwarteter Fehler:', err);
  process.exit(1);
});
