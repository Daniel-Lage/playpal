import Link from "next/link";
import { LinkButton } from "~/components/buttons/link-button";
import { OneElementView } from "~/components/one-element-view";

export default async function VerifyEmailPage() {
  return (
    <OneElementView>
      <h1 className="p-2 text-xl font-bold">Check your email</h1>A sign in link
      has been sent to your email address.
      <Link href="/">
        <LinkButton>Return</LinkButton>
      </Link>
    </OneElementView>
  );
}
