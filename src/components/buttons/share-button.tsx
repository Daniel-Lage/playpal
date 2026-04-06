"use client";

import { Copy, Share2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { IconButton } from "./icon-button";

export function ShareButton({
  path,
  title,
  big,
}: {
  path: string;
  title?: string;
  big?: boolean;
}) {
  const url = `https://playpal-fm.vercel.app${path}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconButton big={big}>
          <Share2 />
          <span className={title ? "" : "sr-only"}>Share {title}</span>
        </IconButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <div className="select-all overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md bg-secondary-accent p-2">
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
