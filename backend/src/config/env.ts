import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  CORS_ORIGIN: z.string().default("*"),
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().optional(),
  JWT_SECRET: z.string().min(32),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Backend environment is invalid.");
}

export const env = parsed.data;

export function getCorsOrigins() {
  if (env.CORS_ORIGIN === "*") {
    return "*";
  }

  return env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
