// Plays the main loop in a headless browser (jsdom) and reports any failures or runtime errors.
// Run from the project folder, after `npm i --no-save jsdom`:
//   node tools/smoke-test.mjs
// Exits with code 1 if anything fails.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); }
catch { console.error("jsdom is not installed. Run: npm i --no-save jsdom"); process.exit(1); }

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errs = [];
let failed = 0;
const ok = (name, cond) => { if (!cond) failed++; console.log((cond ? "PASS " : "FAIL ") + name); };
const wait = ms => new Promise(r => setTimeout(r, ms));

// A stand-in for the Groq proxy: returns a stock list and a buyer for each item asked about
const reply = { character: "busy port town", weights: { luxury: 2, useful: 4, cultural: 3, food: 4 },
  items: [{ name: "Sea salt", craft: "Salt pans", origin_note: "Coastal pans", value: 4, supply: 8, kind: "food" },
          { name: "Rope", craft: "Ropemaker", origin_note: "Hemp", value: 3, supply: 9, kind: "useful" }], buyers: [] };

const dom = new JSDOM(fs.readFileSync(path.join(root, "index.html"), "utf8"), {
  runScripts: "dangerously", resources: "usable", pretendToBeVisual: true, url: "file://" + root + "/index.html",
  beforeParse(w) {
    w.onerror = e => errs.push(String(e).slice(0, 160));
    w.matchMedia = q => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
    w.fetch = (url, opts) => {
      const p = JSON.parse(opts.body).messages[0].content;
      const r = JSON.parse(JSON.stringify(reply));
      const m = p.match(/Items: (\[.*\])\n?/);
      if (m) JSON.parse(m[1]).forEach(it => r.buyers.push({ ref: it.ref, name: "Buyer " + it.name, type: "dealer", line: "Keen.", demand: 6, savvy: 3 }));
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ choices: [{ message: { content: JSON.stringify(r) } }] }) });
    };
  }
});
const w = dom.window, D = w.document;

setTimeout(async () => {
  ok("town functions are globals", typeof w.restPage === "function" && typeof w.waitHtml === "function");
  ok("start screen", D.getElementById("app").textContent.includes("Start journey"));

  w.beginTo("lon", "rom"); await wait(4000);
  ok("journey plan renders", !!D.querySelector(".mapdock"));

  w.S.phase = "move"; w.S.ev = true; w.S.loc = w.S.start; w.roll = () => 7;
  w.hop(0, w.S.h); await wait(2500);
  const card = D.querySelector(".evcard button");
  if (card) card.click();          // the question and outcome card, shown half way along the route
  await wait(1500);
  ok("hop completes", !w.MJ.anim && !D.querySelector(".evlayer"));

  w.S.loc = w.S.goal; w.S.arrH = w.S.h; w.S.lmOn = false; w.S.phase = "arrive"; w.render();
  ok("arrival card renders", !!D.querySelector(".arrive"));

  w.S.phase = "rest"; w.S.camp.marketOpen = false; w.render();
  ok("rest page renders with things to do", D.querySelectorAll("a.btn").length === 5);

  w.restVisit(); await wait(300);
  ok("market opens on rest day", !!D.querySelector(".mgrid"));
  w.restBuyAt(0); ok("buy works", w.S.camp.pack.length === 1);
  w.restVisit(); await wait(300);
  ok("buyer found for pack item", !!w.S.camp.pack[0].buyer);
  w.restSell(w.S.camp.pack[0].uid); ok("sell works", w.S.camp.pack.length === 0);

  w.S.phase = "move"; w.S.loc = w.S.start; w.S.ev = false;
  const realSched = w.sched; w.sched = (o, f, t) => ({ dep: t + 4, night: 0, ns: 0, nn: 1 });
  w.go(0); ok("wait screen renders", w.S.phase === "wait" && /Waiting for/.test(D.getElementById("app").textContent));
  w.sched = realSched;
  w.cancelWait(); ok("cancel returns to options", w.S.phase === "move");

  w.S.interimUsed = 1; w.S.cash = 0; w.render();
  ok("stranded ends the leg as a rest day", w.S.phase === "rest" && w.S.stranded === 1);
  ok("stranded page renders", /Stranded in/.test(D.getElementById("app").textContent));

  console.log("runtime errors: " + (errs.length ? errs.join(" | ") : "none"));
  if (errs.length) failed++;
  console.log(failed ? "\nSMOKE TEST FAILED" : "\nSmoke test passed");
  process.exit(failed ? 1 : 0);
}, 4000);
