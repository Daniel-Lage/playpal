import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { getNotifications } from "~/server/get-notifications";
import NotificationsView from "./notifications-view";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div>
        <h1>Notifications</h1>
        <p>You must be logged in to view notifications.</p>
      </div>
    );
  }

  const notifications = await getNotifications(session.user.id);

  return (
    <NotificationsView
      notifications={notifications.sort((a, b) => {
        if (a.createdAt > b.createdAt) return -1;
        if (a.createdAt < b.createdAt) return 1;
        return 0;
      })}
      sessionUserId={session.user.id}
    />
  );
}
