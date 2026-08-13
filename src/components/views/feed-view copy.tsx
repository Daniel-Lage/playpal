"use client";

import { useState } from "react";
import { TabLinkButton } from "../buttons/tab-link-button";
import { PageView } from "./page-view";
import type { SessionUser } from "~/models/user.model";

export function OtherFeedView({
  sessionUser,
  initialCollapsed,
  posts,
  playlists,
}: {
  sessionUser?: SessionUser;
  initialCollapsed: boolean;
  posts: React.ReactNode;
  playlists: React.ReactNode;
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
          {showPlaylists ? posts : playlists}
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
      {showPlaylists ? playlists : posts}
    </PageView>
  );
}
