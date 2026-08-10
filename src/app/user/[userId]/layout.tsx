import { getServerSession } from "next-auth";
import { UserProfileView } from "~/app/user/[userId]/user-profile-view";
import { authOptions } from "~/lib/auth";
import { getUser } from "~/server/get-user";
import { ProfileTabs } from "./profile-tabs";
import { PageView } from "~/components/page-view";
import { ErrorPage } from "~/app/error-page";
import { cookies } from "next/headers";

function storageKeyToCookieName(key: string) {
  return `playpal.${key.replaceAll(":", ".")}`;
}

export default async function ProfileLayout({
  params,
  children,
}: {
  params: Promise<{ userId: string }>;
  children: React.ReactNode;
}) {
  const { userId } = await params;

  const session = await getServerSession(authOptions);
  const cookieStore = cookies();

  const user = await getUser(userId);

  if (!user) return <ErrorPage />;

  const initialCollapsed =
    cookieStore.get(
      storageKeyToCookieName(`${session?.user.id}:side_bar_collapsed`),
    )?.value === "true";

  return (
    <>
      <PageView sessionUser={session?.user} initialCollapsed={initialCollapsed}>
        <div className="flex flex-col">
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
