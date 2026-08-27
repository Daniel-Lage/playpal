import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { SignInView } from "~/components/views/signin-view";
import { authOptions } from "~/lib/auth";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Playpal | Sign In",
    description: "Sign in to Playpal",
    openGraph: {
      type: "website",
      images: ["/favicon.ico"],
      url: `${process.env.NEXTAUTH_URL}/signin`,
    },
  };
}

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <SignInView />;
  if (session?.user?.name && session?.user?.image) redirect("/");
  redirect("/setup");
}
