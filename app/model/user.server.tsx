// utils/auth.server.ts

import { sessionStorage } from "~/lib/session.server";
import { db } from "~/lib/db.server";
import { User } from "@prisma/client"; // adjust if using a different user model

export async function getUser(request: Request): Promise<User | null> {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const userId = session.get("userId");

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  return user;
}
