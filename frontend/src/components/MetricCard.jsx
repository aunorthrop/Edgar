import React from "react";

function fmtUSD(n) {
  if (n == null) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function fmtNum(n) {
  if (n == null) return "—";
  return Math.round(n).toLocaleString();
}

export default function MetricCard({ title, value, sub }) {
  return (
    <div style={{
      padding: 16,
      border: "1px solid #e6e6e6",
      borderRadius: 12,
      background: "white",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
    }}>
      <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export { fmtUSD, fmtNum };

