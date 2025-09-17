import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { log } from "./utils/log.js";
import searchRouter from "./routes/search.js";
import companyRouter from "./routes/company.js";

const app = express();

const origins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map(s => s.trim());

app.use(cors({
  origin: origins,
  credentials: false
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api/search", searchRouter);
app.use("/api/company", companyRouter);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => log(`Server listening on http://localhost:${PORT} (CORS origins: ${origins.join(", ")})`));

