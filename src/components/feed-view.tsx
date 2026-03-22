"use client";

import type { User } from "next-auth";
import { PostFeedView } from "~/components/post-feed-view";
import type { IMetadata, PostObject } from "~/models/post.model";
import PlaylistFeedView from "./playlist-feed-view";
import type { PlaylistObject } from "~/models/playlist.model";
import { useState } from "react";
import type { ActionStatus } from "~/models/status.model";
import { TabLinkButton } from "./buttons/tab-link-button";
import { PageView } from "./page-view";

export function FeedView({
  posts,
  sessionUser,
  lastQueried,
  refresh,
  send,
  playlists,
}: {
  posts: PostObject[];
  lastQueried: Date;
  sessionUser?: User | undefined;
  refresh: (lastQueried: Date) => Promise<PostObject[]>;
  send?: (
    input: string,
    mentions: string[] | undefined,
    metadata: IMetadata | undefined,
  ) => Promise<ActionStatus>;
  playlists: PlaylistObject[];
}) {
  const [showPlaylists, setShowPlaylists] = useState(false);

  return (
    <PageView
      sideContent={
        <>
          <div className="bg-primary p-2 text-xl font-bold">
            {showPlaylists ? "Posts" : "Playlists"}
          </div>
          {showPlaylists ? (
            <PostFeedView
              posts={posts}
              sessionUser={sessionUser}
              send={send}
              lastQueried={lastQueried}
              refresh={refresh}
              isPrimaryColor={true}
            />
          ) : (
            <PlaylistFeedView
              playlists={playlists}
              sessionUserId={sessionUser?.id}
              isPrimaryColor={true}
            />
          )}
        </>
      }
    >
      <div className="h-16 gap-2 overflow-hidden border-b-2 border-background bg-secondary px-2">
        <div className="grid h-full w-full grid-cols-2 place-items-center gap-1 font-bold">
          <TabLinkButton
            className={showPlaylists ? "bg-secondary" : "bg-secondary-accent"}
            onClick={() => setShowPlaylists(false)}
          >
            Posts
          </TabLinkButton>

          <TabLinkButton
            className={!showPlaylists ? "bg-secondary" : "bg-secondary-accent"}
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
            sessionUserId={sessionUser?.id}
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
