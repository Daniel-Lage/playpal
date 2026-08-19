import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { getUser } from "~/server/get-user";
import { authOptions } from "~/lib/auth";

import { getUsersLikes } from "~/server/get-users-likes";
import { cookies } from "next/headers";
import {
  parseBooleanCookie,
  parsePostsSortingColumnCookie,
} from "~/helpers/parse-cookie";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";
import { PostFeedView } from "~/components/views/post-feed-view";
import { TabLinkButton } from "~/components/buttons/tab-link-button";

export async function generateMetadata({
  params: { userId },
}: {
  params: { userId: string };
}): Promise<Metadata> {
  const user = await getUser(userId);

  if (!user)
    return {
      title: "PlayPal | Profile",
      openGraph: {
        title: "PlayPal | Profile",
        type: "profile",
        images: ["/favicon.ico"],
        url: `${process.env.NEXTAUTH_URL}/profile`,
      },
    };

  if (!user.image)
    return {
      title: `Playpal | ${user.name}`,
      openGraph: {
        title: `Playpal | ${user.name}`,
        type: "profile",
        images: ["/favicon.ico"],
        url: `${process.env.NEXTAUTH_URL}/profile`,
      },
    };

  return {
    title: `Playpal | ${user.name}`,
    openGraph: {
      title: `Playpal | ${user.name}`,
      images: [user.image],
      type: "profile",
      url: `${process.env.NEXTAUTH_URL}/users/${userId}`,
    },
  };
}

export default async function LikesPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);

  const cookiePrefix = getCookiePrefix(session?.user.id);

  const { posts } = await getUsersLikes(userId);
  const cookieStore = cookies();

  const initialPostsReversed = parseBooleanCookie(
    cookieStore.get(`${cookiePrefix}posts_reversed`)?.value,
  );

  const initialPostsSortingColumn = parsePostsSortingColumnCookie(
    cookieStore.get(`${cookiePrefix}posts_sorting_column`)?.value,
  );

  return (
    <>
      <div className="h-16 gap-2 border-b">
        <div className="grid h-full w-full grid-cols-2 place-items-center gap-1 bg-container px-2 font-bold">
          <TabLinkButton className="border" href={`/users/${userId}/likes`}>
            Posts
          </TabLinkButton>

          <TabLinkButton href={`/users/${userId}/likes/playlists`}>
            Playlists
          </TabLinkButton>
        </div>
      </div>
      <PostFeedView
        posts={posts}
        sessionUser={session?.user}
        lastQueried={new Date()}
        refresh={async (lastQueried: Date) => {
          "use server";
          const { posts } = await getUsersLikes(userId, lastQueried);
          return posts;
        }}
        initialReversed={initialPostsReversed}
        initialSortingColumn={initialPostsSortingColumn}
      />
    </>
  );
}
