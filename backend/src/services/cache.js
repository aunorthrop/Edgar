import fs from "node:fs";
import path from "node:path";
import { log } from "../utils/log.js";

const CACHE_DIR = process.env.CACHE_DIR || ".cache";
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const mem = new Map(); // in-memory for hot items

function filePath(key) {
  return path.join(CACHE_DIR, Buffer.from(key).toString("hex") + ".json");
}

export function getCache(key, maxAgeMs = 24 * 3600 * 1000) {
  const now = Date.now();
  // memory first
  const m = mem.get(key);
  if (m && now - m.time < maxAgeMs) return m.value;
  // disk next
  try {
    const p = filePath(key);
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, "utf-8"));
      if (now - data.time < maxAgeMs) {
        mem.set(key, data);
        return data.value;
      }
    }
  } catch {}
  return null;
}

export function setCache(key, value) {
  const rec = { time: Date.now(), value };
  mem.set(key, rec);
  try {
    fs.writeFileSync(filePath(key), JSON.stringify(rec), "utf-8");
  } catch (e) {
    log("cache write failed", key, e.message);
  }
}

