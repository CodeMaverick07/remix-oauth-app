// routes/auth.google.callback.tsx
import type { LoaderFunction } from "@remix-run/node";
import { googleAuthenticator } from "~/lib/oAuth.server";

export const loader: LoaderFunction = async ({ request }) => {
  // Completes the Google OAuth process
  return googleAuthenticator.authenticate("google", request, {
    successRedirect: "/", // Redirect to home page on success
    failureRedirect: "/sign-in", // Redirect to sign-in on failure
  });
};
