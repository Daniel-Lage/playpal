import Link from "next/link";
import { LinkButton } from "~/components/buttons/link-button";
import { OneElementView } from "~/components/one-element-view";

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
