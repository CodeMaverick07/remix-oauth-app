/* eslint-disable @typescript-eslint/no-explicit-any */
import { Authenticator, AuthorizationError } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { GoogleStrategy } from "remix-auth-google";
import { sessionStorage } from "./session.server";
import { db } from "./db.server";

const gitHubAuthenticator = new Authenticator(sessionStorage);
const googleAuthenticator = new Authenticator(sessionStorage);

const gitHubStrategy = new GitHubStrategy(
  {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    redirectURI: process.env.GITHUB_CALLBACK_URL!,
  },
  async ({ profile }) => {
    const user = await db.user.findUnique({
      // Make sure to await this
      where: {
        email: profile.emails[0].value as string,
      },
    });

    if (!user) {
      try {
        const newUser = await db.user.create({
          data: {
            name: profile.name.givenName as string,
            email: profile.emails[0].value as string,
            provider: "github",
          },
        });
        // Log the newly created user
        return newUser;
      } catch (error: any) {
        console.error("Error creating user:", error); // Log error for debugging
        throw new AuthorizationError(error);
      }
    } else {
      return user; // Return the existing user
    }
  }
);

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  },
  async ({ profile }) => {
    console.log(profile); // Log the profile to see the returned data
    const user = await db.user.findUnique({
      where: {
        email: profile.emails[0].value as string,
      },
    });
    if (!user) {
      try {
        const newUser = await db.user.create({
          data: {
            name: profile.name.givenName as string,
            email: profile.emails[0].value as string,
            provider: "google",
          },
        });
        return newUser; // Return the newly created user
      } catch (error: any) {
        console.error("Error creating user:", error); // Log error for debugging
        throw new AuthorizationError(error);
      }
    } else {
      return user; // Return the existing user
    }
  }
);

googleAuthenticator.use(googleStrategy, "google");
gitHubAuthenticator.use(gitHubStrategy, "github");

export { gitHubAuthenticator, googleAuthenticator };
