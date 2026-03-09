import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { login, me, createAuthUser } from "../controllers/auth-controller.js";
import { authenticateRequest } from "../middleware/authenticate-request.js";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(login));
authRouter.get("/me", authenticateRequest, asyncHandler(me));
authRouter.post("/users", authenticateRequest, asyncHandler(createAuthUser));
