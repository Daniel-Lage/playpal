import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { getNotifications } from "~/server/get-notifications";
import NotificationsView from "./notifications-view";
import { redirect } from "next/navigation";
import { PageView } from "~/components/page-view";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const notifications = await getNotifications(session.user.id);

  return (
    <PageView sessionUser={session?.user}>
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
