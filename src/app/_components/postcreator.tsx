"use client";

import { type Session } from "next-auth";
import { type PostInput } from "~/lib/types";
import { UserView } from "./userview";
import { useState } from "react";

export function PostCreator({ session }: { session: Session }) {
  const [input, setInput] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  async function sendPost(post: PostInput) {
    setIsPosting(true);
    const response = await fetch("/api/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });
    setIsPosting(false);
    if (response.ok) {
      setInput("");
    }
  }

  return (
    <UserView session={session}>
      <div className="flex grow">
        <input
          placeholder="Type something!"
          className="grow bg-transparent placeholder-slate-400 outline-none"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (input !== "") {
                void sendPost({ content: input });
              }
            }
          }}
          disabled={isPosting}
        />

        {input !== "" && !isPosting && (
          <button onClick={() => void sendPost({ content: input })}>
            Post
          </button>
        )}
      </div>
    </UserView>
  );
}
