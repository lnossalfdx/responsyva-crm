import type { Request, Response } from "express";
import { getDashboardPayload } from "../services/dashboard-service.js";

export async function getDashboard(_request: Request, response: Response) {
  const payload = await getDashboardPayload();
  return response.json(payload);
}

export function getHealth(_request: Request, response: Response) {
  return response.json({
    service: "responsyva-crm-ai-api",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
