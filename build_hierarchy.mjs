import { readFileSync, writeFileSync } from "fs";
const { rows, headers } = JSON.parse(readFileSync(".bob/tmp/xlsx-dumps/TLS Pipeline Data - 20260704-c6a80369c36cd502/Data.json","utf8"));
const idx = Object.fromEntries(headers.map((h,i)=>[h,i]));
const s = (r,c) => String(r[idx[c]]||"").trim();
const n = (r,c) => parseFloat(r[idx[c]])||0;

// Geo → Market → Country hierarchy
const hier = {};
for (const r of rows) {
  const geo=s(r,"Geography Name"),mkt=s(r,"Market Name"),cty=s(r,"Country Name");
  if (!geo||geo==="Unassigned") continue;
  if (!hier[geo]) hier[geo]={};
  if (mkt) { if (!hier[geo][mkt]) hier[geo][mkt]=new Set(); if(cty) hier[geo][mkt].add(cty); }
}
const out={};
for (const [g,ms] of Object.entries(hier)) {
  out[g]={};
  for (const [m,cs] of Object.entries(ms)) out[g][m]=[...cs].filter(Boolean).sort();
}
writeFileSync("public/hierarchy.json", JSON.stringify(out));
console.log("Hierarchy written. Geos:", Object.keys(out));
for (const [g,ms] of Object.entries(out)) console.log(" ",g,"->",Object.keys(ms).join(", "));

// YoY / QoQ for KPI card reference
const agg = (qtr) => {
  let sig=0,pipe=0,won=0,lost=0;
  for (const r of rows) {
    if (s(r,"Quarter In Year")!==qtr) continue;
    sig+=n(r,"Won $M"); pipe+=n(r,"Oppty Value");
    const st=s(r,"ISC Sales Stage Name");
    if(st==="Won") won++; if(st==="Lost") lost++;
  }
  return { sig:+sig.toFixed(2), pipe:+pipe.toFixed(2), wr:won+lost>0?+(won/(won+lost)*100).toFixed(1):0, won, lost };
};
const cq=agg("2Q26"),pyq=agg("2Q25"),pq=agg("1Q26");
console.log("\n2Q26:",cq);
console.log("2Q25:",pyq);
console.log("1Q26:",pq);
console.log("Signings YoY (2Q26 vs 2Q25):", +((cq.sig/pyq.sig-1)*100).toFixed(1)+"%");
console.log("Pipeline QoQ (2Q26 vs 1Q26):", +((cq.pipe/pq.pipe-1)*100).toFixed(1)+"%");
console.log("WinRate pts YoY:",+(cq.wr-pyq.wr).toFixed(1)+"pts");
