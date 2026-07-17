# Compass — Agentic AI for Performance Intelligence

> Transforms weekly and monthly KPI reporting from a manual data-analysis process into an
> AI-powered intelligence and recommendation engine — enabling leaders to understand
> *what happened*, *why it happened*, and *what actions to take next* — in under 4 minutes
> instead of 2–4 hours.

🔗 **Repo:** https://github.com/puru-nayak-labs/compass

---

## Table of Contents

1. [The Problem & Goal](#1-the-problem--goal)
2. [How It Works](#2-how-it-works)
3. [Architecture](#3-architecture)
4. [API Endpoints](#4-api-endpoints)
5. [Run Locally](#5-run-locally)
6. [Personas & Features](#6-personas--features)
7. [Deploy with Docker](#7-deploy-with-docker)
8. [Refreshing Data](#8-refreshing-data)
9. [Extending the Platform](#9-extending-the-platform)
10. [Roadmap](#10-roadmap)
11. [Platform Design Docs](#11-platform-design-docs)
12. [Tech Stack](#12-tech-stack)
13. [Contact](#13-contact)

---

## 1. The Problem & Goal

### The Problem

Today's KPI reporting workflow is entirely manual:
- Spreadsheets exported from multiple source systems
- A Business Analyst builds pivot tables by hand — **1–2 days per cycle**
- Insights vary by analyst; no standard narrative or institutional memory
- Same work repeated every week and every quarter with no carry-forward

### The Goal

**Compass** is the AI agent that eliminates that toil:

| Capability | What It Delivers |
|---|---|
| **Auto-ingest** | Drop an updated `.xlsx` → all KPIs refresh automatically |
| **KPI Intelligence** | Revenue · Signings · Pipeline · Win/Loss — worldwide and by Geo, Market, Offering, Quarter |
| **Conversational Analytics** | Ask anything in plain English |
| **Agentic Insights** | Root-cause analysis, trend detection, anomaly surfacing — in executive language |
| **PM Report (9 tabs)** | Full Business Health → Actions → Pipeline → Revenue → Win Rate → Geo → Others |
| **Portfolio Leader View** | Offering Area-level and Geo-level intel with right-panel highlights |
| **Feedback Loop** | Thumbs up/down captures resonance — trains the system over time |

**North Star Metric:** Reduce Time-To-Action from KPI data by **80%** (< 4 min vs 2–4 hrs today).

---

## 2. How It Works

### High-Level View

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   SPREADSHEET DATA            INTEL LAYER          INSIGHTS & UI    │
│                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │  Performance    │    │  Compass        │    │  PM Report      │  │
│  │  Data.xlsx      │───▶│  KPI Engine +   │───▶│  Exec Summary   │  │
│  │                 │    │  Insight Agent  │    │  Chat Agent     │  │
│  │  • Pipeline     │    │                 │    │  Right Panel    │  │
│  │  • Revenue      │    │  (server.js)    │    │  Highlights     │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Detailed End-to-End Flow

```
  INPUT LAYER
  ├── Performance Data.xlsx
  │   ├── Sheet: Pipeline   (opportunity-level rows)
  │   └── Sheet: Revenue    (monthly actuals)
  │
  │   ↓  read_xlsx → JSON dump
  │
  PROCESSING LAYER
  ├── data/Pipeline.json   (normalised rows + headers)
  └── data/Revenue.json
      ↓  loaded at server startup → records[] + revRecords[]
  │
  KPI ENGINE  (server.js)
  ├── filter(opts)      — pipeline slices (geo/market/qtr/offering/…)
  ├── filterRev(opts)   — revenue slices (same dimensions)
  ├── ~30 REST API endpoints
  │   ├── /api/kpi/*         KPI summary, by-geo, by-quarter, tabular
  │   ├── /api/revenue/*     Revenue actuals, by-geo, trend
  │   ├── /api/pm-report     Full 9-section PM analysis
  │   ├── /api/insights      Trend · Risk · Anomaly bullets
  │   ├── /api/exec-summary  AI executive narrative
  │   ├── /api/chat          Session-aware conversational agent
  │   └── /api/feedback      Thumbs up/down feedback log
  │
  PRESENTATION LAYER  (public/index.html — Vanilla JS SPA)
  ├── Analyst View       — KPI tiles · charts · tabular drill-down
  ├── Product Manager    — 9-tab PM report · Revenue chart · Geo intel
  └── Portfolio Leader   — Offering Area intel · Geo intel · Roadmap
```

---

## 3. Architecture

### Project Structure

```
compass/
├── server.js                    # Express API + KPI engine + insight agent
│   ├── Data loading             # Reads JSON dumps at startup
│   ├── filter()                 # Universal pipeline filter
│   ├── filterRev()              # Revenue actuals filter
│   ├── /api/kpi/*               # ~20 pipeline KPI endpoints
│   ├── /api/revenue/*           # Revenue actuals endpoints
│   ├── /api/pm-report           # Full PM analysis report
│   ├── /api/exec-summary        # AI executive narrative builder
│   ├── /api/insights            # Trend / risk / anomaly bullets
│   ├── /api/chat                # Session-aware conversational agent
│   └── /api/feedback            # Feedback log (thumbs up/down)
│
├── public/
│   ├── index.html               # Full SPA — Carbon-inspired styling + Chart.js
│   └── hierarchy.json           # Geo → Market → Country filter tree
│
├── build_hierarchy.mjs          # One-time: rebuilds hierarchy.json from data
├── Dockerfile                   # Container build (Node 20 Alpine)
├── deploy.ps1                   # One-command deploy to any container platform
├── docs/                        # Platform design & architecture docs
│   ├── index.html               # Design doc & interface catalogue
│   ├── architecture.html        # Visual 7-layer architecture diagram
│   └── contributing.html        # Extending the platform — step-by-step
│
└── data/                        # Pre-processed data (not in git — see below)
    ├── Pipeline.json
    └── Revenue.json
```

---

## 4. API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/kpi/summary` | Top-level KPI tiles (pipeline, signings, win rate) |
| `GET /api/kpi/by-geo` | KPI breakdown by Geography |
| `GET /api/kpi/by-quarter` | Quarterly trend |
| `GET /api/kpi/by-offering` | Pipeline / signings by Offering Area |
| `GET /api/kpi/tabular` | Full drill-down table |
| `GET /api/kpi/flm-analysis` | First Line Manager forecast judgment |
| `GET /api/kpi/top-accounts` | Top accounts by pipeline value |
| `GET /api/revenue/summary` | Revenue actuals KPI tiles |
| `GET /api/revenue/by-geo` | Revenue by Geo + quarter |
| `GET /api/exec-summary` | AI executive narrative |
| `GET /api/insights` | Trend / risk / anomaly bullets for right panel |
| `GET /api/pm-report` | Full 9-section PM analysis |
| `GET /api/pm-meta` | Filter tree: Offering Areas / Offerings / Products |
| `POST /api/chat` | Conversational agent (session-aware) |
| `POST /api/feedback` | Capture thumbs up/down |

**All endpoints accept:** `geo`, `market`, `country`, `quarter`, `year`, `offeringArea`, `consolidatedOffering`, `ut30`, `channel`, `clientType`

---

## 5. Run Locally

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |

### Step 1 — Clone & Install

```bash
git clone https://github.com/puru-nayak-labs/compass.git
cd compass
npm install
```

### Step 2 — Add Data Files

The server reads two pre-processed JSON files. Because source data files are not
committed to git, you need to generate them from your own spreadsheet.

1. Place your `Performance Data.xlsx` in the project root (two sheets: Pipeline + Revenue).
2. Use the `read_xlsx` tool (or any xlsx-to-JSON converter) with `dump:true` to produce:
   ```
   data/
   ├── Pipeline.json
   └── Revenue.json
   ```
3. Update the `DATA_DUMP_DIR` constant in `server.js` (line ~27) to point at your `data/` folder,
   or set the `DATA_DIR` environment variable at runtime:
   ```powershell
   $env:DATA_DIR = "data"
   node server.js
   ```

### Step 3 — Run

```bash
node server.js
# or
npm start
```

Open **http://localhost:3000**. Hard-refresh with **Ctrl + Shift + R** after code changes.

### Step 4 — Chat Agent

The chat agent is session-aware — it carries context between turns.

```
"How is pipeline performing this quarter?"
"Show me EMEA signings vs last year"
"Which geo has the highest win rate in Q2?"
"What are the top risks in Americas pipeline?"
"What should PM focus on this month?"
```

---

## 6. Personas & Features

### Analyst View
- 2-row compressed filter bar
- KPI tiles with YoY/QoQ deltas
- Chart.js trend charts (pipeline, signings, revenue)
- Full tabular drill-down with mini bar charts

### Product Manager View (9-tab Report)
| Tab | Content |
|---|---|
| **01 Business Health** | Intel bullets · KPI tiles · Geo cards · Top accounts |
| **02 Exec Summary** | AI-generated narrative |
| **03 Top Actions** | High-priority GTM actions · Account watchlist |
| **04 Pipeline** | Trend chart · by-Geo table · Offering breakdown |
| **05 Signings** | Trend chart · Won-deal analysis |
| **06 Revenue** | Line chart · 4 KPI tiles |
| **07 Win Rate** | Win/loss reasons · per-Geo win rate |
| **08 Geography** | Per-geo cards with spark bars · intel bullets |
| **09 Others** | Industry · Channel · Client Segment tables |

### Portfolio Leader View
- Intel by Offering Area (pipeline, signings, YoY, per-OA action)
- Intel by Geography (KPI row + intel bullets + top account)

**Right Intelligence Panel** (all personas):
- 🟢 Top Highlights — what's going well
- 🔴 Top Focus Areas — what needs attention
- 🟣 Top Recommended Actions — ranked GTM motions

---

## 7. Deploy with Docker

```bash
# Build image (bake your data folder into the image)
docker build --build-arg DATA_SRC=data -t compass-app:latest .

# Run locally
docker run -p 3000:3000 compass-app:latest

# Or override the data folder at runtime (no rebuild needed)
docker run -p 3000:3000 -e DATA_DIR=/custom/data -v /your/data:/custom/data compass-app:latest
```

To deploy to any container platform (Fly.io, Railway, Render, AWS ECS, etc.):

```bash
# Tag and push to your container registry
docker tag compass-app:latest ghcr.io/puru-nayak-labs/compass-app:latest
docker push ghcr.io/puru-nayak-labs/compass-app:latest
```

See [`deploy.ps1`](deploy.ps1) for a one-command deploy script.

---

## 8. Refreshing Data

When a new spreadsheet is available:

1. Drop it into the project root.
2. Convert to JSON dumps (see Step 2 in [Run Locally](#5-run-locally)).
3. Point `DATA_DIR` at the new folder:
   ```bash
   DATA_DIR=data node server.js
   ```
4. Rebuild the geo hierarchy if the geo/market structure changed:
   ```bash
   node build_hierarchy.mjs
   ```

---

## 9. Extending the Platform

### Add a New KPI Endpoint

```js
// server.js
app.get("/api/kpi/my-new-metric", (req, res) => {
  const { geo = "WW", quarter = "ALL" } = req.query;
  const recs = filter({ geo, quarter });
  res.json({ data: /* aggregate */ });
});
```

### Wire It to the Frontend

```js
// public/index.html
const data = await fetch(`/api/kpi/my-new-metric?${qs({ geo, quarter })}`).then(r => r.json());
// render with Chart.js or a table
```

### Expose It in Chat

```js
// server.js  ~line 1246 in /api/chat handler
if (/my new metric/i.test(msg)) {
  // call your aggregation, return structured answer
}
```

### Swap in a Real LLM

The current `exec-summary` and `insights` endpoints use rule-based generation.
To swap in any LLM (OpenAI, Anthropic, watsonx Granite, etc.):

```js
// Replace the narrative-building logic with an LLM API call
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  body: JSON.stringify({ model: "gpt-4o", temperature: 0, messages: [{ role: "user", content: prompt }] })
});
```

See [`docs/contributing.html`](docs/contributing.html) for the full platform extension guide
including the `DataConnector`, `InsightEngine`, and `NarratorService` interface contracts.

---

## 10. Roadmap

| Phase | Status | What's Included |
|---|---|---|
| **Phase 0** — Product definition | ✅ Done | KPI priority locked, personas defined |
| **Phase 1** — MVP | ✅ Done | Auto-ingest, KPI engine, chat, exec summary, PM report, observability |
| **Phase 1.5** — Knowledge Layer | ✅ Done | Forecasting KB, sales stage objectives, FLM judgment logic in chat |
| **Phase 1.6** — Observability | ✅ Done | Per-run trace, confidence badge, collapsible trace panel |
| **Phase 2** — GTM Agent | 🔄 In Progress | GTM recommended motions with $M impact; KPI correlation engine |
| **Phase 3** — Decision Intelligence | 📋 Planned | Multi-agent routing; auto-generation of reports; feedback memory |

---

## 11. Platform Design Docs

The [`docs/`](docs/) folder contains the full platform architecture design, built for
extensibility, source-agnosticism, and determinism-first AI.

| Doc | Contents |
|---|---|
| [`docs/index.html`](docs/index.html) | 7-point design blueprint · OOP interface catalogue · non-determinism solution |
| [`docs/architecture.html`](docs/architecture.html) | Visual 7-layer architecture · data flow · migration path MVP → platform |
| [`docs/contributing.html`](docs/contributing.html) | Step-by-step: add data source · KPI · domain · agent · insight rule · LLM |

---

## 12. Tech Stack

| Layer | Technology |
|---|---|
| **API Server** | Node.js 20 / Express 5 |
| **Frontend** | Vanilla JS SPA · Chart.js · Carbon-inspired CSS |
| **Data Ingest** | XLSX → JSON pre-processing |
| **KPI Engine** | In-memory filter + aggregation (pure functions) |
| **Chat Agent** | Session-aware intent parsing + structured KPI dispatch |
| **Observability** | Per-run trace · confidence badge · agent-runs log |
| **Container** | Docker (Node 20 Alpine) |

---

## 13. Contact

Built by **Puru Nayak** — [github.com/puru-nayak-labs](https://github.com/puru-nayak-labs)

For questions or contributions, open an issue:
👉 https://github.com/puru-nayak-labs/compass/issues

---

*Compass — Agentic AI for Performance Intelligence · 2026*
