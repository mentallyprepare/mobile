/**
 * Runtime shape validation for API responses.
 *
 * The client casts `body as T` at the boundary. If the server returns a shape
 * the app doesn't expect — a missing field, a null where an object should be,
 * a string where a number should be — the mistake propagates until a render
 * reaches for `.day` on `null` and crashes.
 *
 * This module gives each endpoint a small parser that walks the response,
 * asserts what the app depends on, and returns the typed value or throws a
 * SchemaError. The error carries the JSON path so the failure names the
 * exact field. It has no dependencies.
 *
 * Keep parsers narrow. The web response is a superset of what the mobile app
 * reads; the parsers here only validate what a screen actually consumes.
 * Extra server fields are ignored, not rejected — the server is allowed to
 * add data without breaking the app.
 */

export class SchemaError extends Error {
  public readonly path: string;
  public readonly reason: string;
  constructor(path: string, reason: string) {
    super(`response mismatch at ${path || '<root>'}: ${reason}`);
    this.name = 'SchemaError';
    this.path = path;
    this.reason = reason;
  }
}

function describe(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

export function asObject(v: unknown, path: string): Record<string, unknown> {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  throw new SchemaError(path, `expected object, got ${describe(v)}`);
}

export function asString(v: unknown, path: string): string {
  if (typeof v === 'string') return v;
  throw new SchemaError(path, `expected string, got ${describe(v)}`);
}

export function asNumber(v: unknown, path: string): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  throw new SchemaError(path, `expected number, got ${describe(v)}`);
}

export function asBoolean(v: unknown, path: string): boolean {
  if (typeof v === 'boolean') return v;
  throw new SchemaError(path, `expected boolean, got ${describe(v)}`);
}

export function asArray(v: unknown, path: string): unknown[] {
  if (Array.isArray(v)) return v;
  throw new SchemaError(path, `expected array, got ${describe(v)}`);
}

/**
 * Wraps a parser so `null` and `undefined` pass through as `null`. Use for
 * fields the server may legitimately omit. Undefined coerces to null so the
 * result type is a single, uniform `T | null`.
 */
export function nullable<T>(
  parse: (v: unknown, p: string) => T,
): (v: unknown, p: string) => T | null {
  return (v, p) => (v === null || v === undefined ? null : parse(v, p));
}

/**
 * Reads a field off an object with the field name appended to the path, so
 * `user.email` in an error message tells you exactly where the shape broke.
 */
export function field<T>(
  obj: Record<string, unknown>,
  path: string,
  key: string,
  parse: (v: unknown, p: string) => T,
): T {
  const next = path ? `${path}.${key}` : key;
  return parse(obj[key], next);
}

/**
 * Parses an array of items with per-index paths, so the offending element is
 * named as `entries[3]` rather than lost in the middle of a list.
 */
export function arrayOf<T>(
  v: unknown,
  path: string,
  parse: (v: unknown, p: string) => T,
): T[] {
  const raw = asArray(v, path);
  return raw.map((item, i) => parse(item, `${path}[${i}]`));
}
