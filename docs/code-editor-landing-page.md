# Building a Code Editor Landing Page
### Inspired by the Wearix ecommerce layout pattern

---

## Overview

This guide walks through how to build a **modern, minimal landing page for a code editor** — modeled after the structural patterns seen in the Wearix fashion site. We'll map each section of the Wearix layout to a developer-tool equivalent, then provide the full HTML/CSS implementation.

---

## 1. Layout Anatomy: Wearix → Code Editor

| Wearix Element | Code Editor Equivalent |
|---|---|
| Black announcement bar ("Black Friday sale 50% off") | Status ticker ("v3.0 now stable · Copilot mode · Free during beta") |
| Logo + nav links (Home, About, Shop, Blog, Contact) | Logo + nav links (Docs, Features, Pricing, Changelog, GitHub) |
| "Shop all items" CTA button | "Download free" CTA button |
| Hero headline "Fresh fits in our latest drop" | Hero headline "Write code that feels natural" |
| "See all collections" secondary CTA | "Explore all features" secondary CTA |
| 3-column product grid (t-shirt, blazer, jeans) | 3-column feature/showcase grid (editor views, plugin cards) |
| "New" badge on each card | "New" / "Beta" / "Popular" badges on feature cards |

---

## 2. Design Direction

**Aesthetic**: Dark-mode industrial meets editorial minimalism.

- **Font pairing**: `JetBrains Mono` for headings (on-brand for a code editor), `Inter` for body
- **Color palette**: Near-black `#0d0d0d` background, off-white `#f0ede8` text, electric lime `#c6f135` as the accent
- **Motion**: Staggered card reveals on load, hover lifts on feature cards
- **Details**: Monospace ticker tape, subtle grid texture on background, pill badges

---

## 3. Page Structure

```
┌─────────────────────────────────────────────┐
│  TICKER BAR  (scrolling announcement)        │
├─────────────────────────────────────────────┤
│  NAVBAR  Logo ··· Nav Links ··· Download CTA │
├─────────────────────────────────────────────┤
│                                             │
│  HERO                                       │
│  Big headline (left-aligned)                │
│                          [See all features] │
│                                             │
├─────────────────────────────────────────────┤
│  FEATURE GRID  [card] [card] [card]          │
└─────────────────────────────────────────────┘
```

---

## 4. Full HTML + CSS Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Codex – Code Editor</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    /* ── Reset & Base ─────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:      #0d0d0d;
      --surface: #161616;
      --border:  #2a2a2a;
      --text:    #f0ede8;
      --muted:   #888;
      --accent:  #c6f135;
      --radius:  12px;
      --mono:    'JetBrains Mono', monospace;
      --sans:    'Inter', sans-serif;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--sans);
      min-height: 100vh;
      /* subtle dot grid texture */
      background-image: radial-gradient(circle, #2a2a2a 1px, transparent 1px);
      background-size: 28px 28px;
    }

    /* ── Ticker Bar ───────────────────────────── */
    .ticker {
      background: var(--accent);
      color: #0d0d0d;
      font-family: var(--mono);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 8px 0;
      overflow: hidden;
      white-space: nowrap;
    }

    .ticker-inner {
      display: inline-block;
      animation: scroll-ticker 30s linear infinite;
    }

    .ticker-inner span {
      margin-right: 64px;
    }

    @keyframes scroll-ticker {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }

    /* ── Navbar ───────────────────────────────── */
    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 48px;
      border-bottom: 1px solid var(--border);
      background: rgba(13, 13, 13, 0.85);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-logo {
      font-family: var(--mono);
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text);
      text-decoration: none;
    }

    .nav-links {
      display: flex;
      gap: 36px;
      list-style: none;
    }

    .nav-links a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.2s;
    }

    .nav-links a:hover { color: var(--text); }

    .btn-primary {
      background: var(--text);
      color: var(--bg);
      border: none;
      border-radius: 100px;
      padding: 10px 22px;
      font-family: var(--sans);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }

    .btn-primary:hover {
      background: var(--accent);
      transform: translateY(-1px);
    }

    /* ── Hero ─────────────────────────────────── */
    .hero {
      padding: 80px 48px 48px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .hero h1 {
      font-family: var(--mono);
      font-size: clamp(2.4rem, 5vw, 4rem);
      font-weight: 700;
      line-height: 1.15;
      max-width: 560px;
    }

    .hero h1 em {
      font-style: normal;
      color: var(--accent);
    }

    .btn-secondary {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 100px;
      padding: 12px 26px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: border-color 0.2s, background 0.2s;
      flex-shrink: 0;
      margin-bottom: 8px;
    }

    .btn-secondary:hover {
      border-color: var(--text);
      background: var(--surface);
    }

    /* ── Feature Grid ─────────────────────────── */
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 32px 48px 80px;
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.25s ease, border-color 0.25s;
      animation: fade-up 0.5s ease both;
    }

    .card:nth-child(1) { animation-delay: 0.05s; }
    .card:nth-child(2) { animation-delay: 0.15s; }
    .card:nth-child(3) { animation-delay: 0.25s; }

    @keyframes fade-up {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .card:hover {
      transform: translateY(-4px);
      border-color: #444;
    }

    /* Simulated editor / feature preview inside card */
    .card-preview {
      height: 240px;
      background: #111;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid var(--border);
      position: relative;
      overflow: hidden;
    }

    /* Code preview lines (decorative) */
    .code-lines {
      font-family: var(--mono);
      font-size: 0.72rem;
      line-height: 1.9;
      color: #555;
      padding: 20px 24px;
      width: 100%;
      height: 100%;
    }

    .code-lines .hl  { color: #c6f135; }
    .code-lines .str { color: #f0a070; }
    .code-lines .kw  { color: #8ab4f8; }
    .code-lines .cm  { color: #4a4a4a; }

    .card-body {
      padding: 20px 24px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(198, 241, 53, 0.12);
      color: var(--accent);
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      padding: 4px 10px;
      margin-bottom: 12px;
      font-family: var(--mono);
    }

    .card-body h3 {
      font-family: var(--mono);
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .card-body p {
      font-size: 0.82rem;
      color: var(--muted);
      line-height: 1.6;
    }
  </style>
</head>
<body>

  <!-- ① TICKER BAR -->
  <div class="ticker" aria-label="Announcements">
    <div class="ticker-inner">
      <span>✦ v3.0 now stable</span>
      <span>✦ Copilot mode is here</span>
      <span>✦ Free during open beta</span>
      <span>✦ 40+ language plugins</span>
      <span>✦ v3.0 now stable</span>
      <span>✦ Copilot mode is here</span>
      <span>✦ Free during open beta</span>
      <span>✦ 40+ language plugins</span>
    </div>
  </div>

  <!-- ② NAVBAR -->
  <nav>
    <a href="#" class="nav-logo">CODEX</a>
    <ul class="nav-links">
      <li><a href="#">Docs</a></li>
      <li><a href="#">Features</a></li>
      <li><a href="#">Pricing</a></li>
      <li><a href="#">Changelog</a></li>
      <li><a href="#">GitHub</a></li>
    </ul>
    <button class="btn-primary">Download free</button>
  </nav>

  <!-- ③ HERO -->
  <section class="hero">
    <h1>Write code<br>that feels <em>natural</em></h1>
    <button class="btn-secondary">Explore all features →</button>
  </section>

  <!-- ④ FEATURE GRID (mirrors Wearix product cards) -->
  <section class="grid">

    <!-- Card 1: Syntax highlighting -->
    <div class="card">
      <div class="card-preview">
        <div class="code-lines">
          <div class="cm">// main entry point</div>
          <div><span class="kw">async function</span> <span class="hl">bootstrap</span>() {</div>
          <div>  <span class="kw">const</span> app = <span class="kw">await</span> <span class="hl">create</span>(</div>
          <div>    <span class="str">AppModule</span></div>
          <div>  );</div>
          <div>  <span class="kw">await</span> app.<span class="hl">listen</span>(<span class="str">3000</span>);</div>
          <div>}</div>
          <div class="cm">// ↑ 97ms cold start</div>
        </div>
      </div>
      <div class="card-body">
        <div class="badge">✦ New</div>
        <h3>Smart Highlighting</h3>
        <p>Semantic, context-aware syntax coloring across 40+ languages.</p>
      </div>
    </div>

    <!-- Card 2: AI completions -->
    <div class="card">
      <div class="card-preview">
        <div class="code-lines">
          <div class="cm">// AI suggestion active</div>
          <div><span class="kw">function</span> <span class="hl">sortByDate</span>(items) {</div>
          <div>  <span class="kw">return</span> items.<span class="hl">sort</span>((a, b) =></div>
          <div>    <span class="hl">new</span> <span class="str">Date</span>(b.date) -</div>
          <div>    <span class="hl">new</span> <span class="str">Date</span>(a.date)</div>
          <div>  );</div>
          <div>}</div>
          <div style="color:#c6f135;opacity:0.45">  ↳ suggested in 120ms</div>
        </div>
      </div>
      <div class="card-body">
        <div class="badge">✦ New</div>
        <h3>Copilot Mode</h3>
        <p>AI completions that read your intent, not just your syntax.</p>
      </div>
    </div>

    <!-- Card 3: Multi-pane layout -->
    <div class="card">
      <div class="card-preview">
        <div class="code-lines">
          <div class="cm">// split view active</div>
          <div><span class="kw">import</span> { <span class="hl">useState</span> } <span class="kw">from</span> <span class="str">'react'</span>;</div>
          <div><span class="kw">import</span> { <span class="hl">motion</span> } <span class="kw">from</span> <span class="str">'framer'</span>;</div>
          <div>&nbsp;</div>
          <div><span class="kw">export default function</span> <span class="hl">App</span>() {</div>
          <div>  <span class="kw">const</span> [open, setOpen] =</div>
          <div>    <span class="hl">useState</span>(<span class="kw">false</span>);</div>
          <div>}</div>
        </div>
      </div>
      <div class="card-body">
        <div class="badge">✦ New</div>
        <h3>Multi-Pane Layout</h3>
        <p>Drag to split any view. Keep context without losing focus.</p>
      </div>
    </div>

  </section>

</body>
</html>
```

---

## 5. Key Techniques Explained

### Ticker bar (announcement strip)

The Wearix banner uses a repeating announcement strip. Replicate with a CSS `translateX` animation on a doubled string of text so the loop is seamless:

```css
@keyframes scroll-ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }  /* -50% because text is doubled */
}
```

### Sticky nav with blur

Add `position: sticky; top: 0` with `backdrop-filter: blur(12px)` and a semi-transparent background so the nav floats above content cleanly on scroll.

### Left-aligned hero + right-aligned CTA

Use `display: flex; justify-content: space-between; align-items: flex-end` on the hero section — the headline grows left and the CTA button pins to the bottom-right, exactly mirroring the Wearix layout.

### Card grid with staggered entrance

```css
.card { animation: fade-up 0.5s ease both; }
.card:nth-child(1) { animation-delay: 0.05s; }
.card:nth-child(2) { animation-delay: 0.15s; }
.card:nth-child(3) { animation-delay: 0.25s; }
```

This creates the staggered waterfall reveal effect without any JavaScript.

### Replacing product images with live code previews

Instead of `<img>` tags, each card contains a `<div class="code-lines">` block with styled `<span>` elements mimicking syntax highlighting. This is on-brand for a developer tool and makes the cards interactive and legible.

---

## 6. Adapting Further

- **Add a 4th row**: Repeat `.grid` with 3 more cards for plugins, themes, or integrations
- **Dark/light toggle**: Swap CSS variable values via a class on `<body>` with a small JS toggle
- **Real code snippets**: Pull actual code examples from your product via a `<pre>` + `<code>` block with a library like Shiki or Prism
- **Hover to run**: Add a small "Run" button inside each card preview that opens a sandbox (e.g., links to CodeSandbox or StackBlitz)

---

*Built with plain HTML + CSS — no framework required. Drop the full snippet into any project to get started.*
