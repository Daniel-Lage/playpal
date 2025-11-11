import { getServerSession } from "next-auth";
import { UserProfileView } from "~/app/user/[userId]/user-profile-view";
import { authOptions } from "~/lib/auth";
import { getUser } from "~/server/get-user";
import { ProfileTabs } from "./profile-tabs";

export default async function ProfileLayout({
  params,
  children,
}: {
  params: Promise<{ userId: string }>;
  children: React.ReactNode;
}) {
  const { userId } = await params;

  const session = await getServerSession(authOptions);

  const user = await getUser(userId);

  if (!user)
    // no profile
    return <div className="self-center text-xl text-secondary">Error</div>;

  return (
    <>
      <div className="flex flex-col bg-primary">
        <UserProfileView user={user} sessionUserId={session?.user.id} />

        <ProfileTabs userId={userId} />
      </div>
      {children}
    </>
  );
}
