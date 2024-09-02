import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { SignInButton } from "~/app/_components/signin-button";
import { ProfileView } from "./profile-view";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) return <SignInButton />;

  return <ProfileView session={session} />;
}
