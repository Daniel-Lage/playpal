import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function VerifyEmailPage() {
  return (
    <div className="grid h-screen w-full place-items-center">
      <div className="flex w-96 flex-col gap-4 rounded-md bg-primary p-8">
        <h1 className="p-2 text-xl font-bold">Check your email</h1>A sign in
        link has been sent to your email address.
        <Button variant={"link"}>
          <Link href={"/"}>Return</Link>
        </Button>
      </div>
    </div>
  );
}
