import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../lib/http-error.js";
import { AuthService } from "../services/auth-service.js";

const authService = new AuthService();

function getBearerToken(request: Request) {
  const header = request.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim();
}

export async function authenticateRequest(request: Request, _response: Response, next: NextFunction) {
  const token = getBearerToken(request);

  if (!token) {
    return next(new HttpError(401, "Sessão não enviada."));
  }

  try {
    const payload = authService.verifyToken(token);
    request.currentUser = await authService.getAuthenticatedUser(payload.sub);
    return next();
  } catch (error) {
    return next(error);
  }
}
