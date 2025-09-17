import { Router } from "express";
import { searchTickers } from "../services/secClient.js";

const router = Router();

// GET /api/search?q=apple
router.get("/", async (req, res) => {
  try {
    const q = String(req.query.q || "");
    if (!q) return res.json({ results: [] });
    const results = await searchTickers(q, 20);
    res.json({ results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

