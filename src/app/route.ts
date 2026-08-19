import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { authOptions } from "~/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (session == null)
    return NextResponse.redirect(
      new URL(`/signin`, process.env.NEXTAUTH_URL ?? req.url),
    );
  return NextResponse.redirect(
    new URL(`/home`, process.env.NEXTAUTH_URL ?? req.url),
  );
}
