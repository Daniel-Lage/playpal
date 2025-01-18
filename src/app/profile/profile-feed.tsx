import Image from "next/image";
import Link from "next/link";
import { PostType } from "~/models/post.model";
import { ProfileTab, UserObject } from "~/models/user.model";
import { PostCreator } from "../_components/post-creator";
import { Post } from "../_components/post";
import ProfilePlaylistFeed from "./profile-playlist-feed";

export default function ProfileFeed({
  sessionUserId,
  user,
  profileTab,
}: {
  sessionUserId: string | undefined;
  user: UserObject;
  profileTab: ProfileTab | undefined;
}) {
  if (profileTab === ProfileTab.Posts) {
    const posts = user.posts.filter((post) => post.type === PostType.Post);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-start gap-2 bg-main p-2 md:flex-row md:items-center md:rounded-b-2xl">
          <div className="font-bold">{posts.length} Posts</div>
        </div>

        {sessionUserId === user.id && (
          <div className="flex flex-col gap-2 bg-main p-2 md:rounded-xl">
            <div className="flex items-center justify-between">
              <Link className="flex items-center" href={"/profile"}>
                <Image
                  width={40}
                  height={40}
                  className="rounded-full"
                  src={user.image ?? ""}
                  alt={user.name ?? ""}
                />
                <div className="px-2 font-bold">{user.name}</div>
              </Link>
            </div>
            <div className="flex">
              <PostCreator sessionUserId={user.id} />
            </div>
          </div>
        )}
        {posts.map((post) => (
          <Post key={post.id} post={post} sessionUserId={sessionUserId} />
        ))}
      </div>
    );
  }

  if (profileTab === ProfileTab.PostsAndReplies)
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-start gap-2 bg-main p-2 md:flex-row md:items-center md:rounded-b-2xl">
          <div className="font-bold">{user.posts.length} Posts</div>
        </div>
        {user.posts.map((post) => (
          <Post key={post.id} post={post} sessionUserId={sessionUserId} />
        ))}
      </div>
    );

  if (profileTab === ProfileTab.Likes)
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-start gap-2 bg-main p-2 md:flex-row md:items-center md:rounded-b-2xl">
          <div className="font-bold">{user.likes.length} Likes</div>
        </div>
        {user.likes.map(
          (like) =>
            like?.likee && (
              <Post
                key={like.likee.id}
                post={like.likee}
                sessionUserId={sessionUserId}
              />
            ),
        )}
      </div>
    );

  if (profileTab === ProfileTab.Playlists)
    return <ProfilePlaylistFeed sessionUserId={sessionUserId} user={user} />;
}
