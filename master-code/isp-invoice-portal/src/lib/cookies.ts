import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  return session ? JSON.parse(session) : null;
}
