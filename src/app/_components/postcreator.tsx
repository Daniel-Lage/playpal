"use client";

import type { Session } from "next-auth";
import { UserView } from "./userview";
import { useState } from "react";
import { postPost } from "~/server/queries";

export function PostCreator({ session }: { session?: Session | null }) {
  const [input, setInput] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  async function send() {
    if (!session) return;

    setIsPosting(true);

    postPost(input, session.user.id)
      .then(() => {
        setIsPosting(false);
        setInput("");
      })
      .catch(console.error);
  }

  return (
    <UserView session={session}>
      {session && (
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
        </div>
      )}
    </UserView>
  );
}
