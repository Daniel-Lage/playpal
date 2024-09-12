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

  const tags = html
    .querySelectorAll("meta")
    .map(({ rawAttributes: { name, property, content } }) => {
      const attribute = name ?? property;
      if (content && attribute)
        return [attribute.replace(":", "_") as PropertyKey, content] as const;
      else return ["null", null] as const;
    })
    .filter((value) => value[1] !== null);

  const metadata = Object.fromEntries(tags);

  console.log(metadata);

  return { ...post, urls, metadata: metadata as IMetadata };
}
