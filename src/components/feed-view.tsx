"use client";

import type { User } from "next-auth";
import { PostsView } from "~/app/posts-view";
import type {
  IMetadata,
  PostObject,
  postPostStatus,
  Substring,
} from "~/models/post.model";
import PlaylistsView from "./playlists-view";
import type { PlaylistObject } from "~/models/playlist.model";
import { Button } from "~/components/ui/button";
import { useState } from "react";

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
  ) => Promise<postPostStatus>;
  playlists: PlaylistObject[];
}) {
  const [showPlaylists, setShowPlaylists] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 overflow-hidden rounded-md bg-primary">
        <div className="grid grid-cols-2 gap-1 p-2 font-bold">
          <Button
            variant="link"
            size="tab"
            onClick={() => setShowPlaylists(false)}
            className={showPlaylists ? "bg-primary" : "bg-primary-accent"}
          >
            Posts
          </Button>
          <Button
            variant="link"
            onClick={() => setShowPlaylists(true)}
            size="tab"
            className={showPlaylists ? "bg-primary-accent" : "bg-primary"}
          >
            Playlists
          </Button>
        </div>
      </div>
      {showPlaylists ? (
        <PlaylistsView playlists={playlists} sessionUserId={sessionUser?.id} />
      ) : (
        <PostsView
          posts={posts}
          sessionUser={sessionUser}
          send={send}
          lastQueried={lastQueried}
          refresh={refresh}
        />
      )}
    </>
  );
}
