"use server";

import type {
  IMetadata,
  PostObject,
  PostWithMetadata,
} from "~/models/post.model";
import parse from "node-html-parser";

export async function formatPost(post: PostObject): Promise<PostWithMetadata> {
  const pattern = new RegExp(
    "(^|[ \t\r\n])((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))",
    "g",
  );

  const result = post.content.match(pattern);

  if (!result) return post;

  const urls = result.map((url) => ({ url, index: post.content.indexOf(url) }));

  const res = await fetch(result[0]);
  const text = await res.text();
  const html = parse(text);

  const metadata: any = {};

  html.querySelectorAll("meta").forEach(({ rawAttributes }) => {
    console.log(rawAttributes);
    if (rawAttributes.content) {
      const attribute = rawAttributes.name ?? rawAttributes.property;

      if (attribute) {
        const keys = attribute.split(":");
        let target = metadata;
        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            target[key] = rawAttributes.content;
          } else {
            if (!target[key]) {
              target[key] = {};
            } else if (typeof target[key] !== "object") {
              key = keys.slice(index).join("_");
              target[key] = {};
            }
            target = target[key];
          }
        });
      }
    }
  });

  return { ...post, urls, metadata: metadata as IMetadata };
}
