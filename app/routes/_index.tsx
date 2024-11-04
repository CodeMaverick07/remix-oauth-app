import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";

import { loginAuthenticator } from "~/lib/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};
export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const action = form.get("action");

  switch (action) {
    case "logout": {
      return loginAuthenticator.logout(request, { redirectTo: "/sign-in" });
    }
  }
}

export default function Index() {
  return <div className="">home</div>;
}
