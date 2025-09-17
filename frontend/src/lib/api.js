const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function searchCompanies(q) {
  const res = await fetch(`${API}/api/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

export async function getSummary(symbol, salary = 50000) {
  const res = await fetch(`${API}/api/company/${encodeURIComponent(symbol)}/summary?salary=${salary}`);
  if (!res.ok) throw new Error(`Summary failed: ${res.status}`);
  return res.json();
}

