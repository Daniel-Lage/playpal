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
  providerAccountId,
}: {
  user: UserObject;
  sessionUserId: string | undefined;
  providerAccountId: string | null | undefined;
}) {
  const router = useRouter();

  const scrollY = useRef(0);
  const [simple, setSimple] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.scrollY - 10 > scrollY.current) {
        scrollY.current = window.scrollY;
        setSimple(true);
      }
      if (window.scrollY === 0) {
        scrollY.current = window.scrollY;
        setSimple(false);
      }
    });
  }, []);

  if (!user?.name || !user.image) return;

  return (
    <>
      <div
        className={cn(
          "flex h-14 flex-col justify-center gap-2 overflow-hidden border-b",
          simple ? "" : "absolute",
        )}
      ></div>
      <div
        className={cn(
          "flex h-14 flex-col justify-center gap-2 overflow-hidden border-b",
          simple
            ? "fixed top-0 w-[--main-view-w] bg-background"
            : "border-transparent",
        )}
      >
        <div className="flex items-center gap-2 p-2">
          <UserImage size={40} image={user.image} name={user.name} />

          <div className="grow px-2 font-bold">{user.name}</div>

          <div>
            <FollowButton sessionUserId={sessionUserId} user={user} />
          </div>

          {user.id === sessionUserId &&
            (providerAccountId != null ? (
              <SpotifyLink
                external_url={`https://open.spotify.com/user/${providerAccountId}`}
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
              <></> // TODO: add report user or block user options
            )}
            <ShareButton path={`/user/${user.id}`} title="profile" />
          </MenuView>
        </div>
      </div>
      <div className="flex gap-2 pl-4 text-xs font-bold text-muted-foreground md:text-base">
        <Link href={`/user/${user.id}/followers`} className="hover:underline">
          {user.followers.length} followers
        </Link>

        <Link href={`/user/${user.id}/following`} className="hover:underline">
          {user.following.length} following
        </Link>
      </div>
    </>
  );
}
