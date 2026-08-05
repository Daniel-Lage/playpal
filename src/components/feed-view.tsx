"use client";

import { PostFeedView } from "~/components/post-feed-view";
import type { IMetadata, PostObject } from "~/models/post.model";
import PlaylistFeedView from "./playlist-feed-view";
import type { PlaylistObject } from "~/models/playlist.model";
import { useState } from "react";
import type { ActionStatus } from "~/models/status.model";
import { TabLinkButton } from "./buttons/tab-link-button";
import { PageView } from "./page-view";
import type { SessionUser } from "~/models/user.model";

export function FeedView({
  posts,
  sessionUser,
  lastQueried,
  refresh,
  send,
  playlists,
  isOwnFeed = false,
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
}) {
  const [showPlaylists, setShowPlaylists] = useState(false);

  return (
    <PageView
      sessionUser={sessionUser}
      sideContent={
        <>
          <div className="p-2 text-xl font-bold">
            {showPlaylists ? "Posts" : "Playlists"}
          </div>
          {showPlaylists ? (
            <PostFeedView
              posts={posts}
              sessionUser={sessionUser}
              send={send}
              lastQueried={lastQueried}
              refresh={refresh}
            />
          ) : (
            <PlaylistFeedView
              playlists={playlists}
              sessionUser={sessionUser}
              isOwnFeed={isOwnFeed}
            />
          )}
        </>
      }
    >
      <div className="h-16 gap-2 overflow-hidden border-b px-2">
        <div className="grid h-full w-full grid-cols-2 place-items-center gap-1 font-bold">
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
      <div>
        {showPlaylists ? (
          <PlaylistFeedView
            playlists={playlists}
            sessionUser={sessionUser}
            isOwnFeed={isOwnFeed}
          />
        ) : (
          <PostFeedView
            posts={posts}
            sessionUser={sessionUser}
            send={send}
            lastQueried={lastQueried}
            refresh={refresh}
          />
        )}
      </div>
    </PageView>
  );
}
