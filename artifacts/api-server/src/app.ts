import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { ZodError } from "zod";
import { handleStripeWebhook } from "./routes/payments";

const repairMalformedJson = (raw: string): unknown => {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed);
  } catch {
    // Fall through to recover object-literal payloads like {from:AMS,to:DXB,...}
  }

  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return undefined;
  }

  const normalized = trimmed
    .replace(/([{,]\s*)([A-Za-z0-9_$]+)\s*:/g, '$1"$2":')
    .replace(/:\s*([A-Za-z_][A-Za-z0-9_./+-]*)(?=\s*(?:,|}|\]))/g, (match, value) => {
      if (["true", "false", "null"].includes(value)) return `:${value}`;
      if (/^-?\d+(?:\.\d+)?$/.test(value)) return `:${value}`;
      return `:"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    });

  try {
    return JSON.parse(normalized);
  } catch {
    return undefined;
  }
};

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const allowedOrigins = (process.env["CORS_ORIGIN"] || "http://localhost:4174,https://localhost:4174,https://www.flightrighttravel.international,https://flight-right-platform.vercel.app")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

app.use((req, _res, next) => {
  const contentType = req.headers["content-type"];
  if (!contentType || !contentType.includes("application/json")) {
    return next();
  }

  const chunks: Buffer[] = [];

  req.on("data", (chunk) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  });

  req.on("end", () => {
    const raw = Buffer.concat(chunks).toString("utf8").trim();

    if (!raw) {
      req.body = undefined;
      return next();
    }

    try {
      req.body = JSON.parse(raw);
      return next();
    } catch {
      const repaired = repairMalformedJson(raw);
      if (repaired === undefined) {
        const error = new SyntaxError("Invalid JSON body");
        (error as Error & { status?: number }).status = 400;
        return next(error);
      }

      req.body = repaired;
      return next();
    }
  });

  req.on("error", next);
});
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: "Invalid request", code: "VALIDATION_ERROR", details: error.flatten() });
  }
  logger.error({ err: error }, "Unhandled API error");
  return res.status(500).json({ error: "Internal server error", code: "INTERNAL_ERROR" });
});

export default app;
