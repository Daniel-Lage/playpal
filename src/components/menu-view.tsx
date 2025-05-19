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
        <Button role="combobox" aria-expanded={open} size="icon">
          <Ellipsis />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] border-none p-0">
        {children}
      </PopoverContent>
    </Popover>
  );
}
