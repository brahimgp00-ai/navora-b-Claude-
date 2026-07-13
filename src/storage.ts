import { promises as fs } from "node:fs";
import path from "node:path";
import type { Order } from "./types.js";

/**
 * Minimal append-only JSON persistence for orders. A flat file keeps the API
 * dependency-free and trivial to run anywhere; swapping in a real database
 * later only touches this module.
 */
export class OrderStore {
  private readonly file: string;
  /** Serializes writes so concurrent requests never corrupt the JSON file. */
  private writeChain: Promise<void> = Promise.resolve();

  constructor(file: string) {
    this.file = path.resolve(file);
  }

  private async readAll(): Promise<Order[]> {
    try {
      const raw = await fs.readFile(this.file, "utf8");
      return JSON.parse(raw) as Order[];
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
  }

  async list(): Promise<Order[]> {
    const all = await this.readAll();
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string): Promise<Order | undefined> {
    const all = await this.readAll();
    return all.find((o) => o.id === id);
  }

  async add(order: Order): Promise<Order> {
    this.writeChain = this.writeChain.then(async () => {
      const all = await this.readAll();
      all.push(order);
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      await fs.writeFile(this.file, JSON.stringify(all, null, 2), "utf8");
    });
    await this.writeChain;
    return order;
  }
}
