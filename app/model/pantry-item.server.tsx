import { db } from "~/lib/db.server";
import { handleDelete } from "~/lib/utils";

export async function createShelfItem(shelfId: string, name: string) {
  return await db.pantryItem.create({
    data: {
      name,
      shelfId,
    },
  });
}

export async function deleteShelfItem(itemId: string) {
  return await handleDelete(() =>
    db.pantryItem.delete({
      where: {
        id: itemId,
      },
    })
  );
}
