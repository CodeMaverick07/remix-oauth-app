import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
import { db } from "./db.server";
import { redirect } from "@remix-run/node";

const loginAuthenticator = new Authenticator(sessionStorage);
const registerAuthenticator = new Authenticator(sessionStorage);

const registerFormStrategy = new FormStrategy(async ({ form, request }) => {
  const email = form.get("email");
  const password = form.get("password");
  const name = form.get("name");

  const existingUser = await db.user.findUnique({
    where: { email: email as string },
  });

  if (existingUser) {
    throw new AuthorizationError("User already exists");
  }

  try {
    const user = await db.user.create({
      data: {
        email: email as string,
        name: name as string,
        password: password as string,
      },
    });

    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );
    session.set("userId", user.id);

    const cookie = await sessionStorage.commitSession(session);

    return redirect("/app", {
      headers: { "Set-Cookie": cookie },
    });
  } catch (error) {
    console.error(error);
    throw new AuthorizationError("Failed to register user");
  }
});

const loginFormStrategy = new FormStrategy(async ({ form, request }) => {
  const email = form.get("email");
  const password = form.get("password");

  const user = await db.user.findUnique({
    where: { email: email as string },
  });

  if (!user) {
    throw new AuthorizationError("User does not exist.");
  } else if (user.provider !== "form") {
    throw new AuthorizationError("User exists with a different login method.");
  } else if (user.password !== password) {
    throw new AuthorizationError("Password does not match.");
  }

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  session.set("userId", user.id);

  const cookie = await sessionStorage.commitSession(session);

  return redirect("/", {
    headers: { "Set-Cookie": cookie },
  });
});

loginAuthenticator.use(loginFormStrategy, "form");
registerAuthenticator.use(registerFormStrategy, "form");

export { loginAuthenticator, registerAuthenticator };
