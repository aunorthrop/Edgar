import { warn } from "../utils/log.js";

// Candidate tags for buybacks (value in USD)
const BUYBACK_TAGS = [
  "us-gaap:PaymentsForRepurchaseOfCommonStock",
  "us-gaap:PaymentsForRepurchaseOfEquity",
  "us-gaap:StockRepurchasedDuringPeriodValue", // sometimes used
  "us-gaap:RepurchaseOfCommonStock",
];

// Candidate tags for dividends (value in USD)
const DIVIDEND_TAGS = [
  "us-gaap:PaymentsOfDividends",
  "us-gaap:DividendsPaid", // legacy
  "us-gaap:CommonStockDividendsPaid",
];

// Candidate tags for employee count (unit usually "pure" or a count)
const EMPLOYEE_TAGS = [
  "us-gaap:NumberOfEmployees",
  "dei:EntityNumberOfEmployees",  // some filers
  "us-gaap:Employees"             // rare / legacy
];

// Extract unit series (array of {val, end, fy, fp}) from facts[tag]
function collectSeries(tagObj) {
  if (!tagObj?.units) return [];
  const out = [];
  for (const [unit, arr] of Object.entries(tagObj.units)) {
    for (const obs of arr) {
      if (obs?.val != null && obs?.end) {
        out.push({ unit, val: Number(obs.val), end: obs.end, fy: obs.fy, fp: obs.fp });
      }
    }
  }
  return out.sort((a,b) => new Date(b.end) - new Date(a.end)); // newest first
}

export function pickLatestCount(facts, tags = EMPLOYEE_TAGS) {
  for (const tag of tags) {
    const [ns, key] = tag.split(":");
    const obj = facts?.facts?.[ns]?.[key];
    if (!obj) continue;
    const series = collectSeries(obj)
      .filter(s => isFinite(s.val) && s.val > 0);
    if (series.length) return { tag, ...series[0] };
  }
  return null;
}

export function sumTTMUSD(facts, tags) {
  const endLimit = Date.now() - 365 * 24 * 3600 * 1000; // TTM
  let usedTag = null;
  let total = 0;

  for (const tag of tags) {
    const [ns, key] = tag.split(":");
    const obj = facts?.facts?.[ns]?.[key];
    if (!obj) continue;

    const series = collectSeries(obj).filter(s => s.unit === "USD");
    if (!series.length) continue;

    // Sum values for observations with end date within 365 days
    const t = series
      .filter(s => new Date(s.end).getTime() >= endLimit)
      .reduce((acc, s) => acc + (isFinite(s.val) ? s.val : 0), 0);

    if (t > 0) {
      usedTag = tag;
      total = t;
      break; // prefer first tag with data
    }
  }
  return { totalUSD: total, tag: usedTag };
}

export function latestUSD(facts, tags) {
  for (const tag of tags) {
    const [ns, key] = tag.split(":");
    const obj = facts?.facts?.[ns]?.[key];
    if (!obj) continue;
    const series = collectSeries(obj).filter(s => s.unit === "USD");
    if (series.length) return { tag, ...series[0] };
  }
  return null;
}

