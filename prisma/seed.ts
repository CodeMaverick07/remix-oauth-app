import { db } from "~/lib/db.server";

function getShelves() {
  return [
    {
      name: "Dairy",
      items: {
        create: [{ name: "milk" }, { name: "chess" }, { name: "eggs" }],
      },
    },
    {
      name: "Supermarket",
      items: {
        create: [{ name: "ice-cream" }, { name: "biscuit" }, { name: "cake" }],
      },
    },
  ];
}

async function seed() {
  await Promise.all(
    getShelves().map((shelf) => db.pantryShelf.create({ data: shelf }))
  );
}

seed();
