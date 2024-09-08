import { getServerSession } from "next-auth";

import { SignInButton } from "~/app/_components/signin-button";
import { authOptions } from "~/lib/auth";

import PlaylistView from "./playlist-view";

export default async function PlaylistPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) return <SignInButton />;

  return <PlaylistView session={session} id={id} />;
}
