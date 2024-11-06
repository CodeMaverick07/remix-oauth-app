/* eslint-disable @typescript-eslint/no-explicit-any */
import { Authenticator, AuthorizationError } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { GoogleStrategy } from "remix-auth-google";
import { sessionStorage } from "./session.server";
import { db } from "./db.server";
import { redirect } from "@remix-run/node";

const gitHubAuthenticator = new Authenticator(sessionStorage);
const googleAuthenticator = new Authenticator(sessionStorage);

// GitHub strategy
const gitHubStrategy = new GitHubStrategy(
  {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    redirectURI: process.env.GITHUB_CALLBACK_URL!,
  },
  async ({ profile, request }) => {
    const email = profile.emails[0].value as string;

    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      try {
        user = await db.user.create({
          data: {
            name: profile.name.givenName as string,
            email,
            provider: "github",
          },
        });
      } catch (error: any) {
        console.error("Error creating user:", error);
        throw new AuthorizationError("Error creating user");
      }
    }

    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    session.set("userId", user.id);

    const cookie = await sessionStorage.commitSession(session);
    console.log("Committed cookie:", cookie);

    return redirect("/", {
      headers: { "Set-Cookie": cookie },
    });
  }
);

// Google strategy
const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  },
  async ({ profile, request }) => {
    const email = profile.emails[0].value as string;

    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      try {
        user = await db.user.create({
          data: {
            name: profile.name.givenName as string,
            email,
            provider: "google",
          },
        });
      } catch (error: any) {
        console.error("Error creating user:", error);
        throw new AuthorizationError("Error creating user");
      }
    }

    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    session.set("userId", user.id);

    const cookie = await sessionStorage.commitSession(session);
    console.log("Committed cookie:", cookie);

    return redirect("/", {
      headers: { "Set-Cookie": cookie },
    });
  }
);

// Use the strategies for GitHub and Google authentication
googleAuthenticator.use(googleStrategy, "google");
gitHubAuthenticator.use(gitHubStrategy, "github");

export { gitHubAuthenticator, googleAuthenticator };
