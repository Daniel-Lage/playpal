import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";
import { type PostInput } from "~/lib/types";
import { db } from "~/server/db";
import { postsTable } from "~/server/db/schema";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.sub) return NextResponse.json({ error: "Internal Server Error" });

  const { content } = (await req.json()) as PostInput;

  await db.insert(postsTable).values({ userId: token.sub, content });

  return new NextResponse("Success!", {
    status: 200,
  });
}
