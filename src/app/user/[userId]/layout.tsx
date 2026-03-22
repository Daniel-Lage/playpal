import { getServerSession } from "next-auth";
import { UserProfileView } from "~/app/user/[userId]/user-profile-view";
import { authOptions } from "~/lib/auth";
import { getUser } from "~/server/get-user";
import { ProfileTabs } from "./profile-tabs";
import { PageView } from "~/components/page-view";
import { ErrorPage } from "~/app/error-page";

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
      <PageView sessionUser={session?.user}>
        <div className="flex flex-col bg-secondary">
          <UserProfileView
            user={user}
            sessionUserId={session?.user.id}
            providerAccountId={session?.user.providerAccountId}
          />

          <ProfileTabs userId={userId} />
        </div>
      </PageView>
      {children}
    </>
  );
}
