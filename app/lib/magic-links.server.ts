import Cryptr from "cryptr";
const cryptr = new Cryptr(process.env.CRYPTR_SECRET!);

type MagicPayload = { email: string; nonce: string; createAt: string };
export function generateMagicLink(email: string, nonce: string) {
  const payload: MagicPayload = {
    email,
    nonce,
    createAt: new Date().toISOString() as string,
  };
  const encryptedPayload = cryptr.encrypt(JSON.stringify(payload));
  const url = new URL(process.env.ORIGIN!);
  url.pathname = "/validate-magic-link";
  url.searchParams.set("magic", encryptedPayload);
  return url.toString();
}

export function generateMagicLinkPayload(request: Request) {
  const url = new URL(request.url);
  const magic = url.searchParams.get("magic") as string;
  const magicLinkPayload = JSON.parse(cryptr.decrypt(magic)) as MagicPayload;
  return magicLinkPayload;
}
