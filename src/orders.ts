import { randomUUID } from "node:crypto";
import type { Order } from "./types.js";
import type { OrderInput } from "./validation.js";
import { getProduct } from "./data/catalog.js";

/** Error carrying an HTTP status so routes can translate it into a response. */
export class OrderError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "OrderError";
  }
}

/** Delivery is free nationwide — a key trust signal for the Moroccan market. */
export const DELIVERY_FEE = 0;

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateReference(): string {
  let ref = "";
  for (let i = 0; i < 6; i++) {
    ref += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  }
  return `NAV-${ref}`;
}

/**
 * Turns validated client input into a persisted-ready order. Pricing is looked
 * up server-side from the catalog so the client cannot influence the total.
 */
export function buildOrder(input: OrderInput): Order {
  const product = getProduct(input.productId);
  if (!product) {
    throw new OrderError(404, "Produit introuvable");
  }

  const color = product.colors.find((c) => c.id === input.colorId);
  if (!color) {
    throw new OrderError(400, "Couleur indisponible pour ce produit");
  }

  const tier = product.tiers.find((t) => t.quantity === input.quantity);
  if (!tier) {
    throw new OrderError(400, "Quantité indisponible");
  }

  const subtotal = tier.price;
  const total = subtotal + DELIVERY_FEE;

  return {
    id: randomUUID(),
    reference: generateReference(),
    productId: product.id,
    productName: product.name,
    colorId: color.id,
    colorName: color.name,
    quantity: tier.quantity,
    unitLabel: tier.label,
    subtotal,
    deliveryFee: DELIVERY_FEE,
    total,
    currency: "MAD",
    customer: {
      fullName: input.customer.fullName,
      phone: input.customer.phone,
      city: input.customer.city,
      address: input.customer.address,
      notes: input.customer.notes,
    },
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}
