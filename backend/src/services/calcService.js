export function computeMetrics({ ttmBuybacksUSD, ttmDividendsUSD, employees, assumedSalaryUSD = 50000 }) {
  const total = (ttmBuybacksUSD || 0) + (ttmDividendsUSD || 0);
  const perEmployeeRaiseUSD = employees > 0 ? total / employees : null;
  const jobEquivalents = assumedSalaryUSD > 0 ? total / assumedSalaryUSD : null;

  return {
    totals: {
      buybacksUSD: ttmBuybacksUSD || 0,
      dividendsUSD: ttmDividendsUSD || 0,
      combinedUSD: total
    },
    employees: employees || null,
    perEmployeeRaiseUSD,
    jobEquivalents
  };
}

