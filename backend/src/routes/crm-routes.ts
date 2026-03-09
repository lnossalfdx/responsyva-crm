import { Router } from "express";
import { getDashboard, getHealth } from "../controllers/dashboard-controller.js";
import { authenticateRequest } from "../middleware/authenticate-request.js";
import { authRouter } from "./auth-routes.js";
import { resourceRouter } from "./resource-routes.js";

export const crmRouter = Router();

crmRouter.get("/health", getHealth);
crmRouter.use("/auth", authRouter);
crmRouter.get("/dashboard", authenticateRequest, getDashboard);
crmRouter.use("/", authenticateRequest, resourceRouter);
