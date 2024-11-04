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
    orderBy: { createdAt: "desc" },
  });
}

export async function createShelves({ name }: { name: string }) {
  return await db.pantryShelf.create({
    data: { name },
  });
}

export async function deleteShelve({ id }: { id: string }) {
  console.log(id, "form the outside action");
  if (!id) {
    return null;
  }
  return await db.pantryShelf.delete({ where: { id } });
}
