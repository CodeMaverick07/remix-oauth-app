import {
  commitSession,
  sessionStorage as newSession,
} from "~/lib/extra/session";

export async function setSession(data: string, request: Request) {
  const session = await newSession.getSession(request.headers.get("Cookie"));
  session.set("userId", data);
  await commitSession(session);
}
