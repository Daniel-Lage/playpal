import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { authOptions } from "~/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect(new URL(`/`, req.url));
  return NextResponse.redirect(new URL(`/user/${session.user.id}`, req.url));
}
