"use server";

import type {
  IMetadata,
  PostObject,
  PostWithMetadata,
} from "~/models/post.model";
import parse from "node-html-parser";

export async function formatPost(post: PostObject): Promise<PostWithMetadata> {
  const pattern =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

  const result = pattern.exec(post.content);

  if (!result) return post;

  const res = await fetch(result[0]);
  const text = await res.text();
  const html = parse(text);

  const metadata: IMetadata = {};

  html.querySelectorAll("meta").forEach(({ rawAttributes }) => {
    if (rawAttributes.content) {
      const attribute = rawAttributes.name ?? rawAttributes.property;

      if (attribute) {
        const key = attribute.split(":");
        if (key[1]) {
          if (key[0] === "og") {
            if (key[1]) {
              if (key[1] === "title") metadata.title = rawAttributes.content;
              else if (key[1] === "description")
                metadata.description = rawAttributes.content;
              else if (key[1] === "url") metadata.url = rawAttributes.content;
              else if (key[1] === "image")
                metadata.image = rawAttributes.content;
            }
          }
        }
      }
    }
  });

  return { ...post, metadata: metadata };
}
