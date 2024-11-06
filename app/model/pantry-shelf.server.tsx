import { db } from "~/lib/db.server";
import { handleDelete } from "~/lib/utils";

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
    data: { name, userId: "" },
  });
}

export async function deleteShelve(id: string) {
  return await handleDelete(() => db.pantryShelf.delete({ where: { id } }));
}

export async function changeShelfName(id: string, name: string) {
  return await db.pantryShelf.update({
    where: { id },
    data: { name },
  });
}
