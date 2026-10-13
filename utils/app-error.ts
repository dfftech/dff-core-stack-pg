/** Expected failure (validation, not found). Services throw it, `api.ts` catches it and returns `{ data: null, error: code }`. */
export class AppError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "AppError";
  }
}
