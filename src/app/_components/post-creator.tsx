"use client";

import type { Session } from "next-auth";
import { useState } from "react";

import { postPost } from "~/server/queries";

export function PostCreator({
  userId,
  thread,
}: {
  userId: string;
  thread?: string[];
}) {
  const [input, setInput] = useState("");
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
    <>
      <input
        placeholder="Type something!"
        className="grow bg-transparent placeholder-zinc-600 outline-none"
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
        <button onClick={() => void send()}>Post</button>
      )}
    </>
  );
}
