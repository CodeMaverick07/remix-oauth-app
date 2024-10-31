import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "./session.server";

import { FormStrategy } from "remix-auth-form";
import { db } from "./db.server";

const loginAuthenticator = new Authenticator(sessionStorage);
const registerAuthenticator = new Authenticator(sessionStorage);

const registerFormStratergy = new FormStrategy(async ({ form }) => {
  const email = form.get("email");
  const password = form.get("password");
  const name = form.get("name");

  const user = await db.user.findUnique({
    where: {
      email: email as string,
    },
  });
  if (!user) {
    try {
      const user = db.user.create({
        data: {
          email: email as string,
          name: name as string,
          password: password as string,
        },
      });
      return user;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new AuthorizationError(error);
    }
  } else {
    throw new AuthorizationError("user already exits");
  }
});

const loginFormStratergy = new FormStrategy(async ({ form }) => {
  const email = form.get("email");
  const password = form.get("password");

  const user = await db.user.findUnique({
    where: {
      email: email as string,
    },
  });
  if (!user) {
    throw new AuthorizationError("user dose not exits");
  } else {
    if (user.password == password && user.email == email) {
      return user;
    } else {
      console.log(user, "user");
      console.log(password, "and", user.password);
      throw new AuthorizationError("password dose not match");
    }
  }
});

loginAuthenticator.use(loginFormStratergy, "form");
registerAuthenticator.use(registerFormStratergy, "form");

export { loginAuthenticator, registerAuthenticator };
