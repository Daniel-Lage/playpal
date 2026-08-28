"use client";

import * as React from "react";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Circle } from "lucide-react";

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
  reversed,
  reverse,
}: {
  title: string;
  onSelect: ((value: string) => void) | undefined;
  options: string[];
  value: string;
  disabled?: boolean;
  reversed?: boolean;
  reverse?: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          role="combobox"
          aria-expanded={open}
          className="w-40 justify-between"
        >
          {title}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] border-none p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(option) => {
                    if (value === option) {
                      reverse?.();
                      return;
                    }

                    onSelect?.(option);
                  }}
                >
                  <div className="[&_svg]:size-2">
                    <Circle
                      fill={value === option ? "currentColor" : "none"}
                      className={cn(
                        value === option ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </div>
                  {option}
                  {reverse != null &&
                    (reversed ? (
                      <ArrowUpNarrowWide
                        fill={value === option ? "currentColor" : "none"}
                        className={cn(
                          "ml-auto",
                          value === option ? "opacity-100" : "opacity-0",
                        )}
                      />
                    ) : (
                      <ArrowDownWideNarrow
                        fill={value === option ? "currentColor" : "none"}
                        className={cn(
                          "ml-auto",
                          value === option ? "opacity-100" : "opacity-0",
                        )}
                      />
                    ))}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
