import { Link, useActionData, Form } from "@remix-run/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionFunction,
  ActionFunctionArgs,
  LoaderFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import { loginAuthenticator, registerAuthenticator } from "~/lib/auth.server";
import { gitHubAuthenticator, googleAuthenticator } from "~/lib/oAuth.server";

type ActionData = {
  formError?: {
    email?: { _errors: string[] };
    password?: { _errors: string[] };
  };
};

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const user = loginAuthenticator.authenticate("form", request, {
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

const SignInCard = () => {
  const actionData: ActionData | undefined = useActionData();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <FormProvider {...form}>
      <Card className="max-w-md p-8">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Login to continue</CardTitle>
          <CardDescription>
            Use your email or another service to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-0 pb-0">
          {/* Using Remix's Form component */}
          <Form method="post" className="space-y-2.5">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Email" type="text" {...field} />
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
                    <Input placeholder="Password" type="password" {...field} />
                  </FormControl>
                  <FormMessage>
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
            Don&apos;t have an account?{" "}
            <Link to="/sign-up">
              <span className="text-sky-700 hover:underline">Sign up</span>
            </Link>
          </p>
        </CardContent>
      </Card>
    </FormProvider>
  );
};

export default SignInCard;
