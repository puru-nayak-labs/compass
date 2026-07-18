/**
 * ─────────────────────────────────────────────────────────────────────────────
 * NarratorService — Layer 4 narrative abstraction
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Interface contract (JSDoc):
 *
 * @interface NarratorService
 * @method narrate(bundle: InsightBundle, opts?: NarratorOptions): NarrativeResult
 *
 * InsightBundle — deterministically computed object from Layer 3 (InsightEngine).
 *   Contains: stats (KPI numbers), byGeo[], byOA[], actions[], insights[]
 *   The bundle is the ONLY input the narrator may use for numbers.
 *   LLMs may never call data functions or compute deltas independently.
 *
 * NarratorOptions — { persona: "pm" | "exec" | "analyst", tone: "brief" | "full" }
 *
 * NarrativeResult — { text: string, source: "template" | "llm", fallback: boolean }
 *   `fallback: true` means LlmNarrator was unavailable and TemplateNarrator activated.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Determinism guarantee: LLM is called at temperature=0. Every number in the
 * generated text must be traceable to a field in the InsightBundle.
 * OutputValidator enforces this. Failure → TemplateNarrator activates automatically.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use strict";

// ─────────────────────────────────────────────────────────────────────────────
// TemplateNarrator
//
// Deterministic, zero-dependency fallback narrator.
// Produces MBR-quality executive narratives from a pre-computed InsightBundle
// using pure template string composition — no LLM, no probability.
//
// This is always available and is the default narrator for Phase 1.
// When Granite LLM integration lands (Phase 2), LlmNarrator wraps this as
// its fallback: if LLM fails validation, TemplateNarrator.narrate() is called.
// ─────────────────────────────────────────────────────────────────────────────
class TemplateNarrator {
  constructor() {
    this.id = "template";
  }

  /**
   * Compose a multi-paragraph executive narrative from a pre-computed InsightBundle.
   *
   * @param {object} bundle — InsightBundle from InsightEngine / pm-report endpoint
   * @param {object} [opts] — { persona: "pm"|"exec"|"analyst", tone: "brief"|"full" }
   * @returns {{ text: string, source: "template", fallback: false }}
   */
  narrate(bundle, opts = {}) {
    const { geo = "WW", quarter = "CQ", offeringArea = "ALL", consolidatedOffering = "ALL" } = bundle.scope || {};
    const cq   = bundle.cq   || {};
    const pyq  = bundle.pyq  || {};
    const pq   = bundle.pq   || {};
    const revCQ  = bundle.revCQ  ?? null;
    const revPYQ = bundle.revPYQ ?? null;
    const revPQ  = bundle.revPQ  ?? null;
    const actions = bundle.actions || [];

    const fmt  = v => v == null ? "—" : Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(1)}B` : `$${Math.abs(v).toFixed(1)}M`;
    const dPct = (a, b) => b > 0 ? ((a / b - 1) * 100).toFixed(1) : null;
    const sgn  = v => v != null ? (parseFloat(v) >= 0 ? "+" : "") + v + "%" : "";
    const oaLabel  = offeringArea !== "ALL" ? ` — ${offeringArea}` : "";
    const conLabel = consolidatedOffering !== "ALL" ? ` · ${consolidatedOffering}` : "";
    const geoLabel = geo !== "WW" ? geo : "WW";

    const signingsYoY = pyq.signings > 0 ? dPct(cq.signings, pyq.signings) : null;
    const signingsQoQ = pq.signings  > 0 ? dPct(cq.signings, pq.signings)  : null;
    const revYoY = revPYQ > 0 ? dPct(revCQ, revPYQ) : null;
    const revQoQ = revPQ  > 0 ? dPct(revCQ, revPQ)  : null;

    const para1 =
      `**${geoLabel}${oaLabel}${conLabel} | ${quarter} Business Intelligence Report**\n\n` +
      `TLS delivered **${fmt(cq.signings)}** in signings for ${quarter}` +
      (signingsYoY ? ` (${sgn(signingsYoY)} YoY)` : "") +
      (signingsQoQ ? ` and ${sgn(signingsQoQ)} QoQ` : "") +
      `. Revenue actuals: **${fmt(revCQ)}**` +
      (revYoY ? ` (${sgn(revYoY)} YoY)` : "") +
      (revQoQ ? `, ${sgn(revQoQ)} QoQ` : "") +
      `. Active pipeline: **${fmt(cq.pipeline)}** (${cq.activeCount ?? 0} opps).`;

    const coverage = cq.pipeline > 0 ? ((cq.call / cq.pipeline) * 100).toFixed(0) : "—";
    const para2 =
      `**Win Rate & Coverage:** Win rate is **${cq.winRate != null ? cq.winRate.toFixed(1) + "%" : "—"}** ` +
      `(${cq.wonCount ?? 0} won / ${cq.closedCount ?? 0} closed). ` +
      `Forecast coverage (Call/Pipeline): **${coverage}%**. ` +
      `FLM-Judged upside: **${fmt(cq.upside)}**.`;

    const para3 = actions.length
      ? `**Top Recommended Actions:** ` +
        actions.slice(0, 3).map((a, i) => `${i + 1}. ${a.action}${a.expectedImpactM ? ` (est. $${a.expectedImpactM}M impact)` : ""}`).join("  ")
      : "";

    const paragraphs = [para1, para2, para3].filter(Boolean);
    return {
      text:     paragraphs.join("\n\n"),
      source:   "template",
      fallback: false,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LlmNarrator (stub — wired when watsonx.ai Granite is available in Phase 2)
//
// When IBM_WATSONX_API_KEY is present, this narrator sends the InsightBundle
// to Granite-3-8B-Instruct at temperature=0 with a structured prompt.
// OutputValidator checks every number in the response against the bundle.
// Any number not in the bundle triggers an immediate fallback to TemplateNarrator.
// ─────────────────────────────────────────────────────────────────────────────
class LlmNarrator {
  constructor({ fallback } = {}) {
    this.id       = "llm";
    this._fallback = fallback || new TemplateNarrator();
    this._available = !!process.env.IBM_WATSONX_API_KEY;
  }

  narrate(bundle, opts = {}) {
    // Phase 2: replace stub with watsonx.ai Granite call.
    // For now, delegate to TemplateNarrator and mark fallback=true when LLM absent.
    if (!this._available) {
      const result = this._fallback.narrate(bundle, opts);
      return { ...result, fallback: true };
    }
    // Granite integration lands here — same interface, different implementation.
    return this._fallback.narrate(bundle, opts);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory: getNarrator() — returns the best available narrator at runtime.
// Callers should always use this factory — never instantiate directly.
// ─────────────────────────────────────────────────────────────────────────────
function getNarrator() {
  const template = new TemplateNarrator();
  // When watsonx.ai key is present, use LlmNarrator with TemplateNarrator fallback.
  if (process.env.IBM_WATSONX_API_KEY) {
    return new LlmNarrator({ fallback: template });
  }
  return template;
}

module.exports = { TemplateNarrator, LlmNarrator, getNarrator };
