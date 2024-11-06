import { json, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { generateMagicLinkPayload } from "~/lib/magic-links.server";

export const loader: LoaderFunction = ({ request }: LoaderFunctionArgs) => {
  const magicLinkPayload = generateMagicLinkPayload(request);
  console.log(magicLinkPayload);
  return json("ok");
};
