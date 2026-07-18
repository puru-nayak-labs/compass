# IBM Compass — AI Performance Intelligence

> Turn 4 hours of KPI reporting into a 4-minute conversation.

Compass is an **agentic intelligence system** for IBM TLS Product Management. It ingests pipeline and revenue data from any source, runs a deterministic KPI engine across every geo, quarter, and offering, and delivers root-cause analysis, cross-signal risk signals, and ranked GTM actions through a conversational interface — with full data lineage back to the source row.

&nbsp;

| | |
|---|---|
| **Live Platform** | https://puru-nayak-labs.github.io/compass/ |
| **Architecture Diagram** | https://puru-nayak-labs.github.io/compass/architecture.html |
| **Platform Extension Guide** | https://puru-nayak-labs.github.io/compass/contributing.html |

---

## The Problem

Enterprise PM teams spend **2–4 hours per reporting cycle** on the same workflow every quarter:

- Pull pipeline data from ISC, revenue from EPM, signings from a shared drive
- Build pivot tables, compute deltas manually, write the same narrative from scratch
- No cross-signal analysis (signings up but revenue down?), no root cause, no recommended actions
- Institutional memory is lost — the same analysis is repeated every cycle with no learning

The result: decisions are made on stale, manually assembled data — 4 hours after the question was asked.

---

## What Compass Delivers

| Metric | Before | With Compass |
|---|---|---|
| Time to insight | 2–4 hours | < 4 minutes |
| Analyst effort | 1–2 days per cycle | Minutes |
| Answer consistency | Varies by analyst | Deterministic, auditable |
| Root cause | Manual hypothesis | Rule-based engine, instant |
| Recommended actions | None | Ranked by estimated $M impact |
| Cross-KPI risk detection | Not possible | 5 structural signal patterns |
| Data lineage | None | Every number traced to source row |
| Institutional memory | Lost each cycle | Persisted insight → action → outcome log |

**North Star:** Reduce Time-To-Action from KPI data by 80% — under 4 minutes, every time.

---

## Business Use Cases

**"How is EMEA signings this quarter?"**
→ Signings total, YoY/QoQ delta, geo rank, top accounts — in one response, under 3 seconds.

**"Why is revenue declining in Q2?"**
→ Root-cause breakdown: revenue vs signings gap, recognition lag signal, geo-level waterfall.

**"Where should I focus this month?"**
→ Ranked priority list with estimated $M impact per action, deadline, and confidence score.

**"What is Best Case vs Commit?"**
→ ISC Forecast KB answers instantly — sales stage definitions, FLM judgment logic, forecast categories.

**"Which geo has the lowest win rate?"**
→ Win rate by geo ranked, QoQ trend, and a specific deal-coaching action surfaced automatically.

---

## Why Compass Is Different

| Capability | Excel / Pivot | Tableau / Power BI | Generic LLM | **Compass** |
|---|---|---|---|---|
| Natural language Q&A | ✗ | Limited | ✓ | ✓ |
| Root cause analysis | Manual | ✗ | Hallucination risk | ✓ Rule-based |
| ISC domain knowledge | ✗ | ✗ | ✗ | ✓ Built-in KB |
| Cross-KPI signal detection | ✗ | ✗ | ✗ | ✓ 5 patterns |
| Session memory | ✗ | ✗ | Context window only | ✓ Persistent |
| Deterministic answers | ✗ | ✓ | ✗ | ✓ |
| Time to insight | 2–4 hrs | 15–30 min setup | No live data | < 4 min |
| GTM recommendations + $M impact | ✗ | ✗ | ✗ | ✓ |
| Data lineage | ✗ | Partial | ✗ | ✓ End-to-end |

---

## Platform Capabilities

### Conversational KPI Intelligence
Ask any question about pipeline, signings, revenue, or win rate in plain English. Compass understands geo, quarter, offering area, market, and ISC forecasting terminology natively. Context persists across turns and across server restarts.

### KPI Engine — 30+ Endpoints
Every KPI (Pipeline · Signings · Revenue · Win Rate · FLM Forecast · Call · Upside) is available across every filter combination — geo × market × country × quarter × offering × channel × client type — with QoQ, YoY, and MoM deltas computed automatically.

### KPI Targets + RAG Status
Declare quarterly targets per Offering Area. The engine computes Green / Amber / Red status automatically and shows RAG badges on every KPI tile. No manual threshold checks.

### Cross-Signal Correlation Engine
Five typed structural risk patterns that no single-KPI dashboard can detect:

| Pattern | What It Means |
|---|---|
| Signings ↑, Revenue ↓ | Contract recognition lag or billing delay |
| Pipeline ↑, Win Rate ↓ | Funnel inflation — quality risk |
| Signings collapse, Pipeline healthy | Late-stage conversion breakdown |
| Low coverage despite signings growth | Pull-forward from prior periods |
| Revenue ↑, Signings ↓ | Future revenue gap — backlog depletion |

### GTM Recommendation Engine
Every recommendation carries a priority level, estimated $M impact, confidence score, responsible geo, and deadline — logged to a persistent memory file that accumulates outcome data over time. The longer it runs, the smarter it gets.

### 3 PM Personas
- **Analyst** — KPI tiles, trend charts, tabular drill-down, chat
- **Product Manager** — 9-section flipbook: Business Health → Exec Summary → Actions → Pipeline → Signings → Revenue → Win Rate → Geo → Industry
- **Portfolio Leader** — Cross-OA portfolio view with signals, risk indicators, and recommended portfolio actions

### Data Freshness Gate
Every response checks how old the data is. If pipeline data is older than 14 days, or revenue older than 30 days, a staleness warning appears in the UI and is flagged in every API response — before stale data reaches a decision.

### Eval Harness
30 golden test cases covering every chat intent. Run `npm test` to execute the full suite. The server returns a pass/fail report with a 95% threshold gate — fails exit non-zero for CI integration.

---

## Architecture — 7 Layers

Data flows strictly downward. No layer calls upward. Every cross-layer dependency is an interface.

| Layer | Name | Role |
|---|---|---|
| 0 | **Source** | Excel · DB2 · Oracle · Snowflake · REST API · Salesforce · EPM |
| 1 | **Connector** | `DataConnector` interface — source-agnostic ingest → typed `DataSet` with checksum |
| 2 | **KPI Engine** | Deterministic filter + aggregation + delta engine → `KpiSnapshot` |
| 3 | **Intelligence** | Rule-based trend, anomaly, correlation, GTM engine → `InsightBundle` |
| 4 | **Narrator** | `NarratorService` — LLM converts bundle to language; `TemplateNarrator` fallback |
| 5 | **Agent Bus** | Intent routing, session memory, multi-agent orchestration → `RunTrace` |
| 6 | **Presentation** | Analyst View · PM Report · Portfolio Leader · Chat · Email Digest |

**Determinism-first principle:** The LLM is a narrator only — it never computes a number. Every KPI value, trend, anomaly, and recommendation is produced by the deterministic engine before the LLM sees any data. `OutputValidator` rejects any LLM response containing a number not in the `InsightBundle`.

Full visual diagram → [architecture.html](https://puru-nayak-labs.github.io/compass/architecture.html)

---

## 10 Enterprise Data Concepts — All Implemented

Compass is architected around every foundational principle of enterprise-grade AI data platforms:

| Concept | How Compass Implements It |
|---|---|
| **Data Lineage** | Every number traces to its exact source row, column, and dataset version via `RunTrace.dataLineage[]` |
| **Ontology** | `MetricCatalog` declares formula, unit, and aliases for every KPI. `DimensionHierarchy` formalizes geo rollups |
| **Knowledge Graph** | `ISC_FORECAST_KB` encodes sales stage → forecast category → FLM judgment relationships |
| **Data Governance** | `SchemaRegistry` is the single source of truth. `AccuracyCheckpoint` cross-validates all totals before serving |
| **Observability** | `RunTrace` on every response: intent, filters, records scanned, confidence, latency, fallback flag |
| **Data Mesh** | `DomainConfig` pattern — each business unit owns its data product definition. Platform is the contract layer |
| **Data Catalog** | Every KPI, dimension, and source is registered and queryable via `/api/pm-meta` |
| **Provenance** | `DataSet.fetchedAt` + `DataSet.checksum` + `KpiSnapshot.lineage[]` — full reproducible audit trail |
| **Data Freshness** | `/api/data-info` returns staleness age and boolean gate; UI shows amber banner when threshold exceeded |
| **Deterministic AI** | LLM narrates only. `temperature=0`, `OutputValidator` enforces every number comes from the `InsightBundle` |

---

## Roadmap

| Phase | Status | What Was Built |
|---|---|---|
| Phase 0 — Product Definition | ✅ Done | KPI priority locked · personas defined · success criteria |
| Phase 1 — Working MVP | ✅ Done | KPI engine · 3 personas · chat · exec summary · PM report · Docker |
| Phase 1.5 — Knowledge Layer | ✅ Done | ISC Forecasting KB · sales stage objectives · FLM judgment |
| Phase 1.6 — Observability | ✅ Done | Per-run RunTrace · confidence badge · trace panel |
| Phase 2a — Enterprise Readiness | ✅ Done | KPI Targets + RAG · GTM $M impact · Correlation engine · Persistent memory · Freshness gate · Eval harness |
| Phase 2b — Platform Abstractions | ✅ Done | `DataConnector` · `InsightEngine` · `NarratorService` · RAG badges in UI · Staleness banner · 30 golden cases |
| Phase 3 — Decision Intelligence | 📋 Planned | Multi-agent Orchestrate routing · MBR/QBR auto-gen · `MemoryAgent` outcome tracking |
| Phase 4 — Multi-Domain Platform | 🔭 Future | `DomainConfig` registry · second business unit · open-source connector SDK |

---

## Run Locally

**Prerequisites:** Node.js 18+, npm 9+

```bash
git clone https://github.com/puru-nayak-labs/compass.git
cd compass
npm install
node server.js          # uses default data path
```

Open **http://localhost:3000** — hard refresh with `Ctrl + Shift + R` on first load.

To point at custom data: `DATA_DIR=/path/to/data node server.js`

The server expects two JSON dump files: `Pipeline_<date>.json` and `Revenue_<date>.json` — both in the shape `{ headers: [...], rows: [[...]] }`. Any xlsx-to-JSON converter works.

**Run the eval suite:**
```bash
npm test
```
Starts the server, runs 30 golden test cases, prints pass/fail, exits non-zero on < 95% pass rate.

---

## Tech Stack

Node.js 20 / Express 5 · Vanilla JS SPA · Chart.js 4 · IBM Carbon-inspired CSS · Docker (Node 20 Alpine) · No database — in-memory deterministic engine

---

## Platform Docs

| Doc | What's Inside |
|---|---|
| [Design Document](https://puru-nayak-labs.github.io/compass/) | 10-concept enterprise data blueprint · OOP interface catalogue · determinism-first AI pattern |
| [Architecture Diagram](https://puru-nayak-labs.github.io/compass/architecture.html) | Visual 7-layer diagram · data flow · interface contracts · Phase migration table |
| [Extension Guide](https://puru-nayak-labs.github.io/compass/contributing.html) | Step-by-step: add data source · KPI · domain · insight rule · LLM narrator · agent |

---

Built by **Puru Nayak** · [github.com/puru-nayak-labs](https://github.com/puru-nayak-labs) · IBM TLS · 2026
