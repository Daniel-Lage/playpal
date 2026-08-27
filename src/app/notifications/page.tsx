import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { getNotifications } from "~/server/get-notifications";
import { redirect } from "next/navigation";

import { NotificationsView } from "~/components/views/notifications-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Playpal | Notifications",
    description: "Your recent Playpal notifications",
    openGraph: {
      type: "website",
      images: ["/favicon.ico"],
      url: `${process.env.NEXTAUTH_URL}/notifications`,
    },
  };
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
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
