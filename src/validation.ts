import { z } from "zod";

/**
 * Moroccan mobile number: local form 06/07XXXXXXXX or international +2126/7XXXXXXXX.
 * Spaces, dashes and dots are stripped before validation.
 */
const PHONE_REGEX = /^(?:\+212|0)[67]\d{8}$/;

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s.\-()]/g, "");
}

export const orderSchema = z.object({
  productId: z.string().min(1, "Produit manquant"),
  colorId: z.string().min(1, "Veuillez choisir une couleur"),
  quantity: z
    .number({ invalid_type_error: "Quantité invalide" })
    .int("Quantité invalide")
    .min(1, "Quantité invalide"),
  customer: z.object({
    fullName: z
      .string()
      .trim()
      .min(3, "Nom complet requis (au moins 3 caractères)")
      .max(80, "Nom trop long"),
    phone: z
      .string()
      .trim()
      .transform(normalizePhone)
      .refine((v) => PHONE_REGEX.test(v), {
        message: "Numéro de téléphone marocain invalide (ex: 0612345678)",
      }),
    city: z.string().trim().min(2, "Ville requise").max(60, "Ville invalide"),
    address: z
      .string()
      .trim()
      .min(5, "Adresse complète requise")
      .max(200, "Adresse trop longue"),
    notes: z.string().trim().max(500, "Note trop longue").optional(),
  }),
});

export type OrderInput = z.infer<typeof orderSchema>;
