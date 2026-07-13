import { config } from "./config.js";
import { createDefaultApp } from "./app.js";

const app = createDefaultApp();

app.listen(config.port, () => {
  console.log(`NAVORA API listening on http://localhost:${config.port}`);
  console.log(`  Health:   GET  /api/health`);
  console.log(`  Catalog:  GET  /api/products`);
  console.log(`  Orders:   POST /api/orders`);
});
