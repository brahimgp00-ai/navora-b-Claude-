/** Domain types shared across the API. */

export interface PriceTier {
  /** Number of pairs in this bundle. */
  quantity: number;
  /** Total price for the bundle, in MAD. */
  price: number;
  /** Human label shown in the UI, e.g. "2 paires". */
  label: string;
  /** Optional marketing badge, e.g. "Le plus populaire". */
  badge?: string;
}

export interface ProductColor {
  /** Stable identifier used in order payloads. */
  id: string;
  /** Display name, e.g. "Or". */
  name: string;
  /** Hex swatch used by the storefront. */
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  /** Original (pre-discount) unit price in MAD, used to show the strike-through. */
  compareAtPrice: number;
  currency: "MAD";
  colors: ProductColor[];
  /** Quantity-based bundle pricing (the core COD conversion lever). */
  tiers: PriceTier[];
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
}

export interface Order {
  id: string;
  /** Short human-friendly reference, e.g. "NAV-7F3K2Q". */
  reference: string;
  productId: string;
  productName: string;
  colorId: string;
  colorName: string;
  quantity: number;
  unitLabel: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: "MAD";
  customer: CustomerInfo;
  status: "pending";
  createdAt: string;
}
