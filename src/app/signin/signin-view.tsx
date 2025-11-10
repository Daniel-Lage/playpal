"use client";

import React, { useState } from "react";
import { LogIn } from "lucide-react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Input } from "~/components/ui/input";
import { FormButton } from "~/components/buttons/form-button";
import { OneElementView } from "~/components/one-element-view";

export function SignInView() {
  const [email, setEmail] = useState("");

  return (
    <OneElementView>
      <h1 className="p-2 text-xl font-bold">Sign-In</h1>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />

      <FormButton onClick={() => signIn("email", { email })}>
        <LogIn />
        <div className="text-lg font-bold">Sign in with Email</div>
      </FormButton>

      <div className="relative my-4 h-[2px] w-full bg-black text-center">
        <span className="absolute top-[-0.7rem] self-center bg-primary px-1">
          or
        </span>
      </div>

      <FormButton onClick={() => signIn("spotify")}>
        <Image
          height={24}
          width={24}
          src="/spotify-icon.svg"
          alt="spotify icon"
        />
        <div className="text-lg font-bold">Sign In with Spotify</div>
      </FormButton>
    </OneElementView>
  );
}
