import { createCookieSessionStorage } from "@remix-run/node";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secrets: ["secret"],
    secure: true,
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
