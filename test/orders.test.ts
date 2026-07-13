import { describe, it, expect } from "vitest";
import { buildOrder, OrderError, DELIVERY_FEE } from "../src/orders.js";
import type { OrderInput } from "../src/validation.js";

const base: OrderInput = {
  productId: "navora-aura",
  colorId: "gold",
  quantity: 2,
  customer: {
    fullName: "Salma Bennani",
    phone: "0712345678",
    city: "Rabat",
    address: "45 Avenue Mohammed V, Agdal",
  },
};

describe("buildOrder", () => {
  it("computes the total from the server-side tier price (2 pairs = 899 MAD)", () => {
    const order = buildOrder(base);
    expect(order.subtotal).toBe(899);
    expect(order.deliveryFee).toBe(DELIVERY_FEE);
    expect(order.total).toBe(899);
    expect(order.quantity).toBe(2);
    expect(order.unitLabel).toBe("2 paires");
  });

  it("prices a single pair at 499 MAD", () => {
    const order = buildOrder({ ...base, quantity: 1 });
    expect(order.total).toBe(499);
  });

  it("generates a NAV- reference and a pending status", () => {
    const order = buildOrder(base);
    expect(order.reference).toMatch(/^NAV-[A-Z2-9]{6}$/);
    expect(order.status).toBe("pending");
    expect(order.colorName).toBe("Or");
  });

  it("throws 404 for an unknown product", () => {
    expect(() => buildOrder({ ...base, productId: "ghost" })).toThrowError(OrderError);
  });

  it("throws 400 for an unavailable color", () => {
    try {
      buildOrder({ ...base, colorId: "neon" });
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(OrderError);
      expect((err as OrderError).status).toBe(400);
    }
  });

  it("throws 400 for a quantity without a matching tier", () => {
    try {
      buildOrder({ ...base, quantity: 9 });
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as OrderError).status).toBe(400);
    }
  });
});
