import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import PlaylistView from "./playlist-view";
import { SignInButton } from "~/app/_components/signin-button";

export default async function Playlist({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) return <SignInButton />;

  return <PlaylistView session={session} id={id} />;
}
