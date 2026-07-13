# IBM Compass — TLS Performance Intelligence Agent

> **Agentic AI for Performance Intelligence** — transforms weekly and monthly KPI reporting from a manual data-analysis process into an AI-powered intelligence and recommendation engine, enabling TLS Product Management leaders to understand *what happened*, *why it happened*, and *what actions to take next* — in under 4 minutes instead of 2–4 hours.

---

## 1. Objective & Goal

### The Problem
Today's TLS KPI workflow is entirely manual:
- Excel files are exported from multiple upstream systems (EPM, Salesforce/ISC, Pipeline tools)
- A Business Analyst builds pivot tables by hand — taking **1–2 days per cycle**
- Insights vary by analyst; there is no standard narrative or institutional memory
- The same work is repeated every week / every quarter with no carry-forward

### The Goal
**IBM Compass** is the AI agent that eliminates that toil:

| Capability | What It Delivers |
|---|---|
| **Auto-ingest** | Drops an updated `.xlsx` file → all KPIs refresh automatically |
| **KPI Intelligence** | Revenue · Signings · Pipeline · Win/Loss calculated WW and by Geo, Market, Offering, Quarter |
| **Conversational Analytics** | Ask anything in plain English — *"How did EMEA signings perform this quarter?"* |
| **Agentic Insights** | Root-cause analysis, trend detection, anomaly surfacing — in executive language |
| **Exec Summary Generation** | One-click AI narrative: What Went Well / What Didn't / Recommended Actions |
| **Feedback Loop** | Thumbs up/down captures what resonates — trains the system over time |

**North Star Metric:** Reduce Time-To-Action from KPI data by **80%** (< 4 min vs 2–4 hrs today).

---

## 2. Architecture

### High-Level — Four-Layer Agentic Stack

```
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 1 — DATA                                                  │
│  Excel / XLSX  →  Bob read_xlsx  →  JSON dumps on disk           │
│  (Pipeline sheet + Revenue sheet, date-stamped)                  │
└───────────────────────┬──────────────────────────────────────────┘
                        │ pre-processed at startup
┌───────────────────────▼──────────────────────────────────────────┐
│  LAYER 2 — KPI ENGINE  (server.js — Node / Express)              │
│  In-memory record store  │  filter() + filterRev()               │
│  ~30 REST API endpoints  │  /api/kpi/*  /api/revenue/*           │
│  Geo · Market · Quarter · Offering · Channel · Industry filters  │
└───────────────────────┬──────────────────────────────────────────┘
                        │ JSON over HTTP
┌───────────────────────▼──────────────────────────────────────────┐
│  LAYER 3 — INSIGHT + CHAT AGENT  (server.js /api/chat)           │
│  Session-aware intent parser  →  routes to correct KPI slice     │
│  Agentic narrative generation  →  /api/exec-summary              │
│  /api/insights  (trend · risk · root-cause bullets)              │
│  /api/pm-report  (full FLM / PM analysis)                        │
└───────────────────────┬──────────────────────────────────────────┘
                        │ rendered by
┌───────────────────────▼──────────────────────────────────────────┐
│  LAYER 4 — CONVERSATION UI  (public/index.html — vanilla JS)     │
│  IBM Carbon-styled SPA  │  Chart.js charts                       │
│  KPI dashboard · Tabular view · Chat panel · Exec overlay        │
│  Persona switching: PM View / Executive View                     │
└──────────────────────────────────────────────────────────────────┘
```

### Detailed Component Map

```
IBM-Compass/
├── server.js               # Express API server — all KPI logic lives here
│   ├── Data loading        # Reads JSON dumps at startup (Pipeline + Revenue)
│   ├── filter()            # Universal pipeline filter (geo/mkt/qtr/offering…)
│   ├── filterRev()         # Revenue actuals filter (same dimensions)
│   ├── /api/kpi/*          # ~20 pipeline KPI endpoints
│   ├── /api/revenue/*      # Revenue actuals endpoints
│   ├── /api/exec-summary   # AI executive narrative builder
│   ├── /api/insights       # Trend/risk/anomaly insight bullets
│   ├── /api/pm-report      # Full PM / FLM analysis report
│   ├── /api/chat           # Session-aware conversational agent
│   └── /api/feedback       # Feedback log (thumbs up/down)
│
├── public/
│   ├── index.html          # Full SPA — IBM Carbon styling + Chart.js
│   └── hierarchy.json      # Geo → Market → Country filter tree (pre-built)
│
├── build_hierarchy.mjs     # One-time script: rebuilds hierarchy.json from data
├── Dockerfile              # Container build (Node 20 Alpine)
├── deploy.ps1              # One-command deploy to IBM Code Engine
│
└── .bob/tmp/xlsx-dumps/    # Pre-processed XLSX data (JSON format)
    └── TLS Performance Data-*/
        ├── Pipeline_2026_07_11.json   # Pipeline rows + headers
        └── Revenue_2026_06_18.json    # Revenue rows + headers
```

### Data Flow (per request)

```
User filter selection / chat message
        │
        ▼
index.html  ──fetch──▶  /api/kpi/<endpoint>?geo=EMEA&quarter=2Q26&…
                                │
                                ▼
                     filter(opts) scans in-memory records[]
                     (pre-loaded from JSON dump at startup)
                                │
                                ▼
                     Aggregated JSON response → Chart.js / table render
```

### Key API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/kpi/summary` | Top-level KPI card values (pipeline, signings, win rate, call) |
| `GET /api/kpi/by-geo` | KPI breakdown by Geography |
| `GET /api/kpi/by-quarter` | Quarterly trend (multi-quarter) |
| `GET /api/kpi/by-offering` | Pipeline / signings by Offering Area |
| `GET /api/kpi/tabular` | Full drill-down table (all dimensions) |
| `GET /api/kpi/flm-analysis` | FLM forecast judgment analysis |
| `GET /api/kpi/top-accounts` | Top accounts by pipeline value |
| `GET /api/revenue/summary` | Revenue actuals KPI cards |
| `GET /api/revenue/by-geo` | Revenue by Geo + quarter |
| `GET /api/exec-summary` | AI-generated executive narrative |
| `GET /api/insights` | Trend/risk/anomaly bullets |
| `GET /api/pm-report` | Full PM analysis report |
| `POST /api/chat` | Conversational agent (session-aware) |
| `POST /api/feedback` | Capture thumbs up/down feedback |

All endpoints accept filter query params: `geo`, `market`, `country`, `quarter`, `year`, `offeringArea`, `consolidatedOffering`, `ut30`, `channel`, `clientType`.

---

## 3. How-To Guide — Get Started Quickly

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 18 + | Run the server |
| npm | 9 + | Install dependencies |
| Docker (optional) | any | Container build/run |
| IBM Cloud CLI (optional) | latest | Deploy to Code Engine |

---

### Step 1 — Clone & Install

```bash
git clone https://github.com/ibm-org/ibm-compass.git
cd ibm-compass
npm install
```

---

### Step 2 — Add Your Data

The server reads two pre-processed JSON dumps produced from the source Excel file. You have two options:

#### Option A — Use the existing data dumps (fastest)
The `.bob/tmp/xlsx-dumps/` folder contains the already-processed JSON files committed to the repo. The server will start immediately — skip to Step 3.

#### Option B — Refresh with a new Excel file (when data updates)

1. Drop the new `TLS Performance Data.xlsx` into the project root.

2. Use Bob (or run manually) to dump the workbook to JSON:
   ```
   In Bob: read_xlsx with dump:true on the new file
   ```
   This creates a new folder under `.bob/tmp/xlsx-dumps/` with `Pipeline_<date>.json` and `Revenue_<date>.json`.

3. Update the two constants at the top of `server.js` to point to the new dump:
   ```js
   // server.js — lines 13, 23–24, 29, 92
   const DATA_DUMP_DIR = ".bob/tmp/xlsx-dumps/TLS Performance Data-<new-hash>";
   const PIPE_SHEET = "Pipeline 2026.MM.DD";   // match your new sheet name
   const REV_SHEET  = "Revenue 2026.MM.DD";
   const PIPE_DUMP = path.join(__dirname, `${DATA_DUMP_DIR}/Pipeline_<date>.json`);
   const REV_DUMP  = path.join(__dirname, `${DATA_DUMP_DIR}/Revenue_<date>.json`);
   ```

4. Rebuild the Geo → Market → Country hierarchy filter:
   ```bash
   node build_hierarchy.mjs
   ```
   This writes an updated `public/hierarchy.json`.

---

### Step 3 — Run Locally

```bash
node server.js
```

Open your browser at **http://localhost:3000**

The dashboard will load immediately with:
- **KPI Summary cards** (Pipeline · Signings · Win Rate · Revenue)
- **Geo breakdown charts** (Americas · EMEA · APAC · Japan)
- **Quarterly trend view**
- **Conversational chat panel** (bottom right)
- **Exec Summary overlay** (top nav → "Exec Summary" button)

---

### Step 4 — Using the Chat Agent

The chat agent at `/api/chat` is **session-aware** — it carries context between turns.

**Example questions:**
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

### Step 5 — Deploy to IBM Code Engine (optional)

Prerequisites: Docker installed, IBM Cloud CLI installed, logged in (`ibmcloud login --sso`).

```powershell
.\deploy.ps1
```

This script will:
1. Build the Docker image
2. Push to IBM Container Registry (`us.icr.io/ibm-compass/compass-app:latest`)
3. Deploy / update the `compass-app` application in the `ibm-compass` Code Engine project
4. Print the live URL

> **Note:** The Dockerfile copies the `.bob/tmp/xlsx-dumps/` folder into the container — ensure your data dumps are up to date before deploying.

---

### Step 6 — Adding a New KPI or Dimension

All KPI logic lives in `server.js`. The pattern is consistent:

1. **Add a new API endpoint** using the `filter()` or `filterRev()` helper:
   ```js
   app.get("/api/kpi/my-new-metric", (req, res) => {
     const { geo = "WW", quarter = "ALL" } = req.query;
     const recs = filter({ geo, quarter });
     // aggregate, format, return
     res.json({ data: ... });
   });
   ```

2. **Wire it to the frontend** — add a `fetch("/api/kpi/my-new-metric?...")` call in `public/index.html` and render with Chart.js.

3. **Expose it in chat** — add intent-matching logic in the `/api/chat` handler (starts at line 1246 of `server.js`).

---

## 4. Roadmap (from where we left off)

| Phase | Timeline | Status | What's Next |
|---|---|---|---|
| **Phase 0** — Product definition | Done | ✅ | KPI priority locked, personas defined |
| **Phase 1** — Revenue + Pipeline MVP | Done | ✅ | Auto-ingest, KPI engine, chat, exec summary all working |
| **Phase 2** — Multi-KPI + GTM Agent | Aug–Sep 2026 | 🔄 In Progress | Add GTM recommended motions with $M impact; KPI correlation engine |
| **Phase 3** — Decision Intelligence | Q4 2026 | 📋 Planned | Full Orchestrate multi-agent; PPT/MBR/QBR auto-generation; feedback memory |

**Immediate next steps:**
- [ ] Connect Box folder for automated weekly Excel ingestion (watsonx.data / Orchestrate skill)
- [ ] Add GTM Agent endpoint — routes KPI insight → recommended GTM motion with target accounts + expected $M impact
- [ ] Wire real Granite LLM for exec narrative (current `/api/exec-summary` uses rule-based generation)
- [ ] Add `insight → action → outcome` schema to feedback loop (memory moat)
- [ ] Email subscription: automated weekly summary to PM subscribers

---

## 5. IBM Tool Stack

| Tool | Role in Compass |
|---|---|
| **IBM Bob** | Development environment — code, XLSX processing, iteration |
| **Node.js / Express** | KPI API server (current runtime) |
| **watsonx.data** | Target ingestion layer (Box → normalized KPI JSON) |
| **watsonx.ai (Granite)** | LLM for insight narratives, GTM recommendations, executive summaries |
| **watsonx Orchestrate** | Multi-agent routing (Phase 3) |
| **IBM Code Engine** | Serverless container hosting |
| **IBM Container Registry** | Docker image storage (`us.icr.io/ibm-compass/`) |

---

## 6. Team & Contact

Built during **IBM TLS PM Internship 2026** — Puru Nayak  
For questions, reach out via IBM Slack or open an issue on this repo.

---

*IBM Compass — Prepared for TLS Product Management Leadership · 2026*
