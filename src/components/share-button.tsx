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
import { Label } from "~/components/ui/label";

export function ShareButton({ path, title }: { path: string; title?: string }) {
  const url = `https://playpal-sepia.vercel.app${path}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={title ? "select" : "icon"}>
          <span className={title ? "" : "sr-only"}>Share {title}</span>
          <Share />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <div className="select-all overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md bg-primary-accent p-2">
              {url}
            </div>
          </div>
          <Button onClick={() => navigator.clipboard.writeText(url)}>
            <span className="sr-only">Copy</span>
            <Copy />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
