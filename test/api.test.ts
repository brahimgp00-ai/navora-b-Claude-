import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { createApp } from "../src/app.js";
import { OrderStore } from "../src/storage.js";

const tmpFiles: string[] = [];

async function makeApp() {
  const file = path.join(os.tmpdir(), `navora-orders-${Date.now()}-${Math.random()}.json`);
  tmpFiles.push(file);
  const app = createApp({
    store: new OrderStore(file),
    adminToken: "test-token",
    corsOrigin: "*",
  });
  return { app, file };
}

const validBody = {
  productId: "navora-aura",
  colorId: "silver",
  quantity: 3,
  customer: {
    fullName: "Hamza Idrissi",
    phone: "06 12 34 56 78",
    city: "Marrakech",
    address: "78 Rue de la Kasbah, Gueliz",
  },
};

afterAll(async () => {
  await Promise.all(tmpFiles.map((f) => fs.rm(f, { force: true })));
});

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const { app } = await makeApp();
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /api/products", () => {
  it("returns the catalog and cities", async () => {
    const { app } = await makeApp();
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.products[0].id).toBe("navora-aura");
    expect(res.body.cities).toContain("Casablanca");
  });
});

describe("POST /api/orders", () => {
  it("creates an order and returns a reference + server-side total", async () => {
    const { app } = await makeApp();
    const res = await request(app).post("/api/orders").send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.order.total).toBe(1199);
    expect(res.body.order.reference).toMatch(/^NAV-/);
  });

  it("persists the order so admins can read it back", async () => {
    const { app } = await makeApp();
    await request(app).post("/api/orders").send(validBody);
    const list = await request(app).get("/api/orders").set("x-admin-token", "test-token");
    expect(list.status).toBe(200);
    expect(list.body.count).toBe(1);
    expect(list.body.orders[0].customer.phone).toBe("0612345678");
  });

  it("rejects invalid payloads with 422 and field details", async () => {
    const { app } = await makeApp();
    const res = await request(app)
      .post("/api/orders")
      .send({ ...validBody, customer: { ...validBody.customer, phone: "123" } });
    expect(res.status).toBe(422);
    expect(res.body.details.some((d: { field: string }) => d.field === "customer.phone")).toBe(true);
  });

  it("rejects an unavailable quantity with 400", async () => {
    const { app } = await makeApp();
    const res = await request(app).post("/api/orders").send({ ...validBody, quantity: 7 });
    expect(res.status).toBe(400);
  });
});

describe("admin auth", () => {
  it("blocks reading orders without the admin token", async () => {
    const { app } = await makeApp();
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(401);
  });
});
