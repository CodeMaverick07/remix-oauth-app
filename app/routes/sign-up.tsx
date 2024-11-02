/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, Form, useActionData } from "@remix-run/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "~/components/ui/card";

import * as z from "zod";

import {
  ActionFunction,
  ActionFunctionArgs,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { registerAuthenticator } from "~/lib/auth.server";
import { authChecker } from "~/utils/AuthCheck";
import { validateInput } from "~/lib/utils";
import { AuthorizationError } from "remix-auth";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(20, "Name must be between 3 and 20 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type actionDataInterface = {
  error?: string;
  errors?: Record<string, string>;
};

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const req = request.clone();
  const form = await req.formData();
  const name = form.get("name");
  const email = form.get("email");
  const password = form.get("password");

  try {
    const result = formSchema.safeParse({ name, email, password });
    if (result.success) {
      const user = await registerAuthenticator.authenticate("form", request, {
        successRedirect: "/",
        throwOnError: true,
      });
      return user;
    } else {
      console.log("into the error else");
      const errors = validateInput(result.error);
      return json(errors);
    }
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return json({ error: error.message }, { status: 401 });
    }
    console.log(error);
    return json({ error: "user alredy exits" });
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authChecker({ request });

  if (user) {
    return redirect("/");
  } else {
    return false;
  }
};

const SignUpCard = () => {
  const actionData: actionDataInterface | undefined = useActionData();
  console.log();
  return (
    <div className="w-screen flex justify-center items-center h-screen  bg-red-500">
      <Card className="max-w-md p-8">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Use your email or another service to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-0 pb-0">
          <Form method="post" className=" flex flex-col space-y-2">
            <div className="flex flex-col gap-1">
              {" "}
              <input
                type="text"
                name="name"
                className="bg-white border p-3 border-gray-300 focus:border-2 focus:border-black rounded-md outline-none"
                placeholder="name"
              />
              <div className="text-sm text-red-700">
                {actionData?.errors?.name}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {" "}
              <input
                type="email"
                name="email"
                placeholder="email"
                className="bg-white border p-3 border-gray-300 focus:border-2 focus:border-black rounded-md outline-none"
              />
              <div className="text-sm text-red-700">
                {actionData?.errors?.email}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {" "}
              <input
                type="password"
                name="password"
                placeholder="password"
                className="bg-white border p-3 border-gray-300 focus:border-black focus:border-2 rounded-md outline-none"
              />
              <div className="text-sm text-red-700">
                {actionData?.errors?.password}
              </div>
            </div>
            <div className="text-sm text-red-700">{actionData?.error}</div>

            <Button type="submit" variant="primary">
              Sign-up
            </Button>
          </Form>

          <Separator />

          <div className="flex flex-col gap-y-2.5">
            <Link to={"/auth/google"}>
              <Button variant="outline" size="lg" className="w-full relative">
                <FcGoogle className="mr-2 size-5 top-2.5 left-2.5 absolute" />
                Continue with Google
              </Button>
            </Link>
            <Link to={"/auth/github"}>
              <Button variant="outline" size="lg" className="w-full relative">
                <FaGithub className="mr-2 size-5 top-2.5 left-2.5 absolute" />
                Continue with Github
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/sign-in">
              <span className="text-sky-700 hover:underline">Sign in</span>
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpCard;
