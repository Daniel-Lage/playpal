import Image from "next/image";
import Link from "next/link";

export function SignInButton() {
  return (
    <Link
      href="/api/auth/signin"
      className="bg-main flex justify-center gap-4 p-4 font-bold md:rounded-2xl"
    >
      <Image height={40} width={40} src="/enter.png" alt="enter icon" />
    </Link>
  );
}
