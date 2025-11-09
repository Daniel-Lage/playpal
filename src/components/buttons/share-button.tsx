"use client";

import { Copy, Share } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { IconButton } from "./icon-button";

export function ShareButton({ path, title }: { path: string; title?: string }) {
  const url = `https://playpal-sepia.vercel.app${path}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={
            title
              ? "flex h-9 w-[200px] items-center gap-2 p-0 px-2 text-base font-bold hover:backdrop-brightness-95 [&_svg]:size-6"
              : "w-8 justify-center"
          }
        >
          <Share />
          <span className={title ? "" : "sr-only"}>Share {title}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <div className="select-all overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md bg-primary-accent p-2">
              {url}
            </div>
          </div>
          <IconButton onClick={() => navigator.clipboard.writeText(url)}>
            <span className="sr-only">Copy</span>
            <Copy />
          </IconButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
