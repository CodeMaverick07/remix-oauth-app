// routes/auth.github.callback.tsx
import type { LoaderFunction } from "@remix-run/node";
import { gitHubAuthenticator } from "~/lib/oAuth.server";

export const loader: LoaderFunction = async ({ request }) => {
  // Completes GitHub OAuth on callback
  return gitHubAuthenticator.authenticate("github", request, {
    successRedirect: "/", // Where to redirect on success
    failureRedirect: "/sign-in", // Where to redirect if authentication fails
  });
};
