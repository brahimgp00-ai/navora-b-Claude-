import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { ZodError } from "zod";
import { config, parseCorsOrigins } from "./config.js";
import { MOROCCAN_CITIES, PRODUCTS, getProduct } from "./data/catalog.js";
import { OrderStore } from "./storage.js";
import { orderSchema } from "./validation.js";
import { OrderError, buildOrder } from "./orders.js";

export interface AppDeps {
  store: OrderStore;
  adminToken: string;
  corsOrigin: string;
}

export function createApp(deps: AppDeps): Express {
  const app = express();

  app.use(
    cors({
      origin: parseCorsOrigins(deps.corsOrigin),
    }),
  );
  app.use(express.json({ limit: "16kb" }));

  // --- Health -------------------------------------------------------------
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "navora-api", time: new Date().toISOString() });
  });

  // --- Catalog ------------------------------------------------------------
  app.get("/api/products", (_req, res) => {
    res.json({ products: PRODUCTS, cities: MOROCCAN_CITIES });
  });

  app.get("/api/products/:id", (req, res) => {
    const product = getProduct(req.params.id);
    if (!product) {
      res.status(404).json({ error: "Produit introuvable" });
      return;
    }
    res.json({ product });
  });

  // --- Orders (public: create) -------------------------------------------
  app.post("/api/orders", async (req, res, next) => {
    try {
      const input = orderSchema.parse(req.body);
      const order = buildOrder(input);
      await deps.store.add(order);
      res.status(201).json({
        ok: true,
        order: {
          reference: order.reference,
          productName: order.productName,
          colorName: order.colorName,
          quantity: order.quantity,
          unitLabel: order.unitLabel,
          total: order.total,
          currency: order.currency,
          createdAt: order.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // --- Orders (admin: read) ----------------------------------------------
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("x-admin-token");
    if (!token || token !== deps.adminToken) {
      res.status(401).json({ error: "Non autorisé" });
      return;
    }
    next();
  };

  app.get("/api/orders", requireAdmin, async (_req, res, next) => {
    try {
      const orders = await deps.store.list();
      res.json({ count: orders.length, orders });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/orders/:id", requireAdmin, async (req, res, next) => {
    try {
      const order = await deps.store.findById(req.params.id);
      if (!order) {
        res.status(404).json({ error: "Commande introuvable" });
        return;
      }
      res.json({ order });
    } catch (err) {
      next(err);
    }
  });

  // --- 404 + error handling ----------------------------------------------
  app.use((_req, res) => {
    res.status(404).json({ error: "Route introuvable" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(422).json({
        error: "Données invalides",
        details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      });
      return;
    }
    if (err instanceof OrderError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  });

  return app;
}

export function createDefaultApp(): Express {
  return createApp({
    store: new OrderStore(config.ordersFile),
    adminToken: config.adminToken,
    corsOrigin: config.corsOrigin,
  });
}
