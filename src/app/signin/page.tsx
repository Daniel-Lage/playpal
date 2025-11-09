import { getServerSession } from "next-auth";
import { SignInView } from "./signin-view";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <SignInView />;
  if (session?.user?.name && session?.user?.image) redirect("/");
  redirect("/setup");
}
