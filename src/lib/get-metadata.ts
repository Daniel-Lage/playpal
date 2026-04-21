"use server";

import type { IMetadata } from "~/models/post.model";
import parse from "node-html-parser";

export async function getMetadataList(urls: string[]): Promise<IMetadata[]> {
  const urlMetadatas = urls.map(async (url) => {
    const res = await fetch(url);

    if (res.status != 200) {
      return { og_url: url };
    }

    const text = await res.text();
    const html = parse(text);

    const tags = html
      .querySelectorAll("meta")
      .map(({ rawAttributes: { name, property, content } }) => {
        const attribute = name ?? property;
        if (content && attribute)
          return [attribute.replace(":", "_"), content] as const;
        else return ["null", null] as const;
      })
      .filter((value) => value[1] != null);

    const metadata = Object.fromEntries(tags);

    metadata.og_url ??= url;

    return metadata;
  });
  return await Promise.all(urlMetadatas);
}
