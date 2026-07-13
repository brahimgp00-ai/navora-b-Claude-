import type { Product } from "../types.js";

/**
 * NAVORA catalog. The storefront is built around a single hero product sold
 * with quantity bundles (the standard high-converting Cash-on-Delivery model
 * used across the Moroccan market). The API is the source of truth for pricing
 * so totals can never be tampered with from the client.
 */
export const PRODUCTS: Product[] = [
  {
    id: "navora-aura",
    name: "NAVORA Aura",
    tagline: "Lunettes premium sans monture",
    compareAtPrice: 799,
    currency: "MAD",
    colors: [
      { id: "gold", name: "Or", hex: "#C9A24B" },
      { id: "silver", name: "Argent", hex: "#C7CCD1" },
      { id: "black", name: "Noir", hex: "#23262B" },
      { id: "rose", name: "Or rosé", hex: "#D8A18B" },
    ],
    tiers: [
      { quantity: 1, price: 499, label: "1 paire" },
      { quantity: 2, price: 899, label: "2 paires", badge: "Le plus populaire" },
      { quantity: 3, price: 1199, label: "3 paires", badge: "Meilleure valeur" },
    ],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/**
 * Major Moroccan cities offered in the checkout dropdown. Delivery is free and
 * available nationwide, so the storefront also accepts a free-text city.
 */
export const MOROCCAN_CITIES: string[] = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Safi",
  "El Jadida",
  "Nador",
  "Béni Mellal",
  "Mohammédia",
  "Khouribga",
  "Salé",
  "Témara",
  "Settat",
  "Berrechid",
  "Taza",
  "Laâyoune",
  "Dakhla",
  "Essaouira",
  "Ouarzazate",
];
