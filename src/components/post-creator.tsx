"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { type IMetadata } from "~/models/post.model";

import type { User } from "next-auth";
import { UserImage } from "./user-image";
import { ActionStatus } from "~/models/status.model";
import { LinkButton } from "./buttons/link-button";
import { type Content, EditorContent, useEditor } from "@tiptap/react";
import { getEditorExtensions } from "../lib/editor-extensions";
import { getUsersFollowing } from "~/server/get-users-following";
import { cn } from "~/lib/utils";
import { flattenContent } from "~/helpers/flatten-content";
import { getMetadataList } from "~/lib/get-metadata";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "./buttons/icon-button";

export function PostCreator({
  send,
  sessionUser,
  disabled,
  setStatus,
  isPrimaryColor = false,
}: {
  send: (
    input: string,
    mentions?: string[] | undefined,
    metadata?: IMetadata | undefined,
  ) => Promise<void>;
  sessionUser: User;
  disabled: boolean;
  setStatus: (
    value: ActionStatus | ((prevState: ActionStatus) => ActionStatus),
  ) => void;
  isPrimaryColor?: boolean;
}) {
  const [userList, setUserList] = useState<User[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [metadataList, setMetadataList] = useState<IMetadata[]>([]);
  const [metadataIndex, setMetadataIndex] = useState(0);

  const contentRef = useRef<Content>({});
  const mentionsRef = useRef<string[]>([]);
  const metadataRef = useRef<IMetadata>();

  useEffect(() => {
    getUsersFollowing(sessionUser.id)
      .then((follows) => {
        setUserList(
          follows.map((follow) => follow.followee).filter((user) => !!user),
        );
      })
      .catch((error) => console.error(error));
  }, [sessionUser.id]);

  useEffect(() => {
    metadataRef.current = metadataList[metadataIndex];
  }, [metadataList, metadataIndex]);

  useEffect(() => {
    if (urls) {
      setStatus(ActionStatus.Active);
      setLoadingMetadata(true);
      getMetadataList(urls)
        .then((value) => {
          setMetadataList(value);
          setLoadingMetadata(false);
          setStatus(ActionStatus.Inactive);
        })
        .catch(console.error);
    }
  }, [urls, setStatus]);

  const handleSend = useCallback(() => {
    if (contentRef.current?.length === 0 || disabled) return;
    void send(
      JSON.stringify(contentRef.current),
      mentionsRef.current,
      metadataRef.current,
    );
  }, [disabled, send]);

  const editor = useEditor(
    {
      editable: !disabled,
      extensions: getEditorExtensions(userList, handleSend),
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        const content = editor.getJSON();
        const flat = flattenContent(content);

        const urls = [];
        const mentions = [];

        for (const node of flat) {
          if (node.type === "mention") {
            mentions.push(node?.attrs?.id as string);
            urls.push(`https://playpal-fm.vercel.app/user/${node?.attrs?.id}`);
          }

          const link = node.marks?.find((mark) => mark.type === "link") as
            | {
                attrs: { href: string };
              }
            | undefined;

          if (link != null) {
            urls.push(link?.attrs?.href);
          }
        }

        setUrls(urls);
        mentionsRef.current = mentions;
        contentRef.current = editor.getJSON();
      },
    },
    [userList],
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-b-2 border-background bg-secondary px-2 pb-2",
        isPrimaryColor
          ? "border-b-2 border-background bg-primary"
          : "bg-secondary",
      )}
    >
      <div className="flex items-center">
        <Link
          className="flex h-12 w-12 items-center justify-center"
          href={`/user/${sessionUser.id}`}
        >
          <UserImage
            size={40}
            image={sessionUser.image}
            name={sessionUser.name}
          />
        </Link>
        <div className="px-2 font-bold">{sessionUser.name}</div>
      </div>
      <div className="flex grow flex-col gap-2">
        <EditorContent editor={editor} />

        <LinkButton
          className="self-end"
          disabled={disabled}
          onClick={handleSend}
        >
          Post
        </LinkButton>

        {urls.length != 0 && (
          <div className="flex w-full shrink items-center gap-2">
            <IconButton
              onClick={() => setMetadataIndex((prev) => prev - 1)}
              disabled={metadataIndex == 0}
              className={metadataIndex == 0 ? "[&_svg]:stroke-background" : ""}
            >
              <ChevronLeft />
            </IconButton>
            {loadingMetadata || metadataList[metadataIndex] == null ? (
              <div className="flex flex-1 items-start gap-2 rounded-md bg-secondary-accent p-2 font-bold">
                Loading Metadata...
              </div>
            ) : (
              <MetadataCard metadata={metadataList[metadataIndex]} />
            )}
            <IconButton
              onClick={() => setMetadataIndex((prev) => prev + 1)}
              disabled={metadataIndex == metadataList.length - 1}
              className={
                metadataIndex == metadataList.length - 1
                  ? "[&_svg]:stroke-background"
                  : ""
              }
            >
              <ChevronRight />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
}

/*
TODO:
get metadata from urls
show cards for each url and the information from the metadata (create card even if no details from metadata)
pick focused card for post display (and add 'scroll' to next card)
*/

export function MetadataCard({ metadata }: { metadata: IMetadata }) {
  return (
    <Link
      href={metadata?.og_url ?? ""}
      className="flex w-full flex-1 items-start gap-2 overflow-hidden rounded-md bg-secondary-accent p-2"
    >
      {metadata?.og_image && (
        <Image
          width={100}
          height={100}
          className="max-h-[100px] shrink-0 overflow-hidden"
          src={metadata?.og_image ?? ""}
          alt={metadata.og_title ?? "image"}
        />
      )}
      <div className="overflow-hidden">
        <div className="w-full truncate text-left text-xl font-bold md:text-2xl">
          {metadata.og_title ?? metadata.og_site_name}
        </div>
        <div className="truncate text-left text-sm">
          {metadata.og_description}
        </div>

        <div className="truncate text-left text-sm font-bold text-background">
          {metadata.og_url}
        </div>
      </div>
    </Link>
  );
}
