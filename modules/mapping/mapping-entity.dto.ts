import type { RequestBodyType } from "dff-util";

/** Input for /mapping-entity-data: raw `data` is mapped into an entity shape using the active mapping rows for `type`. */
export type MappingEntityDataRequest = {
  type: string;
  data: RequestBodyType;
};

/**
 * Input for /mapping-batch-entity-data: raw `items` are each mapped into an entity shape using
 * the active mapping rows for `type`. Every item shares the same `type`.
 */
export type MappingBatchEntityDataRequest = {
  type: string;
  items: RequestBodyType[];
};

/** One item's result in the /mapping-batch-entity-data response, in the same order as `items`. */
export type MappedEntityResult = {
  /** Resolved entity id (via the `entityField: "id"` mapping row), or "unknown" if not resolvable. */
  id: string;
  /** The mapped entity, or null when this item failed to map. */
  data: Record<string, unknown> | null;
  /** Present only when this item failed to map; never includes the "[id: ...]" prefix since `id` is already a separate field. */
  error?: string;
};
