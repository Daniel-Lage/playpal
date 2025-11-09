"use client";

import React, { useState } from "react";
import { LogIn } from "lucide-react";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Input } from "~/components/ui/input";

export function SignInView() {
  const [email, setEmail] = useState("");

  return (
    <div className="grid h-screen w-full place-items-center">
      <div className="flex w-96 flex-col gap-4 rounded-md bg-primary p-8">
        <h1 className="p-2 text-xl font-bold">Sign-In</h1>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />

        <Button
          size="nav"
          variant="login"
          onClick={() => signIn("email", { email })}
        >
          <LogIn />
          <div className="text-lg font-bold">Sign in with Email</div>
        </Button>

        <div className="relative my-4 h-[2px] w-full bg-black text-center">
          <span className="absolute top-[-0.7rem] self-center bg-primary px-1">
            or
          </span>
        </div>

        <Button size="nav" variant="login" onClick={() => signIn("spotify")}>
          <Image
            height={24}
            width={24}
            src="/spotify-icon.svg"
            alt="spotify icon"
          />
          <div className="text-lg font-bold">Sign In with Spotify</div>
        </Button>
      </div>
    </div>
  );
}
