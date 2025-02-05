import { getServerSession } from "next-auth";
import { SimpleUserView } from "~/app/profile/[profileId]/(user)/simple-user-view";
import { authOptions } from "~/lib/auth";
import { getUser } from "~/server/get-user";
import { ProfileTabs } from "./profile-tabs";

export default async function ProfileLayout({
  params,
  children,
}: {
  params: Promise<{ profileId: string }>;
  children: React.ReactNode;
}) {
  const { profileId } = await params;

  const session = await getServerSession(authOptions);

  const user = await getUser(profileId);

  if (!user)
    // no profile
    return <div className="self-center text-xl text-red-500">Error</div>;

  return (
    <div>
      <div className="flex flex-col gap-2 overflow-hidden bg-main-1 md:rounded-t-xl">
        <SimpleUserView user={user} sessionUserId={session?.user.id} />

        <ProfileTabs profileId={profileId} />
      </div>
      {children}
    </div>
  );
}
