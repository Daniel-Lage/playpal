"use client";

import { Ellipsis } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function MenuView({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button aria-expanded={open} className="w-8 justify-center">
          <Ellipsis />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] border-none p-0">
        {children}
      </PopoverContent>
    </Popover>
  );
}
