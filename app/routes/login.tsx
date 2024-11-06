import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { z } from "zod";
import { generateMagicLink } from "~/lib/magic-links.server";
import { validateForm } from "~/utils/validation";
import { v4 as uuid } from "uuid";

const loginSchema = z.object({
  loginEmail: z.string().email(),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  console.log(Object.fromEntries(formData));
  switch (action) {
    case "login": {
      return await validateForm(
        formData,
        loginSchema,
        ({ loginEmail }) => {
          const nonce = uuid();
          const link = generateMagicLink(loginEmail, nonce);
          console.log(link);
          return json(link);
        },
        (errors) => {
          console.log(errors);
          return json({ errors });
        }
      );
    }
  }
  return null;
}

const login = () => {
  return (
    <div>
      <Form
        method="post"
        className="flex justify-center flex-col gap-3 w-full h-screen items-center"
      >
        <input
          type="email"
          className="p-3 border-2 rounded-md w-full md:w-96"
          name="loginEmail"
          placeholder="email"
        />
        <button
          type="submit"
          name="action"
          value="login"
          className="bg-blue-400 w-full md:w-44 py-2 rounded-md text-xl font-semibold"
        >
          Login
        </button>
      </Form>
    </div>
  );
};

export default login;
