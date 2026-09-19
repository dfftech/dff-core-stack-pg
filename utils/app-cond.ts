import { QueryCond as DffQueryCond, toSnakeCase, type QueryCondItem as DffQueryCondItem } from "dff-util";
import {
  and,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  notInArray,
  sql,
  type SQL,
} from "drizzle-orm";

export function QueryCond(input: string): DffQueryCondItem[] {
  return DffQueryCond(input);
}

export type QueryCondItem = DffQueryCondItem;

export function getColumnForTable(table: Record<string, unknown>): (key: string) => any {
  return (key: string) => table[toSnakeCase(key)];
}

function oneCond(item: QueryCondItem, getColumn: (key: string) => any): SQL | undefined {
  const col = getColumn(item.key);
  const opt = (item.opt || "=").trim().toLowerCase();
  const val = item.value;

  switch (opt) {
    case "=":
      return val === null ? isNull(col as any) : eq(col as any, val);
    case "!=":
    case "<>":
      return val === null ? isNotNull(col as any) : ne(col as any, val);
    case ">":
      return gt(col as any, val);
    case ">=":
      return gte(col as any, val);
    case "<":
      return lt(col as any, val);
    case "<=":
      return lte(col as any, val);
    case "in":
      return Array.isArray(val) ? inArray(col as any, val) : undefined;
    case "not in":
    case "notin":
      return Array.isArray(val) ? notInArray(col as any, val) : undefined;
    case "is null":
    case "isnull":
      return isNull(col as any);
    case "is not null":
    case "isnotnull":
      return isNotNull(col as any);
    case "between":
      return Array.isArray(val) && val.length >= 2
        ? and(gte(col as any, val[0]), lte(col as any, val[1]))
        : undefined;
    case "like":
      return typeof val === "string" ? like(col as any, val) : undefined;
    case "ilike":
      return typeof val === "string" ? ilike(col as any, val) : undefined;
    case "contains":
      return typeof val === "string" ? ilike(col as any, `%${val}%`) : undefined;
    case "startswith":
      return typeof val === "string" ? like(col as any, `${val}%`) : undefined;
    case "endswith":
      return typeof val === "string" ? like(col as any, `%${val}`) : undefined;
    case "regex":
      return typeof val === "string" ? sql`${col} ~ ${val}` : undefined;
    case "exists":
      return val === true ? isNotNull(col as any) : isNull(col as any);
    default:
      return undefined;
  }
}

export function toWhereCond(
  conds: QueryCondItem[],
  getColumn: (key: string) => any
): SQL | undefined {
  if (!conds?.length) return undefined;
  const list: SQL[] = [];
  for (const item of conds) {
    const c = oneCond(item, getColumn);
    if (c) list.push(c);
  }
  return list.length === 0 ? undefined : list.length === 1 ? list[0]! : and(...list);
}
