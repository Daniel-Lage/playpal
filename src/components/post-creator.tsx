"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type IMetadata, type Substring } from "~/models/post.model";

import { getMetadata } from "~/lib/get-metadata";
import Image from "next/image";
import type { User } from "next-auth";
import { UserImage } from "./user-image";
import { ActionStatus } from "~/models/status.model";
import { LinkButton } from "./buttons/link-button";

export function PostCreator({
  send,
  sessionUser,
  disabled,
  setStatus,
}: {
  send: (
    input: string,
    urls: Substring[] | undefined,
    metadata: IMetadata | undefined,
  ) => Promise<void>;
  sessionUser: User;
  disabled: boolean;
  setStatus: (
    value: ActionStatus | ((prevState: ActionStatus) => ActionStatus),
  ) => void;
}) {
  const [input, setInput] = useState("");

  const urls = useMemo(() => {
    const pattern = new RegExp(
      "(^|[ \t\r\n])((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))",
      "g",
    );

    const result = input.matchAll(pattern);

    const urls = [];

    for (const url of result) {
      urls.push({ start: url.index, length: url[0].length });
    }

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
      setStatus(ActionStatus.Active);
      setLoadingMetadata(true);
      getMetadata(urlForMetadata)
        .then((value) => {
          setMetadata(value);
          setLoadingMetadata(false);
          setStatus(ActionStatus.Inactive);
        })
        .catch(console.error);
    }
  }, [urlForMetadata, setStatus]);

  const handleSend = useCallback(() => {
    if (input === "") return;
    if (disabled) return;
    setInput("");
    void send(input, urls, metadata);
  }, [input, disabled, send, metadata, urls]);

  return (
    <div className="flex flex-col gap-2 border-b-2 border-background bg-primary p-2 md:px-[calc(19vw_+_16px)]">
      <div className="flex items-center justify-between">
        <Link className="flex items-center" href={`/user/${sessionUser.id}`}>
          <UserImage
            size={40}
            image={sessionUser.image}
            name={sessionUser.name}
          />
          <div className="px-2 font-bold">{sessionUser.name}</div>
        </Link>
      </div>
      <div className="flex grow flex-col">
        <TextInput
          input={input}
          urls={urls}
          send={handleSend}
          setInput={setInput}
        />
        <MetadataPreview
          url={urlForMetadata}
          metadata={metadata}
          loadingMetadata={loadingMetadata}
        />
        <LinkButton
          className="self-end"
          disabled={input === "" || disabled}
          onClick={handleSend}
        >
          Post
        </LinkButton>
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
        <div className="flex items-start gap-2 rounded-md bg-primary-accent p-2 font-bold">
          Loading Metadata...
        </div>
      );
    if (metadata?.og_url)
      return (
        <Link
          href={metadata.og_url}
          className="flex items-start gap-2 rounded-md bg-primary-accent p-2"
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
  send,
  setInput,
}: {
  input: string;
  urls?: Substring[];
  send: () => void;
  setInput: (isLiked: string) => void;
}) {
  return (
    <div className="flex h-[2em] grow overflow-hidden text-clip">
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

              send();
            }
          }}
        />
        <FormattedContent input={input} urls={urls} />
      </div>
    </div>
  );
}
