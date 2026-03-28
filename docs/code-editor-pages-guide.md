# Code Editor – Product, Contact & Community Pages
### Extended guide mapping Wearix inner pages to a developer tool

---

## Contents

1. [Product / Plugin Detail Page](#1-product--plugin-detail-page)
2. [Community Showcase Section](#2-community-showcase-section)
3. [Contact Page](#3-contact-page)
4. [Design System Tokens (shared across all pages)](#4-shared-design-tokens)

---

## 1. Product / Plugin Detail Page

### Layout Mapping: Wearix Product → Codex Plugin Detail

| Wearix Element | Code Editor Equivalent |
|---|---|
| "New" badge top-left of image | "New" / "Beta" / "Popular" badge |
| Breadcrumb: Shop › Men's Wear | Breadcrumb: Plugins › Language Support |
| Large product image (left 55%) | Plugin preview / animated editor demo (left 55%) |
| Thumbnail strip (5 color variants) | Tab strip: Preview · Config · Changelog · Docs |
| Product name heading | Plugin name heading |
| Sale price + strikethrough original | Free / Pro tier price with "was $X" |
| Short description paragraph | Short plugin description |
| "Order Now" full-width black CTA | "Install Plugin" full-width accent CTA |
| Specs table: Material · Care · Warranty | Specs table: Language · License · Compatibility |

### Full HTML + CSS

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Codex – Plugin Detail</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Sora:wght@300;400;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0d0d0d; --surface: #141414; --surface2: #1c1c1c;
      --border: #262626; --text: #f0ede8; --muted: #777;
      --accent: #c6f135; --radius: 14px;
      --mono: 'JetBrains Mono', monospace;
      --sans: 'Sora', sans-serif;
    }
    body { background: var(--bg); color: var(--text); font-family: var(--sans); }

    /* ── Ticker ── */
    .ticker { background: var(--accent); color: #0d0d0d; font-family: var(--mono);
      font-size: .72rem; font-weight: 700; letter-spacing:.05em; padding: 7px 0;
      overflow: hidden; white-space: nowrap; }
    .ticker-inner { display: inline-block; animation: tick 30s linear infinite; }
    .ticker-inner span { margin-right: 56px; }
    @keyframes tick { to { transform: translateX(-50%); } }

    /* ── Nav ── */
    nav { display: flex; align-items: center; justify-content: space-between;
      padding: 18px 48px; border-bottom: 1px solid var(--border);
      background: rgba(13,13,13,.9); backdrop-filter: blur(14px);
      position: sticky; top: 0; z-index: 100; }
    .logo { font-family: var(--mono); font-weight: 700; letter-spacing:.08em;
      font-size: 1rem; color: var(--text); text-decoration: none; }
    .nav-links { display: flex; gap: 32px; list-style: none; }
    .nav-links a { color: var(--muted); text-decoration: none; font-size:.875rem;
      transition: color .2s; }
    .nav-links a:hover { color: var(--text); }
    .btn { border-radius: 100px; padding: 10px 22px; font-size: .875rem;
      font-weight: 600; cursor: pointer; border: none; transition: all .2s; }
    .btn-solid { background: var(--text); color: var(--bg); }
    .btn-solid:hover { background: var(--accent); }

    /* ── Breadcrumb ── */
    .breadcrumb { padding: 20px 48px 0; display: flex; align-items: center;
      gap: 8px; font-size: .8rem; color: var(--muted); font-family: var(--mono); }
    .breadcrumb span { color: var(--accent); font-size: .5rem; }

    /* ── Product Layout ── */
    .product { display: grid; grid-template-columns: 1fr 1fr;
      gap: 0; padding: 32px 48px 80px; min-height: 70vh; }

    /* Left: preview pane */
    .preview-wrap { position: relative; }
    .badge { display: inline-flex; align-items: center; gap: 5px;
      background: rgba(198,241,53,.13); color: var(--accent);
      font-family: var(--mono); font-size: .68rem; font-weight: 700;
      letter-spacing:.06em; padding: 4px 10px; border-radius: 100px;
      position: absolute; top: 20px; left: 20px; z-index: 2; }
    .preview-box { background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); height: 420px; overflow: hidden;
      display: flex; flex-direction: column; }
    .preview-topbar { display: flex; gap: 6px; padding: 12px 16px;
      border-bottom: 1px solid var(--border); }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot-r { background: #ff5f57; } .dot-y { background: #febc2e; }
    .dot-g { background: #28c840; }
    .preview-code { padding: 20px 24px; font-family: var(--mono);
      font-size: .74rem; line-height: 2; flex: 1; overflow: hidden; }
    .kw { color: #8ab4f8; } .fn { color: var(--accent); }
    .str { color: #f0a070; } .cm { color: #3d3d3d; }
    .cursor { display: inline-block; width: 2px; height: 14px;
      background: var(--accent); vertical-align: middle;
      animation: blink 1s step-end infinite; }
    @keyframes blink { 50% { opacity: 0; } }

    /* Thumbnail tabs */
    .thumb-strip { display: flex; gap: 10px; margin-top: 14px; }
    .thumb { flex: 1; background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 10px 8px; font-family: var(--mono);
      font-size: .65rem; color: var(--muted); text-align: center;
      cursor: pointer; transition: all .2s; }
    .thumb.active { border-color: var(--accent); color: var(--accent); }
    .thumb:hover { border-color: #444; color: var(--text); }

    /* Right: info pane */
    .info { padding: 0 0 0 56px; display: flex; flex-direction: column; gap: 0; }
    .info h1 { font-family: var(--mono); font-size: 2rem; font-weight: 700;
      line-height: 1.2; margin-bottom: 20px; }
    .pricing { display: flex; align-items: baseline; gap: 14px; margin-bottom: 24px; }
    .price-now { font-family: var(--mono); font-size: 1.5rem; font-weight: 700; }
    .price-was { font-family: var(--mono); font-size: 1rem; color: var(--muted);
      text-decoration: line-through; }
    .desc { color: var(--muted); font-size: .9rem; line-height: 1.7;
      margin-bottom: 32px; max-width: 440px; }
    .btn-install { width: 100%; background: var(--text); color: var(--bg);
      border: none; border-radius: 100px; padding: 16px; font-size: 1rem;
      font-weight: 700; cursor: pointer; font-family: var(--sans);
      transition: background .2s, transform .15s; margin-bottom: 40px; }
    .btn-install:hover { background: var(--accent); transform: translateY(-2px); }

    /* Specs table */
    .specs { border-top: 1px solid var(--border); }
    .spec-row { display: flex; align-items: center; justify-content: space-between;
      padding: 16px 0; border-bottom: 1px solid var(--border); }
    .spec-label { display: flex; align-items: center; gap: 10px;
      font-weight: 600; font-size: .875rem; }
    .spec-icon { font-size: 1rem; }
    .spec-val { color: var(--muted); font-size: .875rem; }
  </style>
</head>
<body>

  <div class="ticker">
    <div class="ticker-inner">
      <span>✦ v3.0 now stable</span><span>✦ 40+ plugins</span>
      <span>✦ Free during beta</span><span>✦ Copilot mode</span>
      <span>✦ v3.0 now stable</span><span>✦ 40+ plugins</span>
      <span>✦ Free during beta</span><span>✦ Copilot mode</span>
    </div>
  </div>

  <nav>
    <a href="#" class="logo">CODEX</a>
    <ul class="nav-links">
      <li><a href="#">Docs</a></li><li><a href="#">Features</a></li>
      <li><a href="#">Plugins</a></li><li><a href="#">Changelog</a></li>
      <li><a href="#">GitHub</a></li>
    </ul>
    <button class="btn btn-solid">Download free</button>
  </nav>

  <div class="breadcrumb">
    Plugins <span>●</span> Language Support
  </div>

  <section class="product">
    <!-- LEFT: Preview -->
    <div class="preview-wrap">
      <div class="badge">✦ New</div>
      <div class="preview-box">
        <div class="preview-topbar">
          <div class="dot dot-r"></div>
          <div class="dot dot-y"></div>
          <div class="dot dot-g"></div>
        </div>
        <div class="preview-code">
          <div class="cm">// rust-lang plugin active</div>
          <div><span class="kw">use</span> std::collections::<span class="fn">HashMap</span>;</div>
          <div>&nbsp;</div>
          <div><span class="kw">fn</span> <span class="fn">word_count</span>(text: &amp;<span class="kw">str</span>) {</div>
          <div>  <span class="kw">let mut</span> map = <span class="fn">HashMap</span>::new();</div>
          <div>  <span class="kw">for</span> word <span class="kw">in</span> text.<span class="fn">split_whitespace</span>() {</div>
          <div>    *map.<span class="fn">entry</span>(word).<span class="fn">or_insert</span>(<span class="str">0</span>) += <span class="str">1</span>;</div>
          <div>  }</div>
          <div>  map<span class="cursor"></span></div>
        </div>
      </div>
      <div class="thumb-strip">
        <div class="thumb active">Preview</div>
        <div class="thumb">Config</div>
        <div class="thumb">Changelog</div>
        <div class="thumb">Docs</div>
      </div>
    </div>

    <!-- RIGHT: Info -->
    <div class="info">
      <h1>Rust Language<br>Support</h1>
      <div class="pricing">
        <span class="price-now">FREE</span>
        <span class="price-was">was $9.00/mo</span>
      </div>
      <p class="desc">
        Full Rust support with semantic highlighting, inline diagnostics,
        cargo integration, and blazing-fast completions powered by rust-analyzer.
      </p>
      <button class="btn-install">Install Plugin</button>
      <div class="specs">
        <div class="spec-row">
          <span class="spec-label"><span class="spec-icon">⚙️</span> Language</span>
          <span class="spec-val">Rust (2021 edition)</span>
        </div>
        <div class="spec-row">
          <span class="spec-label"><span class="spec-icon">📄</span> License</span>
          <span class="spec-val">MIT Open Source</span>
        </div>
        <div class="spec-row">
          <span class="spec-label"><span class="spec-icon">✅</span> Compatibility</span>
          <span class="spec-val">Codex v2.4+</span>
        </div>
      </div>
    </div>
  </section>

</body>
</html>
```

---

## 2. Community Showcase Section

### Layout Mapping: Wearix "Community in Silhouettes" → Codex "Built with Codex"

| Wearix Element | Code Editor Equivalent |
|---|---|
| Center-aligned large headline | "Built by our community" headline |
| Subtext about social media | Subtext inviting GitHub/Discord sharing |
| Two CTAs: "See collections" + "Contact us" | Two CTAs: "Browse plugins" + "Join Discord" |
| Overflowing photo mosaic (mixed card sizes) | Overflowing project card mosaic (repos, screenshots) |
| Large bleed images on left/right edges | Large featured project cards bleeding off-screen |

### Full HTML + CSS

```html
<section class="community">
  <div class="comm-header">
    <h2>Built by our<br><em>community</em></h2>
    <p>Share your setup, plugins, and workflows. 
       Get featured in the Codex showcase.</p>
    <div class="comm-ctas">
      <button class="btn-filled">Browse plugins</button>
      <button class="btn-ghost">Join Discord →</button>
    </div>
  </div>

  <!-- Mosaic: alternating card sizes mirror the Wearix photo waterfall -->
  <div class="mosaic">
    <div class="mosaic-card tall">
      <div class="card-img" style="background:#1a1a2e">
        <span class="proj-lang">Rust</span>
      </div>
      <div class="card-meta"><strong>zero-http</strong><span>@akirah</span></div>
    </div>
    <div class="mosaic-card">
      <div class="card-img" style="background:#0d2137">
        <span class="proj-lang">TS</span>
      </div>
      <div class="card-meta"><strong>ts-canvas</strong><span>@devmei</span></div>
    </div>
    <div class="mosaic-card">
      <div class="card-img" style="background:#1e1207">
        <span class="proj-lang">Go</span>
      </div>
      <div class="card-meta"><strong>goqueue</strong><span>@lkrenz</span></div>
    </div>
    <div class="mosaic-card">
      <div class="card-img" style="background:#0e1f0e">
        <span class="proj-lang">Python</span>
      </div>
      <div class="card-meta"><strong>ml-pipe</strong><span>@szymek</span></div>
    </div>
    <div class="mosaic-card">
      <div class="card-img" style="background:#1c0d1c">
        <span class="proj-lang">Zig</span>
      </div>
      <div class="card-meta"><strong>zigtools</strong><span>@ndoro</span></div>
    </div>
    <div class="mosaic-card tall">
      <div class="card-img" style="background:#0d1a1a">
        <span class="proj-lang">C++</span>
      </div>
      <div class="card-meta"><strong>cpp-lsp</strong><span>@hiroto</span></div>
    </div>
  </div>
</section>

<style>
  .community { padding: 80px 0; overflow: hidden; }

  .comm-header { text-align: center; padding: 0 48px 56px; }
  .comm-header h2 { font-family: var(--mono); font-size: clamp(2rem,4vw,3.2rem);
    font-weight: 700; line-height: 1.2; margin-bottom: 16px; }
  .comm-header h2 em { font-style: normal; color: var(--accent); }
  .comm-header p { color: var(--muted); font-size: .95rem; max-width: 420px;
    margin: 0 auto 28px; line-height: 1.7; }
  .comm-ctas { display: flex; gap: 12px; justify-content: center; }
  .btn-filled { background: var(--text); color: var(--bg); border: none;
    border-radius: 100px; padding: 12px 26px; font-weight: 700; cursor: pointer;
    transition: background .2s; }
  .btn-filled:hover { background: var(--accent); }
  .btn-ghost { background: transparent; color: var(--text);
    border: 1px solid var(--border); border-radius: 100px;
    padding: 12px 26px; font-weight: 500; cursor: pointer;
    transition: border-color .2s; }
  .btn-ghost:hover { border-color: var(--text); }

  /* Mosaic — mirrors the Wearix photo strip overflow */
  .mosaic { display: flex; gap: 12px; padding: 0 48px;
    overflow-x: auto; scrollbar-width: none; align-items: flex-end; }
  .mosaic::-webkit-scrollbar { display: none; }
  .mosaic-card { flex-shrink: 0; width: 200px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); overflow: hidden;
    transition: transform .25s; cursor: pointer; }
  .mosaic-card:hover { transform: translateY(-6px); }
  .mosaic-card.tall { margin-bottom: -40px; }  /* bleed effect */
  .card-img { height: 180px; display: flex; align-items: center;
    justify-content: center; }
  .mosaic-card.tall .card-img { height: 260px; }
  .proj-lang { font-family: var(--mono); font-size: .72rem; font-weight: 700;
    color: var(--accent); background: rgba(198,241,53,.1);
    border: 1px solid rgba(198,241,53,.2); border-radius: 6px;
    padding: 4px 10px; }
  .card-meta { padding: 12px 14px; display: flex; flex-direction: column; gap: 2px; }
  .card-meta strong { font-family: var(--mono); font-size: .8rem; }
  .card-meta span { font-size: .72rem; color: var(--muted); }
</style>
```

### Key Technique: The Overflow Bleed Mosaic

Wearix achieves its cinematic photo strip by letting the tallest cards bleed off-screen. Replicate this with:

```css
/* Container scrolls horizontally with no scrollbar visible */
.mosaic { display: flex; overflow-x: auto; scrollbar-width: none; align-items: flex-end; }

/* Tall cards get a negative bottom margin to "sink" below the baseline */
.mosaic-card.tall { margin-bottom: -40px; }
```

---

## 3. Contact Page

### Layout Mapping: Wearix Contact → Codex Contact

| Wearix Element | Code Editor Equivalent |
|---|---|
| 3 info cards (email · phone · location) | 3 info cards (email · Discord · GitHub) |
| Left: full-height lifestyle photo | Left: animated terminal / code window |
| Right: form with First Name, Last Name, Email, Phone, Subject, Message | Right: form with Name, Email, Team Size, Subject, Message |

### Full HTML + CSS

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Codex – Contact</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Sora:wght@300;400;600&display=swap" rel="stylesheet" />
  <style>
    /* (inherit :root variables from shared token file — see §4) */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0d0d0d; --surface: #141414; --border: #262626;
      --text: #f0ede8; --muted: #777; --accent: #c6f135;
      --radius: 14px; --mono: 'JetBrains Mono', monospace;
      --sans: 'Sora', sans-serif;
    }
    body { background: var(--bg); color: var(--text); font-family: var(--sans); }

    /* ── Info Cards ── */
    .contact-info { display: grid; grid-template-columns: repeat(3,1fr);
      gap: 16px; padding: 40px 48px 32px; }
    .info-card { background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 28px 24px; text-align: center;
      transition: border-color .2s; }
    .info-card:hover { border-color: var(--accent); }
    .info-card .val { font-family: var(--mono); font-size: 1rem; font-weight: 700;
      margin-bottom: 6px; }
    .info-card .label { font-size: .8rem; color: var(--muted); }

    /* ── Two-column layout ── */
    .contact-body { display: grid; grid-template-columns: 1fr 1fr;
      gap: 24px; padding: 0 48px 80px; }

    /* Left: terminal window */
    .terminal { background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); overflow: hidden; height: 100%;
      min-height: 460px; display: flex; flex-direction: column; }
    .term-bar { display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; border-bottom: 1px solid var(--border); }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot-r{background:#ff5f57}.dot-y{background:#febc2e}.dot-g{background:#28c840}
    .term-body { padding: 20px 24px; font-family: var(--mono);
      font-size: .78rem; line-height: 2; flex: 1; }
    .term-prompt { color: var(--accent); }
    .term-out { color: #555; }
    .cursor { display: inline-block; width: 8px; height: 14px;
      background: var(--accent); vertical-align: middle;
      animation: blink 1s step-end infinite; }
    @keyframes blink { 50% { opacity: 0; } }

    /* Right: form */
    .contact-form { display: flex; flex-direction: column; gap: 0; }
    .contact-form h2 { font-family: var(--mono); font-size: 1.6rem;
      font-weight: 700; margin-bottom: 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
    .field label { font-size: .8rem; font-weight: 600; color: var(--muted);
      font-family: var(--mono); letter-spacing: .04em; }
    .field input, .field select, .field textarea {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 12px 14px; color: var(--text);
      font-family: var(--sans); font-size: .875rem; outline: none;
      transition: border-color .2s; }
    .field input::placeholder, .field textarea::placeholder { color: #3a3a3a; }
    .field input:focus, .field textarea:focus { border-color: var(--accent); }
    .field textarea { resize: vertical; min-height: 120px; }
    .btn-send { width: 100%; background: var(--text); color: var(--bg);
      border: none; border-radius: 100px; padding: 15px; font-size: 1rem;
      font-weight: 700; cursor: pointer; font-family: var(--sans);
      margin-top: 8px; transition: background .2s, transform .15s; }
    .btn-send:hover { background: var(--accent); transform: translateY(-2px); }
  </style>
</head>
<body>

  <!-- Info strip -->
  <div class="contact-info">
    <div class="info-card">
      <div class="val">hello@codex.dev</div>
      <div class="label">Email Address</div>
    </div>
    <div class="info-card">
      <div class="val">discord.gg/codex</div>
      <div class="label">Community Discord</div>
    </div>
    <div class="info-card">
      <div class="val">github.com/codex-editor</div>
      <div class="label">Open Source Repo</div>
    </div>
  </div>

  <!-- Body: terminal + form -->
  <div class="contact-body">

    <!-- LEFT: Animated terminal (replaces lifestyle photo) -->
    <div class="terminal">
      <div class="term-bar">
        <div class="dot dot-r"></div>
        <div class="dot dot-y"></div>
        <div class="dot dot-g"></div>
      </div>
      <div class="term-body">
        <div><span class="term-prompt">❯</span> codex --version</div>
        <div class="term-out">  Codex v3.0.1 (stable)</div>
        <div>&nbsp;</div>
        <div><span class="term-prompt">❯</span> codex plugin list</div>
        <div class="term-out">  ✓ rust-analyzer   active</div>
        <div class="term-out">  ✓ prettier         active</div>
        <div class="term-out">  ✓ gitlens          active</div>
        <div class="term-out">  ○ copilot          inactive</div>
        <div>&nbsp;</div>
        <div><span class="term-prompt">❯</span> codex plugin install copilot</div>
        <div class="term-out">  Downloading... ████████░░ 83%</div>
        <div><span class="cursor"></span></div>
      </div>
    </div>

    <!-- RIGHT: Contact form -->
    <div class="contact-form">
      <h2>Get in touch</h2>

      <div class="form-row">
        <div class="field">
          <label>FIRST NAME</label>
          <input type="text" placeholder="Ada" />
        </div>
        <div class="field">
          <label>LAST NAME</label>
          <input type="text" placeholder="Lovelace" />
        </div>
      </div>

      <div class="form-row">
        <div class="field">
          <label>EMAIL</label>
          <input type="email" placeholder="ada@example.com" />
        </div>
        <div class="field">
          <label>TEAM SIZE</label>
          <input type="text" placeholder="Solo / 2–10 / 10+" />
        </div>
      </div>

      <div class="field">
        <label>SUBJECT</label>
        <input type="text" placeholder="Plugin request, bug report, partnership..." />
      </div>

      <div class="field">
        <label>MESSAGE</label>
        <textarea placeholder="Tell us what you're building..."></textarea>
      </div>

      <button class="btn-send">Send Message</button>
    </div>

  </div>

</body>
</html>
```

---

## 4. Shared Design Tokens

Paste this `:root` block once into a `tokens.css` and import it across all pages so typography, colors, and spacing stay consistent:

```css
/* tokens.css */
:root {
  /* Colors */
  --bg:       #0d0d0d;   /* page background */
  --surface:  #141414;   /* card / input background */
  --surface2: #1c1c1c;   /* elevated surface */
  --border:   #262626;   /* default border */
  --text:     #f0ede8;   /* primary text */
  --muted:    #777;      /* secondary / placeholder text */
  --accent:   #c6f135;   /* electric lime accent */

  /* Typography */
  --mono: 'JetBrains Mono', monospace;   /* headings, code, labels */
  --sans: 'Sora', sans-serif;            /* body, forms, UI copy */

  /* Shape */
  --radius:   14px;
  --radius-sm: 8px;
  --radius-pill: 100px;

  /* Spacing scale */
  --space-xs: 8px;   --space-sm: 16px;
  --space-md: 24px;  --space-lg: 48px;
  --space-xl: 80px;
}
```

---

## 5. Summary: Page-by-Page Pattern Map

```
WEARIX PATTERN              →   CODEX EQUIVALENT
─────────────────────────────────────────────────
Announcement ticker          →   Release / beta status ticker
Sticky blur navbar           →   Same — logo + nav + download CTA
Product page (image + info)  →   Plugin page (code preview + info)
Thumbnail strip              →   Tab strip (Preview · Config · Docs)
Spec rows (Material/Care)    →   Spec rows (Language/License/Compat)
Community photo mosaic       →   Project card mosaic (repos by users)
Bleed tall cards             →   Tall project cards sinking off-grid
Info card row (email/phone)  →   Info card row (email/Discord/GitHub)
Lifestyle photo (contact)    →   Animated terminal window (contact)
Split contact form           →   Same split layout, dev-tool fields
```

---

*All three pages share the same design token file and can be composed into a full multi-page site.*
