import { api } from "encore.dev/api";
import type { ResponseType } from "dff-util";
import { AppError } from "../../utils/app-error";
import { logger } from "../../utils/app-util";
import type {
  MappingBatchEntityDataRequest,
  MappingEntityDataRequest,
} from "./mapping-entity.dto";
import MappingEntityService from "./mapping-entity.service";

/** POST /mapping-entity-data — maps raw `data` into an entity shape using the active mapping rows for `type`. */
export const EntityDataMapping = api<MappingEntityDataRequest, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/mapping-entity-data",
  },
  async (input) => {
    try {
      const data = await MappingEntityService.EntityDataService(input);
      return { data, status: "MAPPED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to map entity data: ${error}`);
      return { data: null, error: "Failed to map entity data" };
    }
  }
);

/**
 * POST /mapping-batch-entity-data — maps several `items` (all the same `type`) in one call.
 * Response `data` is an array of `{ id, data, error? }`, one per item, in the same order as
 * `items`; `total` is the array length. A per-item mapping failure never fails the whole
 * request — only a request-level failure (bad `type`/`items`, or no active mapping rules).
 */
export const BatchEntityDataMapping = api<MappingBatchEntityDataRequest, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/mapping-batch-entity-data",
  },
  async (input) => {
    try {
      const data = await MappingEntityService.BatchEntityDataService(input);
      return { data, total: data.length, status: "MAPPED_SUCCESSFULLY" };
    } catch (error) {
      if (error instanceof AppError) {
        return { data: null, error: error.code };
      }
      logger().error(`Failed to batch map entity data: ${error}`);
      return { data: null, error: "Failed to batch map entity data" };
    }
  }
);
