/**
 * Runtime configuration, read once from the environment.
 * Everything has a sensible default so the API runs out of the box in dev.
 */
export const config = {
  port: Number(process.env.PORT ?? 4000),
  ordersFile: process.env.ORDERS_FILE ?? "data/orders.json",
  adminToken: process.env.ADMIN_TOKEN ?? "change-me-in-production",
  /**
   * Allowed CORS origins. "*" allows any origin. Otherwise a comma-separated
   * list of exact origins (e.g. "http://localhost:5173,https://navora.ma").
   */
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
} as const;

export function parseCorsOrigins(value: string): "*" | string[] {
  const trimmed = value.trim();
  if (trimmed === "*" || trimmed === "") return "*";
  return trimmed
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}
