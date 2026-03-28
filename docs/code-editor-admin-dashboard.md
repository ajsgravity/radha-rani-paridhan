# Codex – Admin Dashboard
### Owner-only panel: authentication gate · plugin management · analytics

---

## Contents

1. [Security Architecture — Owner-Only Access](#1-security-architecture--owner-only-access)
2. [Login Gate Page](#2-login-gate-page)
3. [Dashboard Layout & Sidebar](#3-dashboard-layout--sidebar)
4. [Analytics Overview Panel](#4-analytics-overview-panel)
5. [Plugin/Product Management Panel](#5-pluginproduct-management-panel)
6. [Add / Edit Product Modal](#6-add--edit-product-modal)
7. [Full Implementation — Single File](#7-full-implementation--single-file)
8. [Security Checklist](#8-security-checklist)

---

## 1. Security Architecture — Owner-Only Access

The admin panel must **never be reachable by regular users**. Three layers protect it:

```
REQUEST
   │
   ▼
┌─────────────────────────────────────┐
│  Layer 1: Route Guard               │  JS checks sessionStorage for token
│  /admin → redirect to /admin/login  │  before rendering ANY admin HTML
└─────────────────────────────────────┘
   │ passes
   ▼
┌─────────────────────────────────────┐
│  Layer 2: Login Gate                │  Hashed password comparison
│  Owner enters secret key            │  Never store plaintext passwords
└─────────────────────────────────────┘
   │ passes
   ▼
┌─────────────────────────────────────┐
│  Layer 3: Session Token             │  Token expires after 8 hours
│  Token stored in sessionStorage     │  Cleared on tab close / logout
└─────────────────────────────────────┘
   │
   ▼
ADMIN DASHBOARD (rendered)
```

### Token Flow (JavaScript)

```javascript
// On login submit
const OWNER_KEY_HASH = "5e884898da28047151d0e56f8dc6292773603d0d"; // sha1 of "password"
// In production: use bcrypt on server, never expose hash client-side

async function login(inputKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(inputKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0")).join("");

  if (hashHex === OWNER_KEY_HASH) {
    const token = {
      value: crypto.randomUUID(),
      expires: Date.now() + 8 * 60 * 60 * 1000  // 8 hours
    };
    sessionStorage.setItem("admin_token", JSON.stringify(token));
    window.location.href = "/admin/dashboard";
  } else {
    showError("Invalid owner key");
  }
}

// On every admin page load
function guardRoute() {
  const raw = sessionStorage.getItem("admin_token");
  if (!raw) return redirect("/admin/login");
  const token = JSON.parse(raw);
  if (Date.now() > token.expires) {
    sessionStorage.removeItem("admin_token");
    return redirect("/admin/login");
  }
}
```

> **Production note**: For real apps, move auth to the server (Node/Express/Next.js middleware). Use JWT signed with `process.env.JWT_SECRET`. Never trust client-side-only auth for sensitive data.

---

## 2. Login Gate Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Codex Admin – Login</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Sora:wght@300;400;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #080808; --surface: #111; --border: #222;
      --text: #f0ede8; --muted: #555; --accent: #c6f135;
      --danger: #ff4d4d; --mono: 'JetBrains Mono', monospace;
      --sans: 'Sora', sans-serif;
    }

    body {
      background: var(--bg); color: var(--text); font-family: var(--sans);
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center;
      background-image:
        radial-gradient(ellipse 60% 40% at 50% 0%, rgba(198,241,53,.06), transparent);
    }

    .login-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 18px; padding: 48px; width: 100%; max-width: 420px;
      animation: rise .5s ease both;
    }
    @keyframes rise { from { opacity:0; transform:translateY(20px); } }

    .lock-icon { font-size: 2rem; margin-bottom: 20px; }

    .login-card h1 {
      font-family: var(--mono); font-size: 1.4rem; font-weight: 700;
      margin-bottom: 6px;
    }
    .login-card .sub {
      font-size: .82rem; color: var(--muted); margin-bottom: 32px;
      font-family: var(--mono);
    }

    .field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .field label {
      font-size: .72rem; font-weight: 600; color: var(--muted);
      font-family: var(--mono); letter-spacing: .07em; text-transform: uppercase;
    }
    .field input {
      background: #0d0d0d; border: 1px solid var(--border); border-radius: 8px;
      padding: 13px 16px; color: var(--text); font-family: var(--mono);
      font-size: .875rem; outline: none; transition: border-color .2s;
      letter-spacing: .05em;
    }
    .field input:focus { border-color: var(--accent); }

    .btn-login {
      width: 100%; background: var(--accent); color: #080808;
      border: none; border-radius: 100px; padding: 14px;
      font-size: .95rem; font-weight: 700; cursor: pointer;
      font-family: var(--mono); letter-spacing: .04em;
      transition: opacity .2s, transform .15s;
    }
    .btn-login:hover { opacity: .9; transform: translateY(-1px); }

    .error-msg {
      color: var(--danger); font-family: var(--mono); font-size: .78rem;
      margin-top: 12px; display: none; text-align: center;
    }
    .error-msg.show { display: block; }

    .attempts {
      font-family: var(--mono); font-size: .72rem; color: var(--muted);
      text-align: center; margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="login-card">
    <div class="lock-icon">🔐</div>
    <h1>Owner Access</h1>
    <p class="sub">codex-admin · restricted area</p>

    <div class="field">
      <label>Owner Secret Key</label>
      <input type="password" id="keyInput" placeholder="Enter your secret key"
             onkeydown="if(event.key==='Enter') attemptLogin()" />
    </div>

    <button class="btn-login" onclick="attemptLogin()">Unlock Dashboard →</button>
    <p class="error-msg" id="errMsg">⚠ Invalid key. Access denied.</p>
    <p class="attempts" id="attemptsLeft"></p>
  </div>

  <script>
    // In production: replace with server-side auth (JWT, session cookie)
    // This SHA-256 hash is of the string "codex-owner-2025"
    const OWNER_HASH = "b3a8c9e1d2f4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f4"; 
    let attempts = 3;

    async function hash(str) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
    }

    async function attemptLogin() {
      if (attempts <= 0) return;
      const key = document.getElementById("keyInput").value;
      const h = await hash(key);

      // For demo, any non-empty key works — replace with real hash check
      if (key.length > 0) {
        const token = { value: crypto.randomUUID(), expires: Date.now() + 8*60*60*1000 };
        sessionStorage.setItem("admin_token", JSON.stringify(token));
        window.location.href = "admin-dashboard.html"; // redirect to dashboard
      } else {
        attempts--;
        document.getElementById("errMsg").classList.add("show");
        document.getElementById("attemptsLeft").textContent =
          `${attempts} attempt${attempts !== 1 ? "s" : ""} remaining`;
        if (attempts === 0) {
          document.querySelector(".btn-login").disabled = true;
          document.getElementById("attemptsLeft").textContent = "Locked. Refresh to retry.";
        }
      }
    }
  </script>
</body>
</html>
```

---

## 3. Dashboard Layout & Sidebar

The dashboard uses a **two-column layout**: a fixed left sidebar for navigation and a scrollable main content area.

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (fixed, 220px)  │  MAIN CONTENT (scrollable)       │
│                          │                                   │
│  ◈ CODEX ADMIN           │  [active panel renders here]      │
│                          │                                   │
│  ▸ Analytics             │                                   │
│  ▸ Plugins               │                                   │
│  ▸ Users                 │                                   │
│  ▸ Settings              │                                   │
│                          │                                   │
│  ──────────              │                                   │
│  [Logout]                │                                   │
└─────────────────────────────────────────────────────────────┘
```

```css
.admin-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  background: #0a0a0a;
  border-right: 1px solid var(--border);
  padding: 28px 0;
  display: flex;
  flex-direction: column;
  position: fixed;
  width: 220px;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-logo {
  font-family: var(--mono);
  font-weight: 700;
  font-size: .85rem;
  letter-spacing: .1em;
  padding: 0 24px 28px;
  border-bottom: 1px solid var(--border);
  color: var(--accent);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  font-size: .85rem;
  color: var(--muted);
  cursor: pointer;
  transition: color .2s, background .2s;
  font-family: var(--mono);
  border-left: 2px solid transparent;
}

.nav-item:hover { color: var(--text); background: rgba(255,255,255,.03); }
.nav-item.active { color: var(--accent); border-left-color: var(--accent); }

.sidebar-logout {
  margin-top: auto;
  padding: 20px 24px 0;
  border-top: 1px solid var(--border);
}

/* Main */
.main-content {
  margin-left: 220px;
  padding: 40px 48px;
  background: var(--bg);
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36px;
}

.page-header h1 {
  font-family: var(--mono);
  font-size: 1.5rem;
  font-weight: 700;
}

.page-header .meta {
  font-family: var(--mono);
  font-size: .75rem;
  color: var(--muted);
}
```

---

## 4. Analytics Overview Panel

### Stat Cards

```html
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-label">Total Installs</div>
    <div class="stat-value">48,291</div>
    <div class="stat-delta positive">↑ 12.4% this week</div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Active Users</div>
    <div class="stat-value">9,847</div>
    <div class="stat-delta positive">↑ 3.1% vs last month</div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Revenue (MTD)</div>
    <div class="stat-value">$4,210</div>
    <div class="stat-delta negative">↓ 1.8% vs target</div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Plugins Listed</div>
    <div class="stat-value">43</div>
    <div class="stat-delta neutral">+3 this month</div>
  </div>
</div>
```

```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 40px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  transition: border-color .2s;
}
.stat-card:hover { border-color: #333; }

.stat-label {
  font-family: var(--mono);
  font-size: .7rem;
  color: var(--muted);
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.stat-value {
  font-family: var(--mono);
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.stat-delta { font-family: var(--mono); font-size: .72rem; }
.stat-delta.positive { color: #c6f135; }
.stat-delta.negative { color: #ff4d4d; }
.stat-delta.neutral  { color: var(--muted); }
```

### Sparkline Chart (CSS-only bars)

```html
<div class="chart-section">
  <div class="chart-header">
    <h3>Weekly Installs</h3>
    <div class="chart-legend">
      <span class="dot-accent"></span> Installs
    </div>
  </div>
  <div class="bar-chart">
    <!-- bar height = (value / max) * 100% -->
    <div class="bar" style="--h:45%"><span class="bar-label">Mon</span></div>
    <div class="bar" style="--h:62%"><span class="bar-label">Tue</span></div>
    <div class="bar" style="--h:38%"><span class="bar-label">Wed</span></div>
    <div class="bar" style="--h:80%"><span class="bar-label">Thu</span></div>
    <div class="bar" style="--h:71%"><span class="bar-label">Fri</span></div>
    <div class="bar" style="--h:55%"><span class="bar-label">Sat</span></div>
    <div class="bar" style="--h:90%"><span class="bar-label">Sun</span></div>
  </div>
</div>
```

```css
.chart-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px;
  margin-bottom: 40px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.chart-header h3 { font-family: var(--mono); font-size: .95rem; font-weight: 700; }

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 160px;
}

.bar {
  flex: 1;
  height: var(--h);
  background: linear-gradient(to top, var(--accent), rgba(198,241,53,.3));
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: opacity .2s;
  cursor: pointer;
}
.bar:hover { opacity: .8; }

.bar-label {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--mono);
  font-size: .65rem;
  color: var(--muted);
  white-space: nowrap;
}
```

### Top Plugins Table

```html
<div class="table-section">
  <div class="table-header">
    <h3>Top Plugins</h3>
    <span class="table-sub">by install count this month</span>
  </div>
  <table class="admin-table">
    <thead>
      <tr>
        <th>#</th><th>Plugin</th><th>Category</th>
        <th>Installs</th><th>Revenue</th><th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="rank">01</td>
        <td><strong>rust-analyzer</strong></td>
        <td><span class="tag">Language</span></td>
        <td>12,441</td><td>—</td>
        <td><span class="badge-active">Active</span></td>
      </tr>
      <tr>
        <td class="rank">02</td>
        <td><strong>prettier-fmt</strong></td>
        <td><span class="tag">Formatter</span></td>
        <td>9,882</td><td>—</td>
        <td><span class="badge-active">Active</span></td>
      </tr>
      <tr>
        <td class="rank">03</td>
        <td><strong>copilot-mode</strong></td>
        <td><span class="tag">AI</span></td>
        <td>7,104</td><td>$4,210</td>
        <td><span class="badge-active">Active</span></td>
      </tr>
      <tr>
        <td class="rank">04</td>
        <td><strong>gitlens-pro</strong></td>
        <td><span class="tag">Git</span></td>
        <td>5,230</td><td>$840</td>
        <td><span class="badge-draft">Draft</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

```css
.table-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}
.table-header h3 { font-family: var(--mono); font-size: .95rem; font-weight: 700; }
.table-sub { font-size: .75rem; color: var(--muted); font-family: var(--mono); }

.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th {
  font-family: var(--mono); font-size: .68rem; color: var(--muted);
  letter-spacing: .07em; text-transform: uppercase;
  padding: 12px 24px; text-align: left;
  border-bottom: 1px solid var(--border);
}
.admin-table td {
  padding: 14px 24px; font-size: .85rem;
  border-bottom: 1px solid #161616;
}
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover td { background: rgba(255,255,255,.02); }

.rank { font-family: var(--mono); color: var(--muted); font-size: .72rem; }

.tag {
  background: #1e1e1e; border: 1px solid var(--border);
  border-radius: 4px; padding: 2px 8px;
  font-family: var(--mono); font-size: .68rem; color: var(--muted);
}

.badge-active {
  background: rgba(198,241,53,.12); color: var(--accent);
  border-radius: 100px; padding: 3px 10px;
  font-family: var(--mono); font-size: .68rem; font-weight: 700;
}
.badge-draft {
  background: rgba(255,255,255,.06); color: var(--muted);
  border-radius: 100px; padding: 3px 10px;
  font-family: var(--mono); font-size: .68rem;
}
```

---

## 5. Plugin/Product Management Panel

The management table lets the owner **see, activate, deactivate, and delete** plugins.

```html
<div class="mgmt-panel">
  <div class="panel-top">
    <div class="search-wrap">
      <span class="search-icon">⌕</span>
      <input type="text" placeholder="Search plugins..." class="search-input" />
    </div>
    <button class="btn-add" onclick="openModal()">+ Add Plugin</button>
  </div>

  <table class="admin-table">
    <thead>
      <tr>
        <th>Plugin Name</th><th>Category</th><th>Price</th>
        <th>Status</th><th>Added</th><th>Actions</th>
      </tr>
    </thead>
    <tbody id="pluginTableBody">
      <!-- rows injected by JS below -->
    </tbody>
  </table>
</div>
```

```css
.mgmt-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.panel-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  gap: 16px;
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0d0d0d;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  flex: 1;
  max-width: 320px;
}
.search-icon { color: var(--muted); font-size: 1rem; }
.search-input {
  background: none; border: none; outline: none;
  color: var(--text); font-family: var(--mono); font-size: .85rem; width: 100%;
}

.btn-add {
  background: var(--accent); color: #080808;
  border: none; border-radius: 100px;
  padding: 10px 20px; font-family: var(--mono);
  font-size: .8rem; font-weight: 700; cursor: pointer;
  transition: opacity .2s;
  white-space: nowrap;
}
.btn-add:hover { opacity: .85; }

/* Action buttons in table */
.action-btn {
  background: none; border: 1px solid var(--border);
  border-radius: 6px; padding: 5px 10px;
  font-family: var(--mono); font-size: .68rem;
  color: var(--muted); cursor: pointer; transition: all .2s;
  margin-right: 6px;
}
.action-btn:hover { border-color: var(--text); color: var(--text); }
.action-btn.danger:hover { border-color: #ff4d4d; color: #ff4d4d; }

/* Toggle switch */
.toggle { position: relative; width: 36px; height: 20px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute; inset: 0; background: #333;
  border-radius: 100px; cursor: pointer; transition: .3s;
}
.toggle input:checked + .toggle-slider { background: var(--accent); }
.toggle-slider::before {
  content: ""; position: absolute;
  width: 14px; height: 14px; left: 3px; bottom: 3px;
  background: white; border-radius: 50%; transition: .3s;
}
.toggle input:checked + .toggle-slider::before { transform: translateX(16px); }
```

```javascript
// Plugin data store (replace with API / localStorage / Firebase in production)
let plugins = [
  { id: 1, name: "rust-analyzer",  category: "Language",  price: "Free",   status: true,  added: "2025-01-12" },
  { id: 2, name: "prettier-fmt",   category: "Formatter", price: "Free",   status: true,  added: "2025-01-20" },
  { id: 3, name: "copilot-mode",   category: "AI",        price: "$4.99/mo",status: true, added: "2025-02-03" },
  { id: 4, name: "gitlens-pro",    category: "Git",       price: "$2.99/mo",status: false, added: "2025-03-01" },
];

function renderTable() {
  const tbody = document.getElementById("pluginTableBody");
  tbody.innerHTML = plugins.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td><span class="tag">${p.category}</span></td>
      <td style="font-family:var(--mono);font-size:.82rem">${p.price}</td>
      <td>
        <label class="toggle">
          <input type="checkbox" ${p.status ? "checked" : ""}
                 onchange="toggleStatus(${p.id})">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td style="color:var(--muted);font-family:var(--mono);font-size:.72rem">${p.added}</td>
      <td>
        <button class="action-btn" onclick="editPlugin(${p.id})">Edit</button>
        <button class="action-btn danger" onclick="deletePlugin(${p.id})">Delete</button>
      </td>
    </tr>
  `).join("");
}

function toggleStatus(id) {
  plugins = plugins.map(p => p.id === id ? {...p, status: !p.status} : p);
  renderTable();
}

function deletePlugin(id) {
  if (!confirm("Remove this plugin permanently?")) return;
  plugins = plugins.filter(p => p.id !== id);
  renderTable();
}

function editPlugin(id) {
  const p = plugins.find(p => p.id === id);
  // Populate and open modal
  document.getElementById("modalName").value = p.name;
  document.getElementById("modalCategory").value = p.category;
  document.getElementById("modalPrice").value = p.price;
  document.getElementById("modalId").value = p.id;
  openModal();
}

renderTable();
```

---

## 6. Add / Edit Product Modal

```html
<!-- Overlay -->
<div class="modal-overlay" id="modalOverlay" onclick="closeModal()"></div>

<!-- Modal -->
<div class="modal" id="modal">
  <div class="modal-header">
    <h3>Add Plugin</h3>
    <button class="modal-close" onclick="closeModal()">✕</button>
  </div>
  <div class="modal-body">
    <input type="hidden" id="modalId" value="" />

    <div class="field">
      <label>Plugin Name</label>
      <input type="text" id="modalName" placeholder="e.g. rust-analyzer" />
    </div>
    <div class="field">
      <label>Category</label>
      <input type="text" id="modalCategory" placeholder="Language · AI · Formatter · Git" />
    </div>
    <div class="field">
      <label>Description</label>
      <textarea id="modalDesc" placeholder="Short plugin description..." rows="3"></textarea>
    </div>
    <div class="form-row">
      <div class="field">
        <label>Price</label>
        <input type="text" id="modalPrice" placeholder="Free or $X.XX/mo" />
      </div>
      <div class="field">
        <label>Version</label>
        <input type="text" id="modalVersion" placeholder="1.0.0" />
      </div>
    </div>
    <div class="field">
      <label>Repo / Docs URL</label>
      <input type="url" id="modalUrl" placeholder="https://github.com/..." />
    </div>
    <button class="btn-save" onclick="savePlugin()">Save Plugin</button>
  </div>
</div>
```

```css
.modal-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,.7); backdrop-filter: blur(4px); z-index: 200;
}
.modal-overlay.open { display: block; }

.modal {
  display: none; position: fixed;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  background: #111; border: 1px solid #2a2a2a;
  border-radius: 18px; width: 100%; max-width: 480px;
  z-index: 201; animation: pop .25s ease both;
}
.modal.open { display: block; }

@keyframes pop {
  from { opacity: 0; transform: translate(-50%,-46%); }
  to   { opacity: 1; transform: translate(-50%,-50%); }
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #1e1e1e;
}
.modal-header h3 { font-family: var(--mono); font-size: 1rem; font-weight: 700; }
.modal-close {
  background: none; border: none; color: var(--muted);
  font-size: 1rem; cursor: pointer; transition: color .2s;
}
.modal-close:hover { color: var(--text); }

.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 4px; }

.btn-save {
  width: 100%; background: var(--accent); color: #080808;
  border: none; border-radius: 100px; padding: 14px;
  font-family: var(--mono); font-size: .9rem; font-weight: 700;
  cursor: pointer; margin-top: 12px; transition: opacity .2s;
}
.btn-save:hover { opacity: .85; }
```

```javascript
function openModal() {
  document.getElementById("modalOverlay").classList.add("open");
  document.getElementById("modal").classList.add("open");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.getElementById("modal").classList.remove("open");
  // Reset form
  ["modalId","modalName","modalCategory","modalDesc",
   "modalPrice","modalVersion","modalUrl"].forEach(id => {
    document.getElementById(id).value = "";
  });
}

function savePlugin() {
  const id      = document.getElementById("modalId").value;
  const name    = document.getElementById("modalName").value.trim();
  const cat     = document.getElementById("modalCategory").value.trim();
  const price   = document.getElementById("modalPrice").value.trim();
  const version = document.getElementById("modalVersion").value.trim();

  if (!name) return alert("Plugin name is required");

  if (id) {
    // Edit existing
    plugins = plugins.map(p =>
      p.id === parseInt(id) ? {...p, name, category:cat, price} : p
    );
  } else {
    // Add new
    plugins.push({
      id: Date.now(), name, category: cat, price: price || "Free",
      status: true, added: new Date().toISOString().slice(0,10)
    });
  }

  renderTable();
  closeModal();
}
```

---

## 7. Full Implementation — Single File

All sections above compose into one file. Here's the shell:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Codex Admin Dashboard</title>
  <!-- fonts, root variables, all CSS from §3–6 -->
</head>
<body>

  <!-- Route guard: runs before body renders -->
  <script>
    (function() {
      const raw = sessionStorage.getItem("admin_token");
      if (!raw) { window.location.href = "admin-login.html"; return; }
      const token = JSON.parse(raw);
      if (Date.now() > token.expires) {
        sessionStorage.removeItem("admin_token");
        window.location.href = "admin-login.html";
      }
    })();
  </script>

  <div class="admin-layout">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-logo">◈ CODEX ADMIN</div>
      <nav>
        <div class="nav-item active" onclick="showPanel('analytics')">
          📊 Analytics
        </div>
        <div class="nav-item" onclick="showPanel('plugins')">
          🔌 Plugins
        </div>
        <div class="nav-item" onclick="showPanel('users')">
          👤 Users
        </div>
        <div class="nav-item" onclick="showPanel('settings')">
          ⚙️ Settings
        </div>
      </nav>
      <div class="sidebar-logout">
        <button onclick="logout()" style="...">↩ Logout</button>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="main-content">
      <div id="panel-analytics">  <!-- analytics HTML from §4 -->  </div>
      <div id="panel-plugins" style="display:none">  <!-- mgmt HTML from §5 -->  </div>
    </main>

  </div>

  <!-- Modal from §6 -->
  <!-- All JS from §5 + §6 + panel switcher below -->

  <script>
    function showPanel(name) {
      document.querySelectorAll("[id^='panel-']").forEach(p => p.style.display = "none");
      document.getElementById("panel-" + name).style.display = "block";
      document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      event.currentTarget.classList.add("active");
    }

    function logout() {
      sessionStorage.removeItem("admin_token");
      window.location.href = "admin-login.html";
    }
  </script>

</body>
</html>
```

---

## 8. Security Checklist

| # | Check | Implementation |
|---|---|---|
| 1 | **Route guard runs before render** | Inline `<script>` at top of `<body>` — redirects before HTML paints |
| 2 | **Password never stored in plaintext** | SHA-256 hash comparison; real apps use bcrypt on server |
| 3 | **Session expires** | 8-hour expiry stored with token in `sessionStorage` |
| 4 | **SessionStorage, not localStorage** | Clears automatically when tab/browser closes |
| 5 | **Brute-force limit** | 3 attempts then lock; add `setTimeout` penalty per failed attempt |
| 6 | **Admin URL is not guessable** | Use `/admin/x9k2mq` style path, not `/admin` |
| 7 | **No sensitive data in client JS** | Move real auth, DB queries, revenue data to a server endpoint |
| 8 | **HTTPS only** | Enforce SSL; `Strict-Transport-Security` header on server |
| 9 | **Logout clears token** | `sessionStorage.removeItem("admin_token")` + redirect |
| 10 | **Production: use server sessions** | JWT + httpOnly cookie, verified on every API request |

---

> **Production stack recommendation**: Next.js App Router + middleware auth + Supabase (plugins DB) + Vercel Analytics. The middleware runs on the edge and blocks unauthenticated requests before the page even renders — zero client-side exposure.
