"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import getMetaData, { type MetaData } from "metadata-scraper";

import { postPost } from "~/server/queries";

export function PostCreator({
  userId,
  thread,
}: {
  userId: string;
  thread?: string[];
}) {
  const [input, setInput] = useState("");

  const [link, setLink] = useState<MetaData>();

  useEffect(() => {
    const pattern =
      /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

    const result = pattern.exec(input);

    if (result) {
      fetch(result[0]).then((value) => console.log(value));
    }
  }, [input]);

  const [isPosting, setIsPosting] = useState(false);

  async function send() {
    setIsPosting(true);

    postPost(input, userId, thread)
      .then(() => {
        setIsPosting(false);
        setInput("");
      })
      .catch(console.error);
  }

  return (
    <div className="grow">
      <div className="flex grow">
        <input
          placeholder="Type something!"
          className="grow bg-transparent text-opacity-0 placeholder-zinc-600 outline-none"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();

              if (input !== "" && !isPosting) {
                void send();
              }
            }
          }}
          disabled={isPosting}
        />

        {input !== "" && !isPosting && (
          <button onClick={() => void send()} className="font-bold">
            Post
          </button>
        )}
      </div>

      {/* {!!content && <Link href={content.}>{content}</Link>} */}
    </div>
  );
}
