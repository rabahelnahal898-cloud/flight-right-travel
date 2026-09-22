import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { ZodError } from "zod";
import { handleStripeWebhook } from "./routes/payments";

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
app.use(cors({ origin: process.env["CORS_ORIGIN"]?.split(",").map((origin) => origin.trim()) || true }));
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
app.use(express.json());
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
