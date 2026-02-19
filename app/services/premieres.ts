import type { Premiere } from "@/types";
import data from "@/mocks/premieres.json";

export async function getPremieres(): Promise<Premiere[]> {
  return data as Premiere[];
}
