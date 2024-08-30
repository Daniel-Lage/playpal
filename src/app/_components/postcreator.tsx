"use client";

import type { Session } from "next-auth";
import { useState } from "react";
import { postPost } from "~/server/queries";
import Link from "next/link";
import Image from "next/image";

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

  if (!session?.user?.image || !session?.user?.name)
    return (
      <Link
        href="/api/auth/signin"
        className="bg-main1 flex justify-center gap-4 rounded-2xl p-4 font-bold"
      >
        <Image height={32} width={32} src="/enter.svg" alt="enter icon" />
      </Link>
    );

  return (
    <div className="bg-main1 flex flex-col gap-2 p-2 md:rounded-xl">
      <div className="flex items-center">
        <Image
          width={40}
          height={40}
          className="rounded-full"
          src={session.user.image}
          alt={session.user.name}
        />
        <div className="grow px-2 font-bold">{session.user.name}</div>

        <Link href="/api/auth/signout">
          <Image height={32} width={32} src="/exit.svg" alt="exit icon" />
        </Link>
      </div>
      <div className="flex">
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
      </div>
    </div>
  );
}
