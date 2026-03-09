import type { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth-service.js";

const authService = new AuthService();

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const createUserSchema = z.object({
  full_name: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(8),
  role: z.string().trim().min(1),
  status: z.string().trim().min(1).default("Ativo"),
  department: z.string().trim().optional().nullable(),
  avatar_url: z.string().trim().optional().nullable(),
});

export async function login(request: Request, response: Response) {
  const payload = loginSchema.parse(request.body);
  const session = await authService.login(payload.email, payload.password);
  return response.json(session);
}

export async function me(request: Request, response: Response) {
  return response.json({
    user: request.currentUser,
  });
}

export async function createAuthUser(request: Request, response: Response) {
  const payload = createUserSchema.parse(request.body);
  const user = await authService.createUser(payload);
  return response.status(201).json(user);
}
