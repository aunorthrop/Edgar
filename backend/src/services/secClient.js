import { setCache, getCache } from "./cache.js";
import { log } from "../utils/log.js";

const SEC_ROOT = "https://data.sec.gov";
const SEC_FILES = "https://www.sec.gov/files";

const UA = process.env.SEC_USER_AGENT || "CorpInsights (contact: your-email@example.com)";

async function fetchJson(url, { cacheKey, maxAgeMs = 24*3600*1000 } = {}) {
  if (cacheKey) {
    const cached = getCache(cacheKey, maxAgeMs);
    if (cached) return cached;
  }
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept": "application/json"
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SEC fetch ${res.status} for ${url}: ${text.slice(0,200)}`);
  }
  const json = await res.json();
  if (cacheKey) setCache(cacheKey, json);
  return json;
}

// Load (and cache) the official ticker→CIK mapping from SEC once per day
export async function getTickerTable() {
  const url = `${SEC_FILES}/company_tickers.json`;
  return await fetchJson(url, { cacheKey: "company_tickers.json", maxAgeMs: 24*3600*1000 });
}

export function normalizeTicker(t) {
  return (t || "").trim().toUpperCase();
}

// Returns 10-digit CIK string or null
export async function getCIKForTicker(ticker) {
  const table = await getTickerTable();
  const norm = normalizeTicker(ticker);
  for (const k of Object.keys(table)) {
    const row = table[k];
    if (row.ticker.toUpperCase() === norm) {
      return String(row.cik_str).padStart(10, "0");
    }
  }
  return null;
}

export async function getCompanyFacts(cik10) {
  const url = `${SEC_ROOT}/api/xbrl/companyfacts/CIK${cik10}.json`;
  return await fetchJson(url, { cacheKey: `facts_${cik10}`, maxAgeMs: 6*3600*1000 });
}

export async function searchTickers(query, limit = 20) {
  const table = await getTickerTable();
  const q = (query || "").trim().toLowerCase();
  const rows = Object.values(table)
    .filter(r =>
      r.ticker.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q))
    .slice(0, limit)
    .map(r => ({
      ticker: r.ticker,
      name: r.title,
      cik: String(r.cik_str).padStart(10, "0")
    }));
  return rows;
}

log("SEC client ready");

