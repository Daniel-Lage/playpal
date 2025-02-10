"use client";

import Link from "next/link";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { IMetadata, Substring } from "~/models/post.model";

import { getMetadata } from "~/lib/get-metadata";
import Image from "next/image";
import type { User } from "next-auth";

export function PostCreator({
  send,
  sessionUser,
}: {
  send: (
    input: string,
    urls: Substring[] | undefined,
    metadata: IMetadata | undefined,
  ) => Promise<void>;
  sessionUser: User;
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

  async function handleSend() {
    setCanPost(false);

    await send(input, urls, metadata);

    setCanPost(true);
    setInput("");
  }

  return (
    <div className="flex flex-col gap-2 bg-main-1 p-2 md:rounded-md">
      <div className="flex items-center justify-between">
        <Link className="flex items-center" href={"/profile"}>
          <Image
            width={40}
            height={40}
            className="aspect-square rounded-full"
            src={sessionUser.image ?? ""}
            alt={sessionUser.name ?? ""}
          />
          <div className="px-2 font-bold">{sessionUser.name}</div>
        </Link>
      </div>
      <div className="flex grow flex-col">
        <TextInput
          input={input}
          urls={urls}
          send={handleSend}
          canPost={canPost}
          setInput={setInput}
        />
        <MetadataPreview
          url={urlForMetadata}
          metadata={metadata}
          loadingMetadata={loadingMetadata}
        />
      </div>
    </div>
  );
}

function FormattedContent({
  input,
  urls,
}: {
  input: string;
  urls?: Substring[];
}) {
  if (!urls) return <span className="whitespace-pre">{input}</span>;

  const content: JSX.Element[] = [];

  let contentIndex = 0;
  for (let index = 0; index < urls.length; index++) {
    const url = urls[index];
    if (url) {
      if (contentIndex != url.start) {
        const value = input.slice(contentIndex, url.start);
        content.push(
          <span className="whitespace-pre" key={index}>
            {value}
          </span>,
        );
      }

      const value = input.slice(url.start, url.start + url.length);
      content.push(
        <span key={index} className="whitespace-pre text-blue-700">
          {value}
        </span>,
      );
      contentIndex = url.start + url.length;

      if (index === urls.length - 1) {
        if (contentIndex !== input.length) {
          const value = input.slice(contentIndex);
          content.push(
            <span className="whitespace-pre" key={index}>
              {value}
            </span>,
          );
        }
      }
    }
  }

  return content;
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
        <div className="flex items-start gap-2 rounded-md bg-main-3 p-2 font-bold">
          Loading Metadata...
        </div>
      );
    if (metadata?.og_url)
      return (
        <Link
          href={metadata.og_url}
          className="flex items-start gap-2 rounded-md bg-main-3 p-2"
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

function TextInput({
  input,
  urls,
  canPost,
  send,
  setInput,
}: {
  input: string;
  urls?: Substring[];
  canPost: boolean;
  send: () => Promise<void>;
  setInput: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="flex grow overflow-hidden text-clip">
      <div className="relative flex h-10 w-full grow">
        <input
          placeholder="Type something!"
          className="absolute z-10 w-full select-text bg-transparent text-transparent placeholder-zinc-600 caret-black outline-none"
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
        />
        <FormattedContent input={input} urls={urls} />
      </div>
      {canPost && input !== "" && (
        <button onClick={() => void send()} className="pl-2 font-bold">
          Post
        </button>
      )}
    </div>
  );
}
