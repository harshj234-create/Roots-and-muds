import "server-only";
import { cache } from "react";
import productsFile from "@/data/products.json";
import bundlesFile from "@/data/bundles.json";
import pricingFile from "@/data/pricing.json";
import { getSetting } from "./db";
import type { Store } from "./pricing";

// The catalog lives in data/*.json. Changes made on the admin page are saved to the database
// under the key "store" and take priority over the files.

export const defaultStore: Store = {
  categories: productsFile.categories,
  products: productsFile.products,
  bundles: bundlesFile.bundles as Store["bundles"],
  pricing: pricingFile as Store["pricing"],
};

export const getStore = cache(async (): Promise<Store> => {
  try {
    const saved = await getSetting<Partial<Store>>("store");
    if (saved) return { ...defaultStore, ...saved };
  } catch (e) {
    console.error("Could not load saved catalog, using data files", e);
  }
  return defaultStore;
});
