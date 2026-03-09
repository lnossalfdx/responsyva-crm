import type { Request, Response } from "express";
import { z } from "zod";
import type { ResourceName } from "../resources.js";
import { resourceConfigs } from "../resources.js";
import { paginationSchema } from "../types/api.js";
import { SupabaseResourceService } from "../services/supabase-resource-service.js";

const service = new SupabaseResourceService();

function getResourceConfig(resourceName: ResourceName) {
  return resourceConfigs[resourceName];
}

export async function listResources(request: Request, response: Response) {
  const resourceName = request.params.resource as ResourceName;
  const config = getResourceConfig(resourceName);
  const pagination = paginationSchema.parse({
    ...request.query,
    orderBy: request.query.orderBy ?? config.defaultOrderBy ?? "created_at",
  });
  const filters = Object.fromEntries(
    Object.entries(request.query).filter(([key]) => !["limit", "offset", "orderBy", "ascending", "select"].includes(key)),
  ) as Record<string, string | undefined>;

  const payload = await service.list(config.table, pagination, filters);
  return response.json(payload);
}

export async function getResourceById(request: Request, response: Response) {
  const resourceName = request.params.resource as ResourceName;
  const config = getResourceConfig(resourceName);
  const recordId = z.string().min(1).parse(request.params.id);
  const select = z.string().min(1).catch("*").parse(request.query.select);
  const payload = await service.getById(config.table, recordId, select, config.idField);
  return response.json(payload);
}

export async function createResource(request: Request, response: Response) {
  const resourceName = request.params.resource as ResourceName;
  const config = getResourceConfig(resourceName);
  const payload = config.createSchema.parse(request.body) as Record<string, unknown>;
  const created = await service.create(config.table, payload);
  return response.status(201).json(created);
}

export async function updateResource(request: Request, response: Response) {
  const resourceName = request.params.resource as ResourceName;
  const config = getResourceConfig(resourceName);
  const recordId = z.string().min(1).parse(request.params.id);
  const payload = config.updateSchema.parse(request.body) as Record<string, unknown>;
  const updated = await service.update(config.table, recordId, payload, "*", config.idField);
  return response.json(updated);
}

export async function deleteResource(request: Request, response: Response) {
  const resourceName = request.params.resource as ResourceName;
  const config = getResourceConfig(resourceName);
  const recordId = z.string().min(1).parse(request.params.id);
  const deleted = await service.remove(config.table, recordId, config.idField);
  return response.json(deleted);
}
