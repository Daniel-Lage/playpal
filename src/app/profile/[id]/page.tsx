import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { SignInButton } from "~/app/_components/signin-button";
import { ProfileView } from "../profile-view";
import { getUserFromSpotifyUserId } from "~/server/queries";

export default async function Profile({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) return <SignInButton />;

  if (session.user.providerAccountId === id)
    return <ProfileView session={session} />;

  const user = await getUserFromSpotifyUserId(id);

  return <ProfileView session={session} user={user} />;
}
