"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { cn } from "~/lib/utils";
import type {
  MentionItem,
  MentionListProps,
  MentionListRef,
} from "~/models/mention.model";

const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (item: MentionItem) => {
      command(item);
    };

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length);
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length);
    };

    const enterHandler = () => {
      if (items[selectedIndex]) selectItem(items[selectedIndex]);
    };

    useEffect(() => setSelectedIndex(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: globalThis.KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }

        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }
        if (event.key === "Enter") {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    return (
      <div className="flex flex-col gap-2 rounded-md bg-popover p-2">
        {items.length ? (
          items.map((item, index) => (
            <button
              className={cn(
                "flex rounded-sm px-2",
                index === selectedIndex ? "bg-accent" : "bg-transparent",
              )}
              key={index}
              onClick={() => selectItem(item)}
            >
              {item.label}
            </button>
          ))
        ) : (
          <div className="item">No result</div>
        )}
      </div>
    );
  },
);
MentionList.displayName = "MentionList";
export default MentionList;
