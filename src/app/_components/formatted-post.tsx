import { Post } from "./post";
import getMetaData from "metadata-scraper";
import type { PostObject } from "~/models/post.model";

export async function FormattedPost({
  post,
  userId,
  focused,
}: {
  post: PostObject;
  userId?: string;
  focused?: boolean;
}) {
  const pattern =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

  const result = pattern.exec(post.content);

  if (!result)
    return (
      <Post
        key={post.id}
        post={post}
        userId={userId}
        link={null}
        focused={focused}
      />
    );

  const metadata = await getMetaData(result[0]);

  return (
    <Post
      key={post.id}
      post={post}
      userId={userId}
      link={metadata}
      focused={focused}
    />
  );
}
