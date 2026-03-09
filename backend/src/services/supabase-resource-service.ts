import type { PaginationInput } from "../types/api.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { HttpError } from "../lib/http-error.js";

export class SupabaseResourceService {
  async list(table: string, pagination: PaginationInput, filters: Record<string, string | undefined>) {
    let query = supabaseAdmin
      .from(table)
      .select(pagination.select, { count: "exact" })
      .order(pagination.orderBy, { ascending: pagination.ascending })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    for (const [key, value] of Object.entries(filters)) {
      if (!value) {
        continue;
      }

      query = query.eq(key, value);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new HttpError(400, `Failed to list ${table}`, error);
    }

    return {
      data: data ?? [],
      meta: {
        count: count ?? 0,
        limit: pagination.limit,
        offset: pagination.offset,
      },
    };
  }

  async getById(table: string, id: string, select = "*", idField = "id") {
    const { data, error } = await supabaseAdmin.from(table).select(select).eq(idField, id).single();

    if (error) {
      throw new HttpError(404, `${table} record not found`, error);
    }

    return data;
  }

  async create(table: string, payload: Record<string, unknown>, select = "*") {
    const { data, error } = await supabaseAdmin.from(table).insert(payload).select(select).single();

    if (error) {
      throw new HttpError(400, `Failed to create ${table}`, error);
    }

    return data;
  }

  async update(table: string, id: string, payload: Record<string, unknown>, select = "*", idField = "id") {
    const { data, error } = await supabaseAdmin
      .from(table)
      .update(payload)
      .eq(idField, id)
      .select(select)
      .single();

    if (error) {
      throw new HttpError(400, `Failed to update ${table}`, error);
    }

    return data;
  }

  async remove(table: string, id: string, idField = "id") {
    const { error } = await supabaseAdmin.from(table).delete().eq(idField, id);

    if (error) {
      throw new HttpError(400, `Failed to delete ${table}`, error);
    }

    return { success: true };
  }
}
