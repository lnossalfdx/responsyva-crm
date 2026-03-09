import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../lib/http-error.js";
import { supabaseAdmin } from "../lib/supabase.js";
import type { AuthenticatedUser } from "../types/auth.js";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status?: string | null;
  department?: string | null;
  password_hash?: string | null;
};

function mapAuthenticatedUser(user: UserRow): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name,
    status: user.status || "Ativo",
    department: user.department || null,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export class AuthService {
  async getUserByEmail(email: string) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email, role, status, department, password_hash")
      .ilike("email", normalizeEmail(email))
      .limit(1)
      .maybeSingle<UserRow>();

    if (error) {
      throw new HttpError(400, "Failed to load user.", error);
    }

    return data;
  }

  async getUserById(id: string) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, full_name, email, role, status, department, password_hash")
      .eq("id", id)
      .maybeSingle<UserRow>();

    if (error) {
      throw new HttpError(400, "Failed to load user.", error);
    }

    return data;
  }

  createToken(user: UserRow) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    );
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string; role: string };
    } catch {
      throw new HttpError(401, "Sessão inválida.");
    }
  }

  async login(email: string, password: string) {
    const user = await this.getUserByEmail(email);

    if (!user || !user.password_hash) {
      throw new HttpError(401, "Credenciais inválidas.");
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new HttpError(401, "Credenciais inválidas.");
    }

    if ((user.status || "Ativo") !== "Ativo") {
      throw new HttpError(403, "Usuário sem acesso ativo.");
    }

    return {
      token: this.createToken(user),
      user: mapAuthenticatedUser(user),
    };
  }

  async getAuthenticatedUser(userId: string) {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new HttpError(401, "Usuário da sessão não encontrado.");
    }

    return mapAuthenticatedUser(user);
  }

  async createUser(input: {
    full_name: string;
    email: string;
    password: string;
    role: string;
    status: string;
    department?: string | null;
    avatar_url?: string | null;
  }) {
    const existing = await this.getUserByEmail(input.email);

    if (existing) {
      throw new HttpError(409, "Já existe um usuário com este email.");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        full_name: input.full_name,
        email: normalizeEmail(input.email),
        password_hash: passwordHash,
        role: input.role,
        status: input.status,
        department: input.department || null,
        avatar_url: input.avatar_url || null,
      })
      .select("id, full_name, email, role, status, department")
      .single<UserRow>();

    if (error) {
      throw new HttpError(400, "Falha ao criar usuário.", error);
    }

    return mapAuthenticatedUser(data);
  }
}
