"use server";

import getMetaData from "metadata-scraper";
import type { PostObject, PostWithMetadata } from "~/models/post.model";

export async function formatPost(post: PostObject): Promise<PostWithMetadata> {
  const pattern =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

  const result = pattern.exec(post.content);

  if (!result) return post;

  return { ...post, metadata: await getMetaData(result[0]) };
}
