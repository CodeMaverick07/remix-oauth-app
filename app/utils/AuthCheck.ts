import { loginAuthenticator } from "~/lib/extra/auth";
import { gitHubAuthenticator, googleAuthenticator } from "~/lib/extra/oAuth";

export const authChecker = async ({ request }: { request: Request }) => {
  let user = await googleAuthenticator.isAuthenticated(request);

  if (!user) {
    user = await loginAuthenticator.isAuthenticated(request);
  }

  if (!user) {
    user = await gitHubAuthenticator.isAuthenticated(request);
  }

  if (user) {
    return user;
  } else {
    return false;
  }
};
