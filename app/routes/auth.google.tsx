// routes/auth.google.tsx
import type { LoaderFunction } from "@remix-run/node";
import { googleAuthenticator } from "~/lib/oAuth.server";
// Ensure you have imported your authenticator

export const loader: LoaderFunction = async ({ request }) => {
  // Initiates the Google OAuth process
  return googleAuthenticator.authenticate("google", request, {
    successRedirect: "/", // Redirect to home page on success
    failureRedirect: "/sign-in", // Redirect to sign-in on failure
  });
};
