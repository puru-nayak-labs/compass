/**
 * ─────────────────────────────────────────────────────────────────────────────
 * InsightEngine — Layer 3 intelligence abstraction
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Interface contract (JSDoc):
 *
 * @interface InsightEngine
 * @method analyse(snapshot: KpiSnapshot): InsightBundle
 *
 * KpiSnapshot — deterministically computed KPI data from Layer 2 (KPI Engine).
 *   Shape: { cq, pyq, pq, byGeo, byOA, topAccounts, revCQ, revPYQ, revPQ, ... }
 *
 * InsightBundle — typed, deterministic output.
 *   Shape: { highlights: Insight[], focus: Insight[], actions: Insight[], ... }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Determinism guarantee: InsightEngine uses only rule-based logic.
 * No probabilistic models, no LLM calls, no random state.
 * Given the same KpiSnapshot, InsightEngine.analyse() always returns the same bundle.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use strict";

// ─────────────────────────────────────────────────────────────────────────────
// InsightEngine — default rule-based implementation.
//
// Processes a KpiSnapshot and produces:
//   highlights[] — positive signals (momentum, wins, coverage health)
//   focus[]      — risk signals (YoY declines, low WR, stalled pipeline)
//   actions[]    — ranked GTM recommendations with $M impact estimates
//
// Each Insight: { icon: string, text: string, priority?: "HIGH"|"MED"|"LOW" }
// ─────────────────────────────────────────────────────────────────────────────
class InsightEngine {
  constructor() {
    this.id = "default";
  }

  /**
   * Analyse a KpiSnapshot and produce a typed InsightBundle.
   *
   * @param {object} snap — KpiSnapshot from the KPI Engine
   * @returns {{ highlights: object[], focus: object[], actions: object[] }}
   */
  analyse(snap) {
    const highlights = [];
    const focus      = [];
    const actions    = [];

    const { cq = {}, pyq = {}, pq = {}, byGeo = [], byOA = [],
            revCQ = 0, revPYQ = 0, revPQ = 0, quarter = "CQ", geo = "WW" } = snap;

    const fmt   = v => v == null ? "—" : Math.abs(v) >= 1000 ? `$${(v/1000).toFixed(1)}B` : `$${Math.abs(v).toFixed(1)}M`;
    const dPct  = (a, b) => b > 0 ? +((a / b - 1) * 100).toFixed(1) : null;
    const sgn   = v => v != null ? (v >= 0 ? "+" : "") + v.toFixed(1) + "%" : "";

    const sigYoY = dPct(cq.signings, pyq.signings);
    const sigQoQ = dPct(cq.signings, pq.signings);
    const revYoY = dPct(revCQ, revPYQ);
    const revQoQ = dPct(revCQ, revPQ);

    // ── Highlights ─────────────────────────────────────────────────────────

    if (sigYoY != null && sigYoY > 10)
      highlights.push({ icon: "📈", text: `Signings ${sgn(sigYoY)} YoY — ${fmt(cq.signings)} vs ${fmt(pyq.signings)} prior year. Strong momentum; maintain focus on pipeline velocity.` });

    if (cq.winRate != null && cq.winRate >= 60)
      highlights.push({ icon: "🏆", text: `Win rate of ${cq.winRate.toFixed(1)}% is healthy (>60% target). ${cq.wonCount} deals closed won. Capture and replicate winning patterns.` });

    if (revYoY != null && revYoY > 5)
      highlights.push({ icon: "💹", text: `Revenue actuals ${sgn(revYoY)} YoY — ${fmt(revCQ)} vs ${fmt(revPYQ)} PY. Revenue-to-signings conversion is tracking well.` });

    const coverage = cq.pipeline > 0 && cq.call > 0 ? (cq.call / cq.pipeline * 100) : null;
    if (coverage != null && coverage >= 70)
      highlights.push({ icon: "✅", text: `Forecast coverage at ${coverage.toFixed(0)}% — healthy. ${fmt(cq.call)} in committed Call vs ${fmt(cq.pipeline)} pipeline.` });

    const topGeo = [...byGeo].sort((a, b) => (b.signings || 0) - (a.signings || 0))[0];
    if (topGeo && topGeo.sigYoY != null && topGeo.sigYoY > 15)
      highlights.push({ icon: "🚀", text: `${topGeo.geo} is the momentum leader: signings ${sgn(topGeo.sigYoY)} YoY at ${fmt(topGeo.signings)}. Prioritise resource allocation.` });

    // ── Focus areas (risk signals) ────────────────────────────────────────

    if (sigYoY != null && sigYoY < -10)
      focus.push({ icon: "⚠️", text: `Signings down ${Math.abs(sigYoY).toFixed(1)}% YoY — ${fmt(cq.signings)} vs ${fmt(pyq.signings)} PY. Pipeline recovery plan required urgently.` });

    if (cq.winRate != null && cq.winRate < 45)
      focus.push({ icon: "📉", text: `Win rate at ${cq.winRate.toFixed(1)}% — critically below 45%. ${cq.lostCount} deals lost. Run competitive deal review and seller coaching immediately.` });

    if (revYoY != null && revYoY < -10)
      focus.push({ icon: "🔴", text: `Revenue actuals down ${Math.abs(revYoY).toFixed(1)}% YoY — ${fmt(revCQ)} vs ${fmt(revPYQ)} PY. Investigate recognition delays and pull-in opportunities.` });

    if (coverage != null && coverage < 50)
      focus.push({ icon: "⚡", text: `Forecast coverage at ${coverage.toFixed(0)}% — below 50% threshold. Risk of quarter end shortfall. Pull Best Case opps into commit immediately.` });

    const worstGeo = [...byGeo].filter(g => g.winRate != null).sort((a, b) => a.winRate - b.winRate)[0];
    if (worstGeo && worstGeo.winRate < 40)
      focus.push({ icon: "🔧", text: `${worstGeo.geo} win rate at ${worstGeo.winRate.toFixed(1)}% — immediate FLM deal intervention and competitive playbook deployment required.` });

    const declinerOA = byOA.filter(r => r.sigYoY != null && r.sigYoY < -15).slice(0, 2);
    if (declinerOA.length)
      focus.push({ icon: "📋", text: `${declinerOA.map(r => r.oa).join(", ")} declining >15% YoY in signings. Review offer packaging, pricing, and partner ecosystem.` });

    // ── Recommended actions ───────────────────────────────────────────────

    if (worstGeo && worstGeo.winRate < 50) {
      const impM = +(worstGeo.pipeline * (55 - worstGeo.winRate) / 100 * 0.3).toFixed(1);
      actions.push({
        icon: "🎯",
        text: `Run deal coaching workshop for ${worstGeo.geo} — ${worstGeo.winRate.toFixed(1)}% WR. Target: lift to 55%+ by end of ${quarter}. Est. impact: $${impM > 0 ? impM : "—"}M.`,
        priority: "HIGH",
      });
    }

    if (sigYoY != null && sigYoY < -10) {
      const impM = +(cq.signings * Math.abs(sigYoY) / 100).toFixed(1);
      actions.push({
        icon: "⚡",
        text: `Engage SDE and partner teams to identify ${geo} pull-in opportunities. Signings ${sgn(sigYoY)} YoY. Recovery target: ${fmt(pyq.signings)}. Est. recovery: $${impM}M.`,
        priority: "HIGH",
      });
    }

    if (coverage != null && coverage < 60) {
      const bcPipe = snap.bcPipeline || 0;
      const impM = +(bcPipe * 0.20).toFixed(1);
      actions.push({
        icon: "📊",
        text: `Coverage at ${coverage.toFixed(0)}% — below target. Pull Best Case opps into commit; target 70% coverage by week 10 of ${quarter}. Est. upside: $${impM > 0 ? impM : "—"}M.`,
        priority: "MED",
      });
    }

    // Default action if no specific signals
    if (!actions.length)
      actions.push({
        icon: "🔍",
        text: `Maintain execution cadence. Review top-10 stalled opportunities weekly with FLMs. Focus on pipeline conversion in ${geo} for ${quarter}.`,
        priority: "LOW",
      });

    return { highlights, focus, actions };
  }
}

module.exports = { InsightEngine };
