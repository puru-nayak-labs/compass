# Compass — Enterprise AI Data Intelligence Platform

> **The operating system for business performance intelligence.**
> Compass transforms fragmented KPI data from any source into a continuously learning intelligence system — delivering root-cause analysis, cross-signal risk detection, and ranked GTM recommendations in under 4 minutes, not 4 hours.

&nbsp;

<div align="center">

| | |
|---|---|
| **Live Platform** | https://puru-nayak-labs.github.io/compass/ |
| **Architecture** | https://puru-nayak-labs.github.io/compass/architecture.html |
| **Extension Guide** | https://puru-nayak-labs.github.io/compass/contributing.html |
| **Repository** | https://github.com/puru-nayak-labs/compass |

</div>

---

## What Compass Does

Enterprise leaders spend **2–4 hours per reporting cycle** extracting numbers from spreadsheets, building pivot tables, and writing the same narrative from scratch — with no institutional memory, no root-cause analysis, and no recommended actions. Compass eliminates all of that.

```
  Ask:  "Why is EMEA revenue declining in Q2?"
  Get:  Root cause · YoY/QoQ deltas · Cross-signal anomaly · Ranked GTM actions · $M impact estimate
  Time: < 4 minutes  (vs 2–4 hours today)
```

Compass is not a dashboard. It is an **agentic intelligence system** — it ingests structured data from any source, applies a deterministic KPI engine, detects cross-signal patterns, and delivers answers in conversational, executive-grade language with full data lineage back to the source row.

---

## The Business Case

| Dimension | Before Compass | With Compass | Improvement |
|---|---|---|---|
| Time to insight | 2–4 hours per cycle | < 4 minutes | **−95%** |
| Analyst effort | 1–2 days per reporting cycle | Minutes | **−90%** |
| Answer consistency | Varies by analyst | Deterministic, auditable | **100% reproducible** |
| Root cause | Manual hypothesis | Rule-based engine, instant | Automated |
| Recommended actions | None | Ranked by $M impact | Revenue impact quantified |
| Cross-KPI risk detection | Not possible | 5 signal patterns detected | Structural risk surfaced early |
| Data lineage | None | Every number traced to source row | Full audit trail |
| Institutional memory | Lost at each cycle | Persisted insight→action→outcome log | Compounding moat |

**North Star Metric:** Reduce Time-To-Action from KPI data by **80%**.

---

## Platform Capabilities

### 1 · Enterprise Data Intelligence — 10 Core Concepts Implemented

Compass is architected around the 10 foundational principles of enterprise-grade AI data platforms:

| Concept | What It Means | How Compass Implements It |
|---|---|---|
| **Data Lineage** | Every number traces back to its exact source row, column, and dataset version | `DataSet.checksum` + `KpiSnapshot.lineage[]` + `RunTrace.dataLineage[]` — end-to-end provenance from UI to source row |
| **Ontology** | Canonical meaning of every KPI — independent of what any source system calls it | `MetricCatalog` declares formula, unit, source column, and aliases. `DimensionHierarchy` formalizes Country → Market → Geo → WW rollup |
| **Knowledge Graph** | Relationships between entities, KPIs, and dimensions as a typed graph | `EntityResolver` unifies the same company across sources. `ISC_FORECAST_KB` encodes sales stage → forecast category → FLM judgment relationships |
| **Data Governance** | Who owns each KPI, how it is calculated, and who can change the definition | `SchemaRegistry` is the single source of truth. `AccuracyCheckpoint` cross-validates all totals before serving. Immutable `DataSet` objects |
| **Observability** | Full visibility into every agent execution — latency, confidence, fallback, cost | `RunTrace` on every response: intent, filters, records scanned, confidence, latency, fallback flag. Persisted to `agent-runs.jsonl` |
| **Data Mesh** | Domain-owned data products with a standard contract, not a central data warehouse | `DomainConfig` pattern: each business unit owns its data product definition. Platform is the contract layer |
| **Data Catalog** | Discoverable, documented inventory of every KPI, dimension, and data source | `MetricCatalog` + `ConnectorRegistry` + `/api/pm-meta` — every KPI and dimension is registered and queryable |
| **Provenance** | Reproducible audit trail: given any output, reconstruct every input that produced it | `DataSet.fetchedAt` + `DataSet.checksum` + `KpiSnapshot.lineage[]` + `InsightBundle.lineage[]` — full provenance chain |
| **Data Freshness** | Staleness detection with automated warnings before stale data reaches decisions | `/api/data-info` returns `pipelineAgeDays`, `revenueAgeDays`, `pipelineStale`, `revenueStale` — staleness gate on every response |
| **Deterministic AI** | LLMs narrate; they never compute. Every number is produced by a deterministic engine | KPI Engine → Intelligence Layer → Narrator pattern. `temperature=0`, `OutputValidator` rejects any LLM number not in the `InsightBundle` |

### 2 · KPI Intelligence Engine

- **Pipeline · Signings · Revenue · Win Rate** — worldwide and by Geo, Market, Offering, Quarter
- **30+ API endpoints** — every dimension combinable: geo × market × quarter × offering × channel × clientType
- **QoQ / YoY / MoM** deltas computed automatically for every KPI
- **KPI Targets + RAG Status** — Green/Amber/Red per Offering Area vs declared targets
- **FLM Forecast Analysis** — Call vs Upside vs Stretch breakdown with manager conviction scoring

### 3 · Cross-Signal Intelligence (Correlation Engine)

Five typed signal patterns that no single-KPI dashboard can detect:

| Pattern | Signal | Business Risk |
|---|---|---|
| `SIGNINGS_UP_REVENUE_DOWN` | Signings healthy but revenue declining | Contract recognition lag / billing delay |
| `PIPELINE_UP_WINRATE_DOWN` | Growing pipeline but win rate falling | Pipeline quality risk — funnel inflation |
| `SIGNINGS_DROP_PIPELINE_HEALTHY` | Pipeline strong but signings collapsing | Late-stage conversion breakdown |
| `LOW_COVERAGE_DESPITE_SIGNINGS_GROWTH` | Good signings YoY but commit coverage < 50% | Pull-forward from prior periods, not sustainable |
| `REVENUE_UP_SIGNINGS_DOWN` | Revenue drawing from backlog; signings declining | Future revenue gap — backlog depletion warning |

### 4 · GTM Recommendation Engine

Every recommendation is a typed `Recommendation` object — not a text string:

```json
{
  "id": "win-rate-EMEA-2Q26",
  "priority": "HIGH",
  "category": "Win Rate",
  "geo": "EMEA",
  "action": "EMEA win rate at 38% — run deal coaching workshop on top-10 stalled opps. Target: 55%+ by end of 2Q26.",
  "expectedImpactM": 4.2,
  "confidence": 0.72,
  "deadline": "End of 2Q26"
}
```

Recommendations are logged to `memory-log.jsonl` — the seed of the **insight→action→outcome moat**.

### 5 · Conversational Analytics

Session-aware chat agent that understands ISC forecasting terminology natively:

```
"How is PSI Americas signings this quarter?"     → Pipeline/signings breakdown by market
"Why is revenue low in Q2?"                      → Root-cause with anomaly detection
"What is Best Case?"                             → ISC Forecast KB — stages, definitions, objectives
"Which geo grew fastest?"                        → Ranked geo growth with YoY/QoQ
"Where should PM focus this month?"              → Priority recommendations with $M impact
```

Context (geo, quarter, offering area) persists across turns **and across server restarts** via `chat-sessions.json`.

### 6 · Personas

| Persona | What They See |
|---|---|
| **Analyst** | KPI tiles · trend charts · tabular drill-down · filter bar · chat |
| **Product Manager** | 9-tab PM report: Business Health → Exec Summary → Actions → Pipeline → Signings → Revenue → Win Rate → Geo → Others |
| **Portfolio Leader** | Offering Area intel · Geo intel · cross-portfolio comparison · right-panel highlights |

---

## Architecture — 7-Layer Platform

```
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 0 — SOURCE                                                               │
  │  Excel · DB2 · Oracle · Snowflake · REST API · Data Lake · Salesforce · EPM    │
  └────────────────────────────────────┬────────────────────────────────────────────┘
                                       │  DataConnector.fetch() → DataSet
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 1 — CONNECTOR  (one interface, N implementations)                        │
  │  ExcelConnector · Db2Connector · SnowflakeConnector · SalesforceConnector       │
  │  All emit: DataSet { rows · schema · checksum · fetchedAt · warnings }          │
  └────────────────────────────────────┬────────────────────────────────────────────┘
                                       │  normalized · typed · checksummed
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 2 — KPI ENGINE  (deterministic · schema-driven)                          │
  │  FilterEngine · AggregationEngine · DeltaEngine · AccuracyCheckpoint · KpiCache │
  │  Emits: KpiSnapshot { values · deltas · lineage · rag }                         │
  └────────────────────────────────────┬────────────────────────────────────────────┘
                                       │  KpiSnapshot
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 3 — INTELLIGENCE  (deterministic · rule-based · zero LLM)                │
  │  TrendAnalyser · AnomalyDetector · RiskScorer · CorrelationEngine · GtmEngine   │
  │  Emits: InsightBundle { highlights · risks · signals · recommendations }         │
  └────────────────────────────────────┬────────────────────────────────────────────┘
                                       │  InsightBundle
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 4 — NARRATOR  (LLM as narrator only — never as calculator)               │
  │  LlmNarrator (temp=0, JSON mode) → OutputValidator → NarrativeResult            │
  │  TemplateNarrator (deterministic fallback — always available)                   │
  └────────────────────────────────────┬────────────────────────────────────────────┘
                                       │  NarrativeResult
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 5 — AGENT BUS  (Watsonx Orchestrate · Phase 3)                           │
  │  IntentParser · DataAgent · AnalyticsAgent · InsightAgent · GtmAgent · Memory   │
  │  All implement: Agent<TContext, TResult> → AgentResult + RunTrace                │
  └────────────────────────────────────┬────────────────────────────────────────────┘
                                       │  AgentResult + RunTrace
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 6 — PRESENTATION                                                         │
  │  Analyst View · PM Report (9 tabs) · Portfolio Leader · Chat · Email Digest     │
  └─────────────────────────────────────────────────────────────────────────────────┘
```

**Determinism guarantee:** Every KPI value, trend, anomaly, and recommendation is computed deterministically before the LLM sees any data. The LLM converts structured JSON to language — it never produces numbers.

---

## API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/kpi/summary` | Top-level KPI tiles — pipeline, signings, win rate with QoQ/YoY deltas |
| `GET /api/kpi/by-geo` | KPI breakdown by Geography |
| `GET /api/kpi/by-quarter` | Quarterly trend series |
| `GET /api/kpi/by-offering` | Pipeline / signings by Offering Area |
| `GET /api/kpi/tabular` | Full drill-down table — groupBy any dimension |
| `GET /api/kpi/flm-analysis` | First Line Manager forecast judgment analysis |
| `GET /api/kpi/top-accounts` | Top accounts by pipeline or signings value |
| `GET /api/kpi/stage-aging` | Pipeline stage breakdown with average opportunity age |
| `GET /api/kpi/targets` | KPI targets + actuals + **RAG status** (Green/Amber/Red) per OA |
| `GET /api/kpi/correlation` | **Cross-KPI signal detection** — 5 structural risk patterns |
| `GET /api/revenue/summary` | Revenue actuals KPI tiles with QoQ/YoY deltas |
| `GET /api/revenue/by-geo` | Revenue actuals by Geography + quarter |
| `GET /api/revenue/tabular` | Revenue drill-down — groupBy any dimension |
| `GET /api/exec-summary` | AI executive narrative — MBR-style paragraph |
| `GET /api/insights` | Right-panel intelligence — Highlights · Focus Areas · Actions |
| `GET /api/pm-report` | Full 9-section PM analysis with **structured Recommendations** ($M impact + confidence) |
| `GET /api/pm-report/industry` | Industry × Geo matrix with FLM conviction and GTM actions |
| `GET /api/pm-meta` | Product hierarchy — Offering Areas / Offerings / Portfolios |
| `GET /api/data-info` | Data source dates + **staleness flags** (age in days, stale boolean) |
| `GET /api/memory` | **Insight→action→outcome log** — last 100 recommendation records |
| `POST /api/memory/outcome` | Record observed outcome against a recommendation (closes the feedback loop) |
| `POST /api/eval` | **Run golden test suite** — 18 chat cases, pass/fail report, ≥95% threshold |
| `POST /api/chat` | Conversational agent — session-aware, context persisted across restarts |
| `POST /api/feedback` | Capture thumbs up/down with full RunTrace |

**All filter endpoints accept:** `geo`, `market`, `country`, `quarter`, `year`, `offeringArea`, `consolidatedOffering`, `ut30`, `channel`, `clientType`

---

## Run Locally

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

### Step 2 — Add Data

The server loads two pre-processed JSON files at startup (see [Data Sources](#data-sources) below).

```bash
# Point at your data folder
DATA_DIR=data node server.js
```

Or use the default dev path (Bob xlsx-dump output):
```bash
node server.js
```

Open **http://localhost:3000** and hard-refresh with **Ctrl + Shift + R**.

### Data Sources

The platform is source-agnostic. Any source must produce JSON in this shape:

```json
{ "headers": ["Geo", "Quarter", "Oppty Value", "..."], "rows": [["Americas", "2Q26", 1.5]] }
```

| Source | Path |
|---|---|
| **Excel / CSV** *(current)* | Any xlsx-to-JSON converter → `data/Pipeline.json` + `data/Revenue.json` |
| **DB2** | `ibm_db` npm → write rows to JSON |
| **Snowflake** | `snowflake-sdk` query → write JSON |
| **Salesforce / ISC** | SOQL via `jsforce` → map fields → JSON |
| **REST API** | `fetch()` → normalize → JSON |
| **EPM** | EPM REST API export → JSON |

---

## Deploy with Docker

```bash
# Build
docker build --build-arg DATA_SRC=data -t compass-app:latest .

# Run
docker run -p 3000:3000 compass-app:latest

# Override data at runtime (no rebuild)
docker run -p 3000:3000 -e DATA_DIR=/custom/data -v /your/data:/custom/data compass-app:latest

# Push to registry
docker tag compass-app:latest ghcr.io/puru-nayak-labs/compass-app:latest
docker push ghcr.io/puru-nayak-labs/compass-app:latest
```

---

## Roadmap

| Phase | Status | Delivered |
|---|---|---|
| **Phase 0** — Product definition | ✅ Done | KPI priority locked · personas defined · success criteria set |
| **Phase 1** — Working MVP | ✅ Done | KPI engine · 3 personas · chat · exec summary · PM report · Docker |
| **Phase 1.5** — Knowledge Layer | ✅ Done | ISC Forecasting KB · sales stage objectives · FLM judgment logic |
| **Phase 1.6** — Observability | ✅ Done | Per-run RunTrace · confidence badge · collapsible trace panel |
| **Phase 2a** — Platform Foundations | ✅ Done | KPI Targets + RAG · GTM $M impact · Correlation Engine · Persistent memory · Freshness gate · Eval harness |
| **Phase 2b** — GTM Agent + LLM | 🔄 In Progress | `DataConnector` abstraction · `NarratorService` + Granite fallback · auto-ingest |
| **Phase 3** — Decision Intelligence | 📋 Planned | Multi-agent Orchestrate routing · MBR/QBR auto-generation · `MemoryAgent` outcome tracking |
| **Phase 4** — Multi-Domain Platform | 🔭 Future | `DomainConfig` registry · second business unit onboarding · open-source connector SDK |

---

## Platform Design Docs

| Doc | Contents |
|---|---|
| [`docs/index.html`](docs/index.html) | 10-concept enterprise data intelligence blueprint · OOP interface catalogue · determinism-first AI pattern · data lineage & ontology |
| [`docs/architecture.html`](docs/architecture.html) | Visual 7-layer architecture · data flow · interface contracts · Phase 2a migration table |
| [`docs/contributing.html`](docs/contributing.html) | Step-by-step: add data source · KPI · domain · agent · insight rule · LLM narrator |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **API Server** | Node.js 20 / Express 5 |
| **Frontend** | Vanilla JS SPA · Chart.js 4 · Carbon-inspired CSS |
| **Data Ingest** | Source-agnostic `DataConnector` interface — Excel, DB2, Oracle, Snowflake, REST, Salesforce, EPM |
| **KPI Engine** | In-memory filter + aggregation (pure functions) · AccuracyCheckpoint |
| **Correlation Engine** | Cross-KPI signal pattern detection — 5 structural patterns |
| **GTM Engine** | Rule-based Recommendation engine with `expectedImpactM` + `confidence` |
| **Chat Agent** | Session-aware intent parsing + structured KPI dispatch + ISC KB |
| **Memory** | `chat-sessions.json` (session persistence) · `memory-log.jsonl` (insight→action→outcome) |
| **Observability** | Per-run `RunTrace` · `agent-runs.jsonl` · confidence badge · eval harness |
| **Eval** | `evals/golden.json` (18 golden cases) · `POST /api/eval` runner · `evals/failures.jsonl` |
| **Container** | Docker (Node 20 Alpine) |

---

## Contact

Built by **Puru Nayak** — [github.com/puru-nayak-labs](https://github.com/puru-nayak-labs)

Issues and contributions: https://github.com/puru-nayak-labs/compass/issues

---

*Compass — Enterprise AI Data Intelligence Platform · 2026*
