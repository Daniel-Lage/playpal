"use client";

import type { User } from "next-auth";
import { PostsView } from "~/app/posts-view";
import type { IMetadata, PostObject, Substring } from "~/models/post.model";
import PlaylistsView from "./playlists-view";
import type { PlaylistObject } from "~/models/playlist.model";
import { useState } from "react";
import type { ActionStatus } from "~/models/status.model";
import { TabLinkButton } from "./buttons/tab-link-button";

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
    urls: Substring[] | undefined,
    metadata: IMetadata | undefined,
  ) => Promise<ActionStatus>;
  playlists: PlaylistObject[];
}) {
  const [showPlaylists, setShowPlaylists] = useState(false);

  return (
    <>
      <div className="left-0 h-16 w-screen gap-2 overflow-hidden border-b-2 border-background bg-primary px-2 md:px-[calc(19vw_+_16px)]">
        <div className="grid h-full w-full grid-cols-2 place-items-center gap-1 font-bold">
          <TabLinkButton
            className={showPlaylists ? "bg-primary" : "bg-primary-accent"}
            onClick={() => setShowPlaylists(false)}
          >
            Posts
          </TabLinkButton>

          <TabLinkButton
            className={!showPlaylists ? "bg-primary" : "bg-primary-accent"}
            onClick={() => setShowPlaylists(true)}
          >
            Playlists
          </TabLinkButton>
        </div>
      </div>
      <div>
        {showPlaylists ? (
          <PlaylistsView
            playlists={playlists}
            sessionUserId={sessionUser?.id}
          />
        ) : (
          <PostsView
            posts={posts}
            sessionUser={sessionUser}
            send={send}
            lastQueried={lastQueried}
            refresh={refresh}
          />
        )}
      </div>
    </>
  );
}
