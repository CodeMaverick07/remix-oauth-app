import { ActionFunctionArgs } from "@remix-run/node";
import { gitHubAuthenticator, googleAuthenticator } from "~/lib/oAuth.server";

export async function loader({ params, request }: ActionFunctionArgs) {
  const value = params["*"];
  switch (value) {
    case "github": {
      return gitHubAuthenticator.authenticate("github", request, {
        successRedirect: "/", // Redirect to home on successful authentication
        failureRedirect: "/sign-in", // Redirect to sign-in on failure
      });
    }
    case "github/callback": {
      return gitHubAuthenticator.authenticate("github", request, {
        successRedirect: "/", // Where to redirect on success
        failureRedirect: "/sign-in", // Where to redirect if authentication fails
      });
    }
    case "google": {
      return googleAuthenticator.authenticate("google", request, {
        successRedirect: "/", // Redirect to home page on success
        failureRedirect: "/sign-in", // Redirect to sign-in on failure
      });
    }
    case "google/callback": {
      return googleAuthenticator.authenticate("google", request, {
        successRedirect: "/", // Redirect to home page on success
        failureRedirect: "/sign-in", // Redirect to sign-in on failure
      });
    }
  }
}
