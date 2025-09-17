import React, { useMemo, useState } from "react";
import MetricCard, { fmtUSD, fmtNum } from "../components/MetricCard.jsx";
import { getSummary } from "../lib/api.js";

export default function Dashboard({ picked }) {
  const [salary, setSalary] = useState(50000);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const symbol = picked?.ticker;

  async function load() {
    if (!symbol) return;
    setLoading(true);
    try {
      const json = await getSummary(symbol, salary);
      setData(json);
    } catch (e) {
      console.error(e);
      setData({ error: e.message });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, salary]);

  if (!

