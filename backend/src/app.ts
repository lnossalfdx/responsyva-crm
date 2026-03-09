import cors from "cors";
import express from "express";
import { getCorsOrigins } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { crmRouter } from "./routes/crm-routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: getCorsOrigins(),
    }),
  );
  app.use(express.json({ limit: "10mb" }));

  app.use("/api", crmRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
