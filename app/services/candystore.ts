import type { CandyProduct } from "@/types";
import data from "@/mocks/candystore.json";

export async function getCandyStore(): Promise<CandyProduct[]> {
  return data as CandyProduct[];
}
