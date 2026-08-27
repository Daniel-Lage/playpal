import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "~/components/buttons/link-button";
import { OneElementView } from "~/components/one-element-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Playpal | Verify your email",
    description: "Check your inbox to continue with Playpal",
    openGraph: {
      type: "website",
      images: ["/favicon.ico"],
      url: `${process.env.NEXTAUTH_URL}/verify-email`,
    },
  };
}

export default async function VerifyEmailPage() {
  return (
    <OneElementView>
      <p className="p-2 text-xl font-bold">Check your email</p>
      <p>A sign in link has been sent to your email address.</p>
      <Link href="/">
        <LinkButton>Return</LinkButton>
      </Link>
    </OneElementView>
  );
}
