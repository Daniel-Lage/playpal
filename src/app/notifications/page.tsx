import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "~/lib/auth";
import { getNotifications } from "~/server/get-notifications";
import NotificationsView from "./notifications-view";
import { redirect } from "next/navigation";
import { PageView } from "~/components/page-view";

function storageKeyToCookieName(key: string) {
  return `playpal.${key.replaceAll(":", ".")}`;
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();

  if (!session) {
    redirect("/signin");
  }

  const initialCollapsed =
    cookieStore.get(
      storageKeyToCookieName(`${session.user.id}:side_bar_collapsed`),
    )?.value === "true";

  const notifications = await getNotifications(session.user.id);

  console.log("received notifications", notifications.length);
  for (const notification of notifications) {
    console.log(
      notification.type,
      notification.notifierId,
      notification.target ? notification.target.id : null,
    );
  }

  return (
    <PageView sessionUser={session?.user} initialCollapsed={initialCollapsed}>
      <NotificationsView
        notifications={notifications.sort((a, b) => {
          if (a.createdAt > b.createdAt) return -1;
          if (a.createdAt < b.createdAt) return 1;
          return 0;
        })}
        sessionUserId={session.user.id}
      />
    </PageView>
  );
}
