"use server";

import type { IMetadata } from "~/models/post.model";
import parse from "node-html-parser";

export async function getMetadata(url: string): Promise<IMetadata> {
  const res = await fetch(url);
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

  console.log(text);

  return metadata as IMetadata;
}
