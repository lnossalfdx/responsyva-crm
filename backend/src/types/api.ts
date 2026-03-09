import { z } from "zod";

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  orderBy: z.string().min(1).default("created_at"),
  ascending: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((value) => value === true || value === "true")
    .default(true),
  select: z.string().min(1).default("*"),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
