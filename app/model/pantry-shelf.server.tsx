import { db } from "~/lib/db.server";

export async function getAllShelves(query: string | null) {
  return await db.pantryShelf.findMany({
    where: {
      name: {
        contains: query ?? "",
        mode: "insensitive",
      },
    },
    include: { items: { orderBy: { name: "asc" } } },
  });
}
