import { Router } from "express";
import { getDashboard, getHealth } from "../controllers/dashboard-controller.js";
import { resourceRouter } from "./resource-routes.js";

export const crmRouter = Router();

crmRouter.get("/health", getHealth);
crmRouter.get("/dashboard", getDashboard);
crmRouter.use("/", resourceRouter);
