import { Link, Form, useActionData } from "@remix-run/react";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "~/components/ui/card";

import {
  FormControl,
  FormMessage,
  FormItem,
  FormField,
} from "~/components/ui/form";

import * as z from "zod";
import { useForm, FormProvider } from "react-hook-form";
import {
  ActionFunction,
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { registerAuthenticator } from "~/lib/auth.server";
import { gitHubAuthenticator, googleAuthenticator } from "~/lib/oAuth.server";

const formSchema = z.object({
  name: z.string().min(3).max(20, "Name must be between 3 and 20 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const user = await registerAuthenticator.authenticate("form", request, {
    successRedirect: "/",
  });

  return user;
};
export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  let user = await googleAuthenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  if (!user) {
    user = await registerAuthenticator.isAuthenticated(request, {
      successRedirect: "/",
    });
  }

  if (!user) {
    user = await gitHubAuthenticator.isAuthenticated(request, {
      successRedirect: "/",
    });
  }

  console.log("Authenticated user:", user); // Log authenticated user

  if (user) {
    return user;
  } else {
    return { redirect: "/sign-in" };
  }
};

type ActionData = {
  formError?: {
    name?: { _errors: string[] };
    email?: { _errors: string[] };
    password?: { _errors: string[] };
  };
};

const SignUpCard = () => {
  const actionData: ActionData | undefined = useActionData();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  return (
    <FormProvider {...form}>
      <Card className="max-w-md p-8">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Use your email or another service to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-0 pb-0">
          <Form method="post" {...form} className="space-y-2.5">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="text" placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage>
                    {actionData?.formError?.name?._errors[0]}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="text" placeholder="email" {...field} />
                  </FormControl>
                  <FormMessage>
                    {actionData?.formError?.email?._errors[0]}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage>
                    {" "}
                    {actionData?.formError?.password?._errors[0]}
                  </FormMessage>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" size="lg">
              Continue
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
    </FormProvider>
  );
};

export default SignUpCard;
