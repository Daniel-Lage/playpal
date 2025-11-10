"use client";

import Link from "next/link";
import { SpotifyLink } from "~/components/spotify-link";
import type { UserObject } from "~/models/user.model";
import { FollowButton } from "./follow-button";
import { MenuView } from "~/components/menu-view";
import { signIn, signOut } from "next-auth/react";
import { Edit, LogOut, Trash } from "lucide-react";
import { ShareButton } from "~/components/buttons/share-button";
import { deleteUser } from "~/server/delete-user";
import { UserImage } from "~/components/user-image";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { MenuButton } from "~/components/buttons/menu-button";
import { LinkButton } from "~/components/buttons/link-button";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";

export function UserProfileView({
  user,
  sessionUserId,
}: {
  user: UserObject;
  sessionUserId: string | undefined;
}) {
  const router = useRouter();

  const scrollY = useRef(0);
  const [simple, setSimple] = useState(false);

  useEffect(() => {
    window.onscroll = () => {
      if (window.scrollY - 10 > scrollY.current) {
        scrollY.current = window.scrollY;
        setSimple(true);
      }
      if (window.scrollY + 10 < scrollY.current) {
        scrollY.current = window.scrollY;
        setSimple(false);
      }
    };
  }, []);

  if (!user?.name || !user.image) return;

  return (
    <>
      <div
        className={cn(
          simple ? "h-14" : "h-32",
          "fixed flex w-screen flex-col justify-center gap-2 overflow-hidden border-b-2 border-background bg-primary transition-all md:px-[calc(19vw_+_16px)]",
        )}
      >
        <div className="flex items-center gap-2 p-2">
          <Link className="flex grow items-center" href={`/user/${user.id}`}>
            <UserImage size={40} image={user.image} name={user.name} />

            <div className="grow px-2 font-bold hover:underline">
              {user.name}
            </div>
          </Link>
          <div>
            <FollowButton sessionUserId={sessionUserId} user={user} />
          </div>

          {user.id === sessionUserId &&
            (user.spotify_id ? (
              <SpotifyLink
                external_url={`https://open.spotify.com/user/${user.spotify_id}`}
              />
            ) : (
              <LinkButton onClick={() => signIn("spotify")}>
                Connect Spotify Account
              </LinkButton>
            ))}

          <MenuView>
            {user.id === sessionUserId ? (
              <>
                <MenuButton onClick={() => signOut()}>
                  <LogOut />
                  Log out
                </MenuButton>
                <MenuButton onClick={() => router.push("/setup")}>
                  <Edit />
                  Edit profile
                </MenuButton>
                <ConfirmDialog
                  onConfirm={() => {
                    void deleteUser(sessionUserId).then(() => router.push("/"));
                  }}
                  title="Delete Profile?"
                  description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
                >
                  <MenuButton>
                    <Trash />
                    Delete profile
                  </MenuButton>
                </ConfirmDialog>
              </>
            ) : (
              <></> // eventually add report user or block user options
            )}
            <ShareButton path={`/user/${user.id}`} title="profile" />
          </MenuView>
        </div>
        {!simple && (
          <div className="flex gap-2 pl-4 text-xs font-bold text-gray-700 md:text-base">
            <Link
              href={`/user/${user.id}/followers`}
              className="hover:underline"
            >
              {user.followers.length} followers
            </Link>

            <Link
              href={`/user/${user.id}/following`}
              className="hover:underline"
            >
              {user.following.length} following
            </Link>
          </div>
        )}
      </div>

      <div className="h-32"></div>
    </>
  );
}
