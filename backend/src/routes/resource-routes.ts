import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { HttpError } from "../lib/http-error.js";
import { resourceConfigs } from "../resources.js";
import {
  createResource,
  deleteResource,
  getResourceById,
  listResources,
  updateResource,
} from "../controllers/resource-controller.js";

export const resourceRouter = Router();

resourceRouter.use("/:resource", (request, _response, next) => {
  const parsed = z.enum(Object.keys(resourceConfigs) as [keyof typeof resourceConfigs, ...(keyof typeof resourceConfigs)[]]).safeParse(request.params.resource);

  if (!parsed.success) {
    return next(new HttpError(404, `Unknown resource: ${request.params.resource}`));
  }

  return next();
});

resourceRouter.get("/:resource", asyncHandler(listResources));
resourceRouter.get("/:resource/:id", asyncHandler(getResourceById));
resourceRouter.post("/:resource", asyncHandler(createResource));
resourceRouter.patch("/:resource/:id", asyncHandler(updateResource));
resourceRouter.delete("/:resource/:id", asyncHandler(deleteResource));
