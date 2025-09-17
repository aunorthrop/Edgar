import React, { useState } from "react";

export default function SearchBar({ onPick }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  async function doSearch(e) {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setOptions([]);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setOptions(json.results || []);
    } catch (err) {
      console.error(err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "16px auto" }}>
      <form onSubmit={doSearch} style={{ display: "flex", gap: 8 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search company or ticker (e.g., Apple or AAPL)"
          style={{ flex: 1, padding: "12px", fontSize: 16 }}
        />
        <button type="submit" style={{ padding: "12px 16px", fontSize: 16 }}>Search</button>
      </form>
      {loading && <div style={{ marginTop: 12 }}>Searching…</div>}
      {options.length > 0 && (
        <div style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          {options.map(opt => (
            <button
              key={opt.cik + opt.ticker}
              onClick={() => onPick(opt)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                borderBottom: "1px solid #eee",
                background: "white",
                cursor: "pointer"
              }}
            >
              <strong>{opt.ticker}</strong> — {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

