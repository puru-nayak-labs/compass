# IBM Compass — TLS Performance Intelligence Agent

> **Agentic AI for Performance Intelligence** — transforms weekly and monthly KPI reporting from a manual data-analysis process into an AI-powered intelligence and recommendation engine, enabling TLS Product Management leaders to understand *what happened*, *why it happened*, and *what actions to take next* — in under 4 minutes instead of 2–4 hours.

🔗 **Repo:** https://github.ibm.com/puru-ibm/ibm-compass

---

## Table of Contents

1. [Objective & Goal](#1-objective--goal)
2. [Workflow — How It Works](#2-workflow--how-it-works)
3. [Architecture](#3-architecture)
4. [Key API Endpoints](#4-key-api-endpoints)
5. [Get Started — Run Locally](#5-get-started--run-locally)
6. [Personas & Features](#6-personas--features)
7. [Host Publicly for IBMers](#7-host-publicly-for-ibmers)
8. [Refreshing Data](#8-refreshing-data)
9. [Extending the Platform](#9-extending-the-platform)
10. [Roadmap](#10-roadmap)
11. [IBM Tool Stack](#11-ibm-tool-stack)
12. [Team & Contact](#12-team--contact)

---

## 1. Objective & Goal

### The Problem

Today's TLS KPI workflow is entirely manual:
- Excel files exported from EPM, Salesforce/ISC, and Pipeline tools
- A Business Analyst builds pivot tables by hand — **1–2 days per cycle**
- Insights vary by analyst; no standard narrative or institutional memory
- Same work repeated every week / quarter with no carry-forward

### The Goal

**IBM Compass** is the AI agent that eliminates that toil:

| Capability | What It Delivers |
|---|---|
| **Auto-ingest** | Drop an updated `.xlsx` → all KPIs refresh automatically |
| **KPI Intelligence** | Revenue · Signings · Pipeline · Win/Loss — WW and by Geo, Market, Offering, Quarter |
| **Conversational Analytics** | Ask anything in plain English |
| **Agentic Insights** | Root-cause analysis, trend detection, anomaly surfacing — in executive language |
| **PM Report (9 tabs)** | Full Business Health → Actions → Pipeline → Revenue → Win Rate → Geo → Others |
| **Portfolio Leader View** | OA-level and Geo-level intel with right-panel highlights |
| **Feedback Loop** | Thumbs up/down captures resonance — trains the system over time |

**North Star Metric:** Reduce Time-To-Action from KPI data by **80%** ( < 4 min vs 2–4 hrs today).

---

## 2. Workflow — How It Works

### High-Level View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   📊 SPREADSHEET DATA          🧠 INTEL LAYER           💡 INSIGHTS & INTEL │
│                                                                             │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐   │
│  │  TLS Performance │     │  IBM Compass     │     │  PM Report       │   │
│  │  Data.xlsx       │────▶│  KPI Engine +    │────▶│  Exec Summary    │   │
│  │                  │     │  Insight Agent   │     │  Chat Agent      │   │
│  │  • Pipeline data │     │                  │     │  Right Panel     │   │
│  │  • Revenue data  │     │  (server.js)     │     │  Highlights      │   │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Detailed End-to-End Flow

```
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  INPUT LAYER — Source Data                                               │
  │                                                                          │
  │   TLS Performance Data.xlsx                                              │
  │   ├── Sheet: Pipeline 2026.07.11   (opportunity-level rows)              │
  │   └── Sheet: Revenue 2026.06.18   (monthly actuals through Jun 18 2026) │
  └─────────────────────────┬────────────────────────────────────────────────┘
                             │  Bob read_xlsx (dump:true)
                             ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  PROCESSING LAYER — JSON Pre-processing                                  │
  │                                                                          │
  │   .bob/tmp/xlsx-dumps/TLS Performance Data-<hash>/                       │
  │   ├── Pipeline_2026_07_11.json    (normalised rows + headers)            │
  │   └── Revenue_2026_06_18.json    (normalised rows + headers)             │
  │                                                                          │
  │   Loaded into memory at server startup → records[] + revRecords[]        │
  └─────────────────────────┬────────────────────────────────────────────────┘
                             │  Node.js / Express (server.js)
                             ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  KPI ENGINE LAYER — server.js                                            │
  │                                                                          │
  │   filter(opts)         — pipeline slices (geo/market/qtr/offering/…)    │
  │   filterRev(opts)      — revenue slices (same dimensions)                │
  │                                                                          │
  │   REST API endpoints (~30):                                              │
  │   ├── /api/kpi/*          KPI summary, by-geo, by-quarter, tabular       │
  │   ├── /api/revenue/*      Revenue actuals, by-geo, trend                 │
  │   ├── /api/pm-report      Full 9-section PM analysis                     │
  │   ├── /api/pm-report/industry  Channel / Segment / Industry intel        │
  │   ├── /api/pm-meta        Filter tree (OA / Offering / Lvl30)            │
  │   ├── /api/insights       Trend · Risk · Anomaly bullets                 │
  │   ├── /api/exec-summary   AI executive narrative                         │
  │   ├── /api/chat           Session-aware conversational agent             │
  │   └── /api/feedback       Thumbs up/down feedback log                    │
  └─────────────────────────┬────────────────────────────────────────────────┘
                             │  JSON over HTTP
                             ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  INTELLIGENCE LAYER — Insight Generation                                 │
  │                                                                          │
  │   /api/insights  ──▶  YoY / QoQ trend detection                         │
  │                        anomaly detection (win rate drops, pipe gaps)     │
  │                        risk bullets (stalled deals, low-WR geos)         │
  │                        recommended actions (ranked by $ impact)          │
  │                                                                          │
  │   /api/pm-report ──▶  Business Health narrative (4 intel bullets)        │
  │                        GTM action recommendations                        │
  │                        Geography intel (per-geo 2 bullets + top acct)    │
  │                        Channel / Segment / Industry analysis             │
  │                        Executive narrative (rule-based; Granite-ready)   │
  └─────────────────────────┬────────────────────────────────────────────────┘
                             │  rendered by
                             ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  PRESENTATION LAYER — public/index.html (Vanilla JS SPA)                 │
  │                                                                          │
  │  Three personas (switchable in top nav):                                 │
  │                                                                          │
  │  ① Analyst View          KPI tiles · Chart.js charts · Tabular drill-down│
  │  ② Product Manager View  9-tab PM report · Revenue chart · Geo intel     │
  │  ③ Portfolio Leader View OA intel · Geo intel · WIP roadmap              │
  │                                                                          │
  │  Right Intelligence Panel (all personas):                                │
  │  ├── 🟢 Top Highlights                                                   │
  │  ├── 🔴 Top Focus Areas                                                  │
  │  └── 🟣 Top Recommended Actions                                          │
  │                                                                          │
  │  Chat Panel — plain-English queries → structured KPI answers             │
  └──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Architecture

### Project Structure

```
ibm-compass/
├── server.js                    # Express API + KPI engine + insight agent
│   ├── Data loading             # Reads JSON dumps at startup
│   ├── filter()                 # Universal pipeline filter
│   ├── filterRev()              # Revenue actuals filter
│   ├── /api/kpi/*               # ~20 pipeline KPI endpoints
│   ├── /api/revenue/*           # Revenue actuals endpoints
│   ├── /api/pm-report           # Full PM / FLM analysis report
│   ├── /api/pm-report/industry  # Channel / Segment / Industry
│   ├── /api/pm-meta             # Filter tree (OA / Offering / Lvl30)
│   ├── /api/exec-summary        # AI executive narrative builder
│   ├── /api/insights            # Trend / risk / anomaly bullets
│   ├── /api/chat                # Session-aware conversational agent
│   └── /api/feedback            # Feedback log (thumbs up/down)
│
├── public/
│   ├── index.html               # Full SPA — IBM Carbon styling + Chart.js
│   └── hierarchy.json           # Geo → Market → Country filter tree
│
├── build_hierarchy.mjs          # One-time: rebuilds hierarchy.json from data
├── Dockerfile                   # Container build (Node 20 Alpine)
├── deploy.ps1                   # One-command deploy to IBM Code Engine
│
└── .bob/tmp/xlsx-dumps/         # Pre-processed XLSX data (JSON)
    └── TLS Performance Data-*/
        ├── Pipeline_2026_07_11.json
        └── Revenue_2026_06_18.json
```

---

## 4. Key API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/kpi/summary` | Top-level KPI tiles (pipeline, signings, win rate) |
| `GET /api/kpi/by-geo` | KPI breakdown by Geography |
| `GET /api/kpi/by-quarter` | Quarterly trend |
| `GET /api/kpi/by-offering` | Pipeline / signings by Offering Area |
| `GET /api/kpi/tabular` | Full drill-down table |
| `GET /api/kpi/flm-analysis` | FLM forecast judgment |
| `GET /api/kpi/top-accounts` | Top accounts by pipeline value |
| `GET /api/revenue/summary` | Revenue actuals KPI tiles |
| `GET /api/revenue/by-geo` | Revenue by Geo + quarter |
| `GET /api/exec-summary` | AI executive narrative |
| `GET /api/insights` | Trend / risk / anomaly bullets for right panel |
| `GET /api/pm-report` | Full 9-section PM analysis |
| `GET /api/pm-report/industry` | Channel / Segment / Industry intel |
| `GET /api/pm-meta` | Filter tree: OA / Offerings / Lvl30 |
| `POST /api/chat` | Conversational agent (session-aware) |
| `POST /api/feedback` | Capture thumbs up/down |

**All endpoints accept:** `geo`, `market`, `country`, `quarter`, `year`, `offeringArea`, `consolidatedOffering`, `ut30`, `channel`, `clientType`

---

## 5. Get Started — Run Locally

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 18 + | Run the server |
| npm | 9 + | Install dependencies |
| Git | any | Clone the repo |
| Docker (optional) | any | Container build / run |
| IBM Cloud CLI (optional) | latest | Deploy to Code Engine |

---

### Step 1 — Clone & Install

```bash
git clone https://github.ibm.com/puru-ibm/ibm-compass.git
cd ibm-compass
npm install
```

---

### Step 2 — Add Data Files

The server reads two pre-processed JSON dumps. Because the data files are large, they are **not in git** — get them from the project owner.

Place them at exactly this path (create folders as needed):

```
<project-root>/.bob/tmp/xlsx-dumps/TLS Performance Data-e90c662f31f06851/
    ├── Pipeline_2026_07_11.json
    └── Revenue_2026_06_18.json
```

> **Windows example path:**
> `C:\Users\<your-username>\ibm-compass\.bob\tmp\xlsx-dumps\TLS Performance Data-e90c662f31f06851\`

If you receive a fresh `TLS Performance Data.xlsx`, see [Refreshing Data](#8-refreshing-data).

---

### Step 3 — Run the Server

```bash
node server.js
```

Open **http://localhost:3000** in your browser. The dashboard loads immediately.

Hard-refresh if you make code changes: **Ctrl + Shift + R**

---

### Step 4 — Using the Three Personas

Switch personas using the top navigation bar:

| Persona | What You Get |
|---|---|
| **Analyst View** | KPI tiles · Geo breakdown charts · Quarterly trend · Revenue view · Tabular drill-down |
| **Product Manager View** | 9-tab PM report: Business Health → Exec Summary → Top Actions → Pipeline → Signings → Revenue → Win Rate → Geography → Others |
| **Portfolio Leader View** | OA-level intel · Geo intel · Right panel highlights |

The **Right Intelligence Panel** (always visible) updates automatically when you click **Generate Intelligence** on any persona:
- 🟢 **Top Highlights** — what's going well
- 🔴 **Top Focus Areas** — what needs attention
- 🟣 **Top Recommended Actions** — ranked GTM motions

---

### Step 5 — Chat Agent

The chat agent is **session-aware** — it carries context between turns.

```
"How is pipeline performing this quarter?"
"Show me EMEA signings vs last year"
"Which geo has the highest win rate in 2Q26?"
"What are the top risks in Americas pipeline?"
"Compare Q1 and Q2 2026 for APAC"
"What should PSI PM focus on this month?"
```

The agent understands:
- **Geo intent:** Americas / EMEA / APAC / Japan / WW
- **Quarter intent:** "Q2 2026", "2Q26", "last quarter", "this quarter"
- **KPI intent:** pipeline, signings, revenue, win rate, win/loss
- **Offering intent:** PSI, Managed Services, etc.

---

## 6. Personas & Features

### Analyst View
- 2-row compressed filter bar (OA · Offering · Lvl30 · Year · Qtr · Month | Geo · Market · Country · Client · Channel)
- KPI tiles with YoY/QoQ deltas
- Chart.js trend charts (pipeline, signings, revenue)
- Full tabular drill-down with mini bar charts
- Revenue actuals view (separate filter context)

### Product Manager View (9-tab Report)
| Tab | Content |
|---|---|
| **01 Business Health** | 4 intel bullets · KPI tiles · Geo mini-cards · Top accounts table |
| **02 Exec Summary** | AI-generated narrative |
| **03 Top Actions** | High-priority GTM actions · Account watchlist |
| **04 Pipeline** | Trend chart · by-Geo table · Offering breakdown |
| **05 Signings** | Trend chart · Won-deal analysis |
| **06 Revenue** | Line chart (Revenue vs Signings) · 4 KPI tiles · 3Q26 data-cutoff note |
| **07 Win Rate** | Win/loss reasons table · per-Geo win rate |
| **08 Geography** | Per-geo cards with spark bars · 2 intel bullets + top account per geo |
| **09 Others** | Industry · Channel · Client Segment tables with intel narratives |

### Portfolio Leader View
- Infra Services / WW / All Quarters defaults
- Intel by Offering Area (pipeline, signings, YoY, per-OA action)
- Intel by Geography (KPI row + 2 intel bullets + top account)
- Phase 2 roadmap with numbered action items

---

## 7. Host Publicly for IBMers

> All three options below result in a URL accessible to any IBMer on the IBM network / IBM SSO. Choose the option that fits your access level.

---

### Option A — IBM Code Engine (Recommended — Serverless, No Infra)

**What it is:** IBM's serverless container platform. You deploy a Docker image; IBM manages scaling, TLS, and the public URL. Free tier available in IBM Cloud.

**Prerequisites:**
- IBM Cloud account (your w3 ID works at cloud.ibm.com)
- IBM Cloud CLI installed: https://cloud.ibm.com/docs/cli
- Docker Desktop installed

**Steps:**

```powershell
# 1. Login to IBM Cloud (use your w3 SSO)
ibmcloud login --sso

# 2. Install Code Engine plugin (one-time)
ibmcloud plugin install code-engine

# 3. Run the one-command deploy script
.\deploy.ps1
```

The script will:
1. Build the Docker image from `Dockerfile`
2. Push to IBM Container Registry (`us.icr.io/ibm-compass/compass-app:latest`)
3. Create / update the `compass-app` application in the `ibm-compass` Code Engine project
4. Print the live URL (e.g. `https://compass-app.<region>.codeengine.appdomain.cloud`)

**Share that URL** with your colleagues — it's publicly accessible to all IBMers.

> **Note:** The `Dockerfile` copies the `.bob/tmp/xlsx-dumps/` data folder into the image. Make sure your data dumps are present before running `deploy.ps1`.

---

### Option B — IBM Cloud Foundry (Simpler if CF is already set up)

```bash
# Install CF plugin
ibmcloud plugin install cloud-foundry

# Target your org/space
ibmcloud target --cf

# Push the app (reads manifest.yml if present, or uses defaults)
ibmcloud cf push ibm-compass --buildpack nodejs_buildpack --memory 512M --port 3000
```

Cloud Foundry auto-detects the Node.js app via `package.json`, installs dependencies, and starts `node server.js`.

You'll get a URL like: `https://ibm-compass.<cf-domain>.mybluemix.net`

---

### Option C — IBM Virtual Server / Any Linux VM (Most Control)

If you have access to an IBM internal VM or a colleague's server:

```bash
# Clone and install on the server
git clone https://github.ibm.com/puru-ibm/ibm-compass.git
cd ibm-compass
npm install

# Copy your data dumps to the server (scp or rsync)
scp -r .bob/tmp/xlsx-dumps/ user@your-server:/path/to/ibm-compass/.bob/tmp/

# Run with PM2 (keeps it alive, restarts on crash)
npm install -g pm2
pm2 start server.js --name compass
pm2 save

# The app runs on port 3000 — expose via nginx reverse proxy or open firewall port
```

---

### Colleague Onboarding (All Options)

Once the app is live, share this checklist with colleagues who want to **also develop** on it:

```
1. Get access to the GitHub repo:
   https://github.ibm.com/puru-ibm/ibm-compass
   (Ask Puru to add you as a collaborator)

2. Clone:
   git clone https://github.ibm.com/puru-ibm/ibm-compass.git
   cd ibm-compass
   npm install

3. Get the data files from Puru (Teams / email):
   Place at: .bob/tmp/xlsx-dumps/TLS Performance Data-e90c662f31f06851/
   Files: Pipeline_2026_07_11.json + Revenue_2026_06_18.json

4. Run locally:
   node server.js
   Open: http://localhost:3000

5. Make changes on a feature branch:
   git checkout -b feature/your-feature-name
   # ... make changes ...
   git add .
   git commit -m "feat: describe your change"
   git push origin feature/your-feature-name
   # Open a Pull Request on GitHub
```

---

## 8. Refreshing Data

When a new `TLS Performance Data.xlsx` is available:

1. Drop the file into the project root.

2. In IBM Bob, run `read_xlsx` with `dump:true` to produce fresh JSON dumps.
   This creates a new folder: `.bob/tmp/xlsx-dumps/TLS Performance Data-<new-hash>/`

3. Update the two path constants at the top of `server.js`:
   ```js
   const PIPE_DUMP = path.join(__dirname, ".bob/tmp/xlsx-dumps/TLS Performance Data-<new-hash>/Pipeline_<date>.json");
   const REV_DUMP  = path.join(__dirname, ".bob/tmp/xlsx-dumps/TLS Performance Data-<new-hash>/Revenue_<date>.json");
   ```

4. Rebuild the geo hierarchy (only if geo/market structure changed):
   ```bash
   node build_hierarchy.mjs
   ```

5. Restart the server:
   ```bash
   node server.js
   ```

6. Re-deploy if running on Code Engine:
   ```powershell
   .\deploy.ps1
   ```

---

## 9. Extending the Platform

### Add a New KPI Endpoint

```js
// server.js
app.get("/api/kpi/my-new-metric", (req, res) => {
  const { geo = "WW", quarter = "ALL" } = req.query;
  const recs = filter({ geo, quarter });
  // aggregate, format, return
  res.json({ data: ... });
});
```

### Wire It to the Frontend

In `public/index.html`:
```js
const data = await fetch(`/api/kpi/my-new-metric?${qs({ geo, quarter })}`).then(r => r.json());
// render with Chart.js or a table
```

### Expose It in Chat

Add intent-matching in the `/api/chat` handler (`server.js`, ~line 1246):
```js
if (/my new metric/i.test(msg)) {
  // call your new aggregation, return structured answer
}
```

### Switch to Real Granite LLM

The current `exec-summary` and `insights` endpoints use rule-based generation.
To swap in Granite, replace the narrative-building logic in those endpoints with a `watsonx.ai` API call:
```js
const { WatsonXAI } = require("@ibm-cloud/watsonx-ai");
const model = new WatsonXAI({ ... });
const result = await model.generateText({ input: prompt, modelId: "ibm/granite-13b-instruct-v2" });
```

---

## 10. Roadmap

| Phase | Timeline | Status | What's Next |
|---|---|---|---|
| **Phase 0** — Product definition | Done | ✅ | KPI priority locked, personas defined |
| **Phase 1** — Revenue + Pipeline MVP | Done | ✅ | Auto-ingest, KPI engine, chat, exec summary, PM report all working |
| **Phase 2** — Multi-KPI + GTM Agent | Aug–Sep 2026 | 🔄 In Progress | GTM recommended motions with $M impact; KPI correlation engine |
| **Phase 3** — Decision Intelligence | Q4 2026 | 📋 Planned | Orchestrate multi-agent; PPT/MBR/QBR auto-generation; feedback memory |

**Immediate next steps:**
- [ ] Connect Box folder for automated weekly Excel ingestion (watsonx.data / Orchestrate skill)
- [ ] Add GTM Agent — routes KPI insight → recommended GTM motion with target accounts + expected $M impact
- [ ] Wire real Granite LLM for exec narrative (current `/api/exec-summary` uses rule-based generation)
- [ ] Add `insight → action → outcome` schema to feedback loop (memory moat)
- [ ] Email subscription: automated weekly summary to PM subscribers
- [ ] Make data path configurable via `DATA_DIR` environment variable for multi-user deployments

---

## 11. IBM Tool Stack

| Tool | Role in Compass |
|---|---|
| **IBM Bob** | Development environment — code, XLSX processing, iteration |
| **Node.js / Express** | KPI API server (current runtime) |
| **watsonx.data** | Target ingestion layer (Box → normalized KPI JSON) |
| **watsonx.ai (Granite)** | LLM for insight narratives, GTM recommendations, executive summaries |
| **watsonx Orchestrate** | Multi-agent routing (Phase 3) |
| **IBM Code Engine** | Serverless container hosting — recommended for public IBMer access |
| **IBM Container Registry** | Docker image storage (`us.icr.io/ibm-compass/`) |
| **IBM Cloud Foundry** | Alternative hosting option |

---

## 12. Team & Contact

Built during **IBM TLS PM Internship 2026** — Puru Nayak
For questions, reach out via IBM Slack or open an issue on this repo:
👉 https://github.ibm.com/puru-ibm/ibm-compass/issues

---

*IBM Compass — Prepared for TLS Product Management Leadership · 2026*
