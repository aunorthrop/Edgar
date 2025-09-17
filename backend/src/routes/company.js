import { Router } from "express";
import { getCIKForTicker, getCompanyFacts, normalizeTicker } from "../services/secClient.js";
import { sumTTMUSD, pickLatestCount } from "../services/factsService.js";
import { computeMetrics } from "../services/calcService.js";

const router = Router();

// GET /api/company/AAPL/summary?salary=60000
router.get("/:symbol/summary", async (req, res) => {
  try {
    const symbol = normalizeTicker(req.params.symbol);
    const assumedSalaryUSD = Number(req.query.salary || 50000);

    const cik = await getCIKForTicker(symbol);
    if (!cik) return res.status(404).json({ error: `Unknown ticker: ${symbol}` });

    const facts = await getCompanyFacts(cik);

    const { totalUSD: ttmBuybacksUSD, tag: buyTag } = sumTTMUSD(facts, [
      "us-gaap:PaymentsForRepurchaseOfCommonStock",
      "us-gaap:PaymentsForRepurchaseOfEquity",
      "us-gaap:StockRepurchasedDuringPeriodValue",
      "us-gaap:RepurchaseOfCommonStock",
    ]);

    const { totalUSD: ttmDividendsUSD, tag: divTag } = sumTTMUSD(facts, [
      "us-gaap:PaymentsOfDividends",
      "us-gaap:DividendsPaid",
      "us-gaap:CommonStockDividendsPaid",
    ]);

    const latestEmp = pickLatestCount(facts);

    const metrics = computeMetrics({
      ttmBuybacksUSD,
      ttmDividendsUSD,
      employees: latestEmp?.val || null,
      assumedSalaryUSD
    });

    res.json({
      ticker: symbol,
      cik,
      tagsUsed: { buybacks: buyTag, dividends: divTag, employees: latestEmp?.tag || null },
      latestEmployeeObservation: latestEmp
        ? { value: latestEmp.val, end: latestEmp.end, unit: latestEmp.unit }
        : null,
      metrics
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

