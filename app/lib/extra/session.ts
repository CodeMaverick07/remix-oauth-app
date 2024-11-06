import { createCookieSessionStorage, createCookie } from "@remix-run/node";

export const sessionCookie = createCookie("_session", {
  secrets: ["secret"],
  httpOnly: true,
  secure: true,
});

export const sessionStorage = createCookieSessionStorage({
  cookie: sessionCookie,
});

export const { getSession, commitSession, destroySession } = sessionStorage;
