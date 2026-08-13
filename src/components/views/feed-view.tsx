"use client";

import { PostFeedView } from "~/components/views/post-feed-view";
import type {
  IMetadata,
  PostObject,
  PostsSortingColumn,
} from "~/models/post.model";
import type {
  PlaylistObject,
  PlaylistsSortingColumn,
} from "~/models/playlist.model";
import { useState } from "react";
import type { ActionStatus } from "~/models/status.model";
import { TabLinkButton } from "../buttons/tab-link-button";
import { PageView } from "./page-view";
import type { SessionUser } from "~/models/user.model";
import PlaylistFeedView from "./playlist-feed-view";

export function FeedView({
  posts,
  sessionUser,
  lastQueried,
  refresh,
  send,
  playlists,
  isOwnFeed = false,
  initialCollapsed,
  initialPostsReversed,
  initialPostsSortingColumn,
  initialPlaylistsReversed,
  initialPlaylistsSortingColumn,
}: {
  posts: PostObject[];
  lastQueried: Date;
  sessionUser?: SessionUser;
  refresh: (lastQueried: Date) => Promise<PostObject[]>;
  send?: (
    input: string,
    mentions: string[] | undefined,
    metadata: IMetadata | undefined,
  ) => Promise<ActionStatus>;
  playlists: PlaylistObject[];
  isOwnFeed?: boolean;

  initialCollapsed: boolean;
  initialPostsReversed: boolean;
  initialPostsSortingColumn: PostsSortingColumn;
  initialPlaylistsReversed: boolean;
  initialPlaylistsSortingColumn: PlaylistsSortingColumn;
}) {
  const [showPlaylists, setShowPlaylists] = useState(false);

  return (
    <PageView
      sessionUser={sessionUser}
      initialCollapsed={initialCollapsed}
      sideContent={
        <>
          <div className="bg-container p-2 pt-12 text-xl font-bold">
            {showPlaylists ? "Posts" : "Playlists"}
          </div>
          {showPlaylists ? (
            <PostFeedView
              posts={posts}
              sessionUser={sessionUser}
              send={send}
              lastQueried={lastQueried}
              refresh={refresh}
              initialReversed={initialPostsReversed}
              initialSortingColumn={initialPostsSortingColumn}
            />
          ) : (
            <PlaylistFeedView
              playlists={playlists}
              sessionUser={sessionUser}
              isOwnFeed={isOwnFeed}
              initialReversed={initialPlaylistsReversed}
              initialSortingColumn={initialPlaylistsSortingColumn}
            />
          )}
        </>
      }
    >
      <div className="h-16 gap-2 border-b">
        <div className="grid h-full w-full grid-cols-2 place-items-center gap-1 bg-container px-2 font-bold">
          <TabLinkButton
            className={!showPlaylists ? "border" : ""}
            onClick={() => setShowPlaylists(false)}
          >
            Posts
          </TabLinkButton>

          <TabLinkButton
            className={showPlaylists ? "border" : ""}
            onClick={() => setShowPlaylists(true)}
          >
            Playlists
          </TabLinkButton>
        </div>
      </div>
      {showPlaylists ? (
        <PlaylistFeedView
          playlists={playlists}
          sessionUser={sessionUser}
          isOwnFeed={isOwnFeed}
          initialReversed={initialPlaylistsReversed}
          initialSortingColumn={initialPlaylistsSortingColumn}
        />
      ) : (
        <PostFeedView
          posts={posts}
          sessionUser={sessionUser}
          send={send}
          lastQueried={lastQueried}
          refresh={refresh}
          initialReversed={initialPostsReversed}
          initialSortingColumn={initialPostsSortingColumn}
        />
      )}
    </PageView>
  );
}
