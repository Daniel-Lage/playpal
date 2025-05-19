"use client";

import * as React from "react";
import { Check, Menu } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function Select({
  title,
  onSelect,
  options,
  value,
  disabled,
}: {
  title: string;
  onSelect: ((value: string) => void) | undefined;
  options: string[];
  value: string;
  disabled?: boolean | undefined;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button role="combobox" aria-expanded={open} size="select">
          {title}
          <Menu />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] border-none p-0">
        <Command className="border-none">
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(option) => {
                    onSelect?.(option);
                    setOpen(false);
                  }}
                >
                  {option}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === option ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
