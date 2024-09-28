"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  IMetadata,
  parentPostObject,
  Substring,
} from "~/models/post.model";

import { postPost } from "~/server/queries";
import { getMetadata } from "~/lib/get-metadata";
import Image from "next/image";

export function PostCreator({
  userId,
  parent,
}: {
  userId: string;
  parent?: parentPostObject;
}) {
  const [input, setInput] = useState("");
  const [canPost, setCanPost] = useState(true);

  const urls = useMemo(() => {
    setCanPost(false);

    const pattern = new RegExp(
      "(^|[ \t\r\n])((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))",
      "g",
    );

    const result = input.matchAll(pattern);

    const urls = [];

    for (const url of result) {
      urls.push({ start: url.index, length: url[0].length });
    }

    setCanPost(true);
    if (urls.length === 0) return;
    return urls as Substring[];
  }, [input]);

  const urlForMetadata = useMemo(() => {
    if (!urls) {
      return;
    }

    const urlStrings = urls.map((url) =>
      input.slice(url.start, url.start + url.length),
    );
    const url = urlStrings.find((url) => url.includes("http"));

    if (!url) {
      return;
    }

    return url;
  }, [urls, input]);

  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [metadata, setMetadata] = useState<IMetadata>();

  useEffect(() => {
    if (urlForMetadata) {
      setCanPost(false);
      setLoadingMetadata(true);
      getMetadata(urlForMetadata)
        .then((value) => {
          setMetadata(value);
          setLoadingMetadata(false);
          setCanPost(true);
        })
        .catch(console.error);
    }
  }, [urlForMetadata]);

  async function send() {
    setCanPost(false);

    postPost(input, userId, parent, urls, metadata)
      .then(() => {
        setCanPost(true);
        setInput("");
      })
      .catch(console.error);
  }

  return (
    <div className="flex grow flex-col gap-2">
      <div className="flex grow">
        <div className="flex grow">
          <div className="border-1 absolute grow border-red-500">
            {urls ? <FormattedContent input={input} urls={urls} /> : input}
          </div>

          <input
            placeholder="Type something!"
            className="z-10 grow select-text bg-transparent text-transparent placeholder-zinc-600 outline-none"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();

                if (input !== "" && canPost) {
                  void send();
                }
              }
            }}
            disabled={!canPost}
          />
        </div>

        {input !== "" && canPost && (
          <button onClick={() => void send()} className="font-bold">
            Post
          </button>
        )}
      </div>
      <MetadataPreview
        url={urlForMetadata}
        metadata={metadata}
        loadingMetadata={loadingMetadata}
      />
    </div>
  );
}

function FormattedContent({
  input,
  urls,
}: {
  input: string;
  urls: Substring[];
}) {
  const content: string[] = [];
  const urlIndexes = new Set<number>();

  let contentIndex = 0;
  for (let index = 0; index < urls.length; index++) {
    const url = urls[index];
    if (url) {
      if (contentIndex != url.start) {
        content.push(input.slice(contentIndex, url.start));
      }

      const slice = input.slice(url.start, url.start + url.length);
      content.push(slice);
      urlIndexes.add(content.length - 1);
      contentIndex = url.start + url.length;

      if (index === urls.length - 1) {
        if (contentIndex !== input.length) {
          const slice = input.slice(contentIndex);
          content.push(slice);
        }
      }
    }
  }

  return content.map((value, index) => {
    if (urlIndexes.has(index))
      return (
        <Link
          target="_blank"
          href={value}
          key={index}
          className="text-blue-700"
        >
          {value}
        </Link>
      );
    else return <span key={index}>{value}</span>;
  });
}

function MetadataPreview({
  url,
  metadata,
  loadingMetadata,
}: {
  url?: string;
  metadata?: IMetadata;
  loadingMetadata: boolean;
}) {
  if (url) {
    if (loadingMetadata)
      return (
        <div className="flex items-start gap-2 rounded-lg bg-main3 p-2 font-bold">
          Loading Metadata...
        </div>
      );
    if (metadata?.og_url)
      return (
        <Link
          href={metadata.og_url}
          className="flex items-start gap-2 rounded-lg bg-main3 p-2"
        >
          {metadata?.og_image && (
            <Image
              width={100}
              height={100}
              className="rounded-md"
              src={metadata?.og_image}
              alt={metadata.og_title ?? "image"}
            />
          )}
          <div className="grow overflow-hidden">
            <div className="w-full truncate text-left text-xl font-bold md:text-2xl">
              {metadata.og_title}
            </div>
            <div className="truncate text-left text-sm">
              {metadata.og_description}
            </div>
          </div>
        </Link>
      );
    return;
  }
}
