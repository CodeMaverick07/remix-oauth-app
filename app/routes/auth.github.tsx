// routes/auth.github.tsx
import type { LoaderFunction } from "@remix-run/node";
import { gitHubAuthenticator } from "~/lib/oAuth.server";

export const loader: LoaderFunction = async ({ request }) => {
  // Redirects to GitHub for authorization
  return gitHubAuthenticator.authenticate("github", request, {
    successRedirect: "/", // Redirect to home on successful authentication
    failureRedirect: "/sign-in", // Redirect to sign-in on failure
  });
};
