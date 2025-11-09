"use client";

import Link from "next/link";
import { SpotifyLink } from "~/components/spotify-link";
import type { UserObject } from "~/models/user.model";
import { FollowButton } from "./follow-button";
import { MenuView } from "~/components/menu-view";
import { signIn, signOut } from "next-auth/react";
import { Edit, LogOut, Trash } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ShareButton } from "~/components/share-button";
import { deleteUser } from "~/server/delete-user";
import { UserImage } from "~/components/user-image";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "~/components/confirm-dialog";

export function UserProfileView({
  user,
  sessionUserId,
}: {
  user: UserObject;
  sessionUserId: string | undefined;
}) {
  const router = useRouter();
  if (!user?.name || !user.image) return;

  return (
    <div className="flex flex-col gap-2 overflow-hidden bg-primary">
      <div className="flex items-center gap-2 p-2">
        <Link className="flex grow items-center" href={`/user/${user.id}`}>
          <UserImage size={40} image={user.image} name={user.name} />

          <div className="grow px-2 font-bold hover:underline">{user.name}</div>
        </Link>
        <div>
          <FollowButton sessionUserId={sessionUserId} user={user} />
        </div>

        {user.spotify_id ? (
          <SpotifyLink
            external_url={`https://open.spotify.com/user/${user.spotify_id}`}
          />
        ) : (
          <Button size="default" onClick={() => signIn("spotify")}>
            Connect Spotify Account
          </Button>
        )}

        <MenuView>
          {user.id === sessionUserId ? (
            <>
              <Button size="select" onClick={() => signOut()}>
                Log out
                <LogOut />
              </Button>
              <Button size="select" onClick={() => router.push("/setup")}>
                Edit profile
                <Edit />
              </Button>
              <ConfirmDialog
                onConfirm={() => {
                  void deleteUser(sessionUserId).then(() => router.push("/"));
                }}
                title="Delete Profile?"
                description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
              >
                <Button size="select">
                  Delete profile
                  <Trash />
                </Button>
              </ConfirmDialog>
            </>
          ) : (
            <></> // eventually add report user or block user options
          )}
          <ShareButton path={`/user/${user.id}`} title="profile" />
        </MenuView>
      </div>
      <div className="flex gap-2 pl-4 text-xs font-bold text-gray-700 md:text-base">
        <Link href={`/user/${user.id}/followers`} className="hover:underline">
          {user.followers.length} followers
        </Link>

        <Link href={`/user/${user.id}/following`} className="hover:underline">
          {user.following.length} following
        </Link>
      </div>
    </div>
  );
}
