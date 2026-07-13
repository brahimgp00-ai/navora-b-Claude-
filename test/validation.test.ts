import { describe, it, expect } from "vitest";
import { normalizePhone, orderSchema } from "../src/validation.js";

const validCustomer = {
  fullName: "Youssef El Amrani",
  phone: "0612345678",
  city: "Casablanca",
  address: "12 Rue des Orangers, Maârif",
};

describe("normalizePhone", () => {
  it("strips spaces, dots and dashes", () => {
    expect(normalizePhone("06 12-34.56 78")).toBe("0612345678");
  });
});

describe("orderSchema", () => {
  it("accepts a valid local Moroccan number", () => {
    const parsed = orderSchema.parse({
      productId: "navora-aura",
      colorId: "gold",
      quantity: 2,
      customer: validCustomer,
    });
    expect(parsed.customer.phone).toBe("0612345678");
    expect(parsed.quantity).toBe(2);
  });

  it("accepts an international +212 number and normalizes formatting", () => {
    const parsed = orderSchema.parse({
      productId: "navora-aura",
      colorId: "gold",
      quantity: 1,
      customer: { ...validCustomer, phone: "+212 712-345-678" },
    });
    expect(parsed.customer.phone).toBe("+212712345678");
  });

  it("rejects a phone number that is not a Moroccan mobile", () => {
    const result = orderSchema.safeParse({
      productId: "navora-aura",
      colorId: "gold",
      quantity: 1,
      customer: { ...validCustomer, phone: "0512345678" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short full name", () => {
    const result = orderSchema.safeParse({
      productId: "navora-aura",
      colorId: "gold",
      quantity: 1,
      customer: { ...validCustomer, fullName: "Ali" .slice(0, 2) },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an incomplete address", () => {
    const result = orderSchema.safeParse({
      productId: "navora-aura",
      colorId: "gold",
      quantity: 1,
      customer: { ...validCustomer, address: "N/A" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer quantity", () => {
    const result = orderSchema.safeParse({
      productId: "navora-aura",
      colorId: "gold",
      quantity: 1.5,
      customer: validCustomer,
    });
    expect(result.success).toBe(false);
  });
});
