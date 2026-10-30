import type { RequestBodyType } from "dff-util";
import { AppError } from "../../utils/app-error";
import type {
  MappedEntityResult,
  MappingBatchEntityDataRequest,
  MappingEntityDataRequest,
} from "./mapping-entity.dto";
import MappingService from "./mapping.service";

/** Service for /mapping-entity-data and /mapping-batch-entity-data — maps raw request data into an entity shape using the active mapping rows for a type. */
export default class MappingEntityService {
  /** true for any value worth keeping in the mapped entity (keeps 0 / false, drops null / undefined / ""). */
  static HasValue(value: unknown): boolean {
    return value !== null && value !== undefined && value !== "";
  }

  /** Sets a dot-path ("variant.material.en-US") on target, creating intermediate objects as needed. */
  static SetPath(target: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split(".").filter(Boolean);
    let node: Record<string, unknown> = target;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      const next = node[key];
      if (typeof next !== "object" || next === null || Array.isArray(next)) {
        node[key] = {};
      }
      node = node[key] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = value;
  }

  /**
   * Evaluates each compute expression (JS, `data` in scope) in order and returns the first
   * non-null/undefined result. Returns an error string instead of throwing on a bad expression.
   */
  static EvaluateCompute(
    expressions: string[] | null | undefined,
    data: RequestBodyType,
    entityField: string
  ): { value?: unknown; error?: string } {
    if (!expressions || !expressions.length) return { value: undefined };
    for (const expression of expressions) {
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function("data", `"use strict"; return (${expression});`);
        const result = fn(data);
        if (result !== null && result !== undefined) return { value: result };
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        return { error: `Could not compute field "${entityField}": ${reason}` };
      }
    }
    return { value: null };
  }

  static ResolveInputValue(inputField: string | null | undefined, data: RequestBodyType): unknown {
    if (!inputField) return null;
    const raw = (data as Record<string, unknown>)[inputField];
    if (raw === undefined) return null;
    return typeof raw === "string" ? raw.trim() : raw;
  }

  /**
   * TODO: resolve this row's value using `aiSummary` as an AI prompt/instruction against `data`.
   * Not implemented yet — always returns null until the AI integration is wired up.
   */
  static EvaluateAiSummary(
    aiSummary: string | null | undefined,
    data: RequestBodyType,
    entityField: string
  ): { value: unknown; error?: string } {
    // TODO: call an AI service with `aiSummary` as the instruction and `data` as context to
    // resolve the value for `entityField`.
    return { value: null };
  }

  /**
   * Resolves one row's mapped value in priority order:
   *  1. `data[inputField]` (trimmed) — used as-is when present.
   *  2. When the input value is null: `compute` expressions, if the row has any.
   *  3. When the input value is null AND `compute` is null: `aiSummary` (TODO, currently a no-op).
   */
  static ResolveRowValue(row: Record<string, any>, data: RequestBodyType): { value: unknown; error?: string } {
    const inputField: string | null = row.inputField ?? null;
    const compute: string[] | null = row.compute ?? null;
    const aiSummary: string | null = row.aiSummary ?? null;

    const inputValue = this.ResolveInputValue(inputField, data);
    if (this.HasValue(inputValue)) return { value: inputValue };

    if (compute && compute.length) {
      const computed = this.EvaluateCompute(compute, data, row.entityField);
      if (computed.error) return { value: undefined, error: computed.error };
      return { value: computed.value === undefined ? null : computed.value };
    }

    return this.EvaluateAiSummary(aiSummary, data, row.entityField);
  }

  /**
   * Step 1 of mapping: resolve the record's own "id" field first (using the `entityField: "id"`
   * mapping row), so it can be attached to every error raised afterwards for easy identification.
   * Returns "unknown" when there is no "id" row, it has no resolvable value, or its compute throws.
   */
  static ResolveEntityId(rows: Array<Record<string, any>>, data: RequestBodyType): string {
    const idRow = rows.find((row) => row.entityField === "id");
    if (!idRow) return "unknown";
    const { value, error } = this.ResolveRowValue(idRow, data);
    if (error || !this.HasValue(value)) return "unknown";
    return String(value);
  }

  /** true for a plain JSON object (not null, not an array). */
  static IsPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  /**
   * Maps one JSON object against the active mapping `rows`. Never throws: returns the resolved
   * `id` (step 1, via the `entityField: "id"` row) plus either the mapped `data` or an `error`
   * message (without the "[id: ...]" prefix). Shared by EntityDataService and BatchEntityDataService.
   */
  static MapOne(
    rows: Array<Record<string, any>>,
    itemData: RequestBodyType
  ): MappedEntityResult {
    const entityId = this.ResolveEntityId(rows, itemData);

    const result: Record<string, unknown> = {};
    const containerPaths = new Set<string>();
    const computeErrors: string[] = [];
    const missingRequired: string[] = [];

    for (const row of rows) {
      const entityField: string = row.entityField;
      const inputField: string | null = row.inputField ?? null;

      if (entityField.includes(".")) containerPaths.add(entityField.split(".")[0]);

      const { value, error } = this.ResolveRowValue(row, itemData);
      if (error) {
        computeErrors.push(error);
        continue;
      }

      // isRequired is checked against entityField's resolved value (from inputField, compute,
      // or aiSummary) — it is a requirement on the mapped output field, not on inputField alone.
      if (row.isRequired && !this.HasValue(value)) {
        const source = inputField ? ` (input field "${inputField}")` : "";
        missingRequired.push(`${entityField}${source}`);
        continue;
      }

      if (this.HasValue(value)) this.SetPath(result, entityField, value);
    }

    if (computeErrors.length) return { id: entityId, data: null, error: computeErrors.join("; ") };
    if (missingRequired.length) {
      return {
        id: entityId,
        data: null,
        error: `Missing required value(s) for: ${missingRequired.join(", ")}`,
      };
    }

    for (const container of containerPaths) {
      if (!(container in result)) result[container] = {};
    }

    return { id: entityId, data: result };
  }

  /** Loads the active mapping rows for `type`, or `[]` on an empty/invalid `type`. */
  static async LoadRows(type: string): Promise<Array<Record<string, any>>> {
    const value = String(type ?? "").trim();
    if (!value) return [];
    return (await MappingService.TypeService(value).catch(() => [])) as Array<Record<string, any>>;
  }

  /**
   * Maps raw `data` (a single JSON object) into an entity shape using the active mapping rows
   * for `type`. Throws AppError (prefixed `[id: <id>]`) with a human-readable message on an
   * unknown type, invalid `data`, a bad compute expression, or a missing required field; never
   * returns a partial result.
   */
  static async EntityDataService(input: MappingEntityDataRequest): Promise<Record<string, unknown>> {
    const type = String(input?.type ?? "").trim();
    const isValidData = this.IsPlainObject(input?.data);
    const data = (isValidData ? input.data : {}) as RequestBodyType;

    // Step 1: resolve the entity id first, before any validation, so every error below
    // (including "type" / "data" / "no mapping rows" failures) can be traced back to a record.
    const rows = await this.LoadRows(type);
    const entityId = this.ResolveEntityId(rows, data);

    if (!type) throw new AppError(`[id: ${entityId}] Mapping "type" is required`);
    if (!isValidData) throw new AppError(`[id: ${entityId}] Mapping "data" must be a JSON object`);
    if (!rows.length) throw new AppError(`[id: ${entityId}] No active mapping rules found for type "${type}"`);

    const { id, data: mapped, error } = this.MapOne(rows, data);
    if (error) throw new AppError(`[id: ${id}] ${error}`);
    return mapped as Record<string, unknown>;
  }

  /**
   * Maps raw `items` (an array, all the same `type`) into entity shapes using the active
   * mapping rows for `type`. Returns one `MappedEntityResult` per item, in the same order.
   *
   * Per-item failures never abort the batch — each gets `data: null` and its own `error`
   * while the rest still map normally: a malformed item (not a JSON object), a `compute`
   * expression that throws, or an `isRequired` field with no resolvable value.
   *
   * Only a request-level failure throws (for the whole request): missing/blank `type`,
   * `items` missing/not a non-empty array, or no active mapping rules found for `type`.
   */
  static async BatchEntityDataService(input: MappingBatchEntityDataRequest): Promise<MappedEntityResult[]> {
    const type = String(input?.type ?? "").trim();
    const hasItems = Array.isArray(input?.items) && input.items.length > 0;
    const items = (hasItems ? input.items : []) as unknown[];
    const firstPlainItem = (items.find((item) => this.IsPlainObject(item)) ?? {}) as RequestBodyType;

    // Step 1: resolve an entity id from the first usable item so request-level errors below
    // can be traced too (falls back to "unknown" when no item is a plain object yet).
    const rows = await this.LoadRows(type);
    const entityId = this.ResolveEntityId(rows, firstPlainItem);

    if (!type) throw new AppError(`[id: ${entityId}] Mapping "type" is required`);
    if (!hasItems) {
      throw new AppError(`[id: ${entityId}] Mapping "items" must be a non-empty array`);
    }
    if (!rows.length) throw new AppError(`[id: ${entityId}] No active mapping rules found for type "${type}"`);

    return items.map((item) =>
      this.IsPlainObject(item)
        ? this.MapOne(rows, item as RequestBodyType)
        : { id: "unknown", data: null, error: "Item must be a JSON object" }
    );
  }
}
