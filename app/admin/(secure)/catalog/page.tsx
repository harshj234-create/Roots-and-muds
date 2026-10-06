import { getStore } from "@/lib/store";
import { getSetting } from "@/lib/db";
import { CatalogEditor } from "./editor";

export default async function Catalog() {
  const store = await getStore();
  const customised = !!(await getSetting("store").catch(() => null));
  return <CatalogEditor initial={store} customised={customised} />;
}
