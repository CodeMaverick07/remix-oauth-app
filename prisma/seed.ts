import { db } from "~/lib/db.server";

function getShelves(userId: string) {
  return [
    {
      userId,
      name: "Dairy",
      items: {
        create: [
          { userId, name: "milk" },
          { userId, name: "chess" },
          { userId, name: "eggs" },
        ],
      },
    },
    {
      userId,
      name: "Supermarket",
      items: {
        create: [
          { userId, name: "ice-cream" },
          { userId, name: "biscuit" },
          { userId, name: "cake" },
        ],
      },
    },
  ];
}

async function seed() {
  const { id } = await db.user.create({
    data: {
      email: "hemant@gmail.com",
      password: "12345678",
      name: "hemant",
    },
  });
  await Promise.all(
    getShelves(id).map((shelf) => db.pantryShelf.create({ data: shelf }))
  );
}

seed();
