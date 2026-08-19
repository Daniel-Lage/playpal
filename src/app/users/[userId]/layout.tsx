import { getServerSession } from "next-auth";
import { UserProfileView } from "~/components/views/user-profile-view";
import { authOptions } from "~/lib/auth";
import { getUser } from "~/server/get-user";
import { ErrorPage } from "~/components/error-page";
import { ProfileTabs } from "~/components/profile-tabs";

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

  if (!user) return <ErrorPage />;

  return (
    <>
      <UserProfileView
        user={user}
        sessionUserId={session?.user.id}
        providerAccountId={session?.user.providerAccountId}
      />

      <ProfileTabs userId={userId} />
      {children}
    </>
  );
}
