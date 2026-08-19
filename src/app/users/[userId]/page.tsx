import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

import { getPosts } from "~/server/get-posts";
import { authOptions } from "~/lib/auth";
import { type IMetadata } from "~/models/post.model";
import { postPost } from "~/server/post-post";
import { revalidatePath } from "next/cache";
import { ActionStatus } from "~/models/status.model";
import {
  parseBooleanCookie,
  parsePostsSortingColumnCookie,
} from "~/helpers/parse-cookie";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";
import { PostFeedView } from "~/components/views/post-feed-view";
import { TabLinkButton } from "~/components/buttons/tab-link-button";

export const dynamic = "force-dynamic";

export default async function UsersMainPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);

  const cookiePrefix = getCookiePrefix(session?.user.id);

  const cookieStore = cookies();
  const posts = await getPosts({ userIds: [userId] });
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
          <TabLinkButton className="border" href={`/users/${userId}`}>
            Posts
          </TabLinkButton>

          <TabLinkButton href={`/users/${userId}/playlists`}>
            Playlists
          </TabLinkButton>
        </div>
      </div>
      <PostFeedView
        posts={posts}
        sessionUser={session?.user}
        send={
          session?.user.id === userId
            ? async (
                input: string,
                mentions: string[] | undefined,
                metadata: IMetadata | undefined,
              ) => {
                "use server";

                if (!session?.user) return ActionStatus.Failure;

                const status = await postPost(
                  input,
                  session?.user.id,
                  mentions,
                  metadata,
                );

                revalidatePath("/");

                return status;
              }
            : undefined
        }
        lastQueried={new Date()}
        refresh={async (lastQueried: Date) => {
          "use server";
          return await getPosts({ userIds: [userId], lastQueried });
        }}
        initialReversed={initialPostsReversed}
        initialSortingColumn={initialPostsSortingColumn}
      />
    </>
  );
}
