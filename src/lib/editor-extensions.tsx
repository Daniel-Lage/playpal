"use client";

import { computePosition, flip, shift } from "@floating-ui/dom";
import {
  ReactRenderer,
  type Editor,
  posToDOMRect,
  Extension,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CharacterCount } from "@tiptap/extensions";
import Mention, { type MentionNodeAttrs } from "@tiptap/extension-mention";
import {
  forwardRef,
  type RefAttributes,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { cn } from "~/lib/utils";
import { Placeholder } from "@tiptap/extensions";
import type { User } from "next-auth";

function updatePosition(editor: Editor, element: HTMLElement) {
  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(
        editor.view,
        editor.state.selection.from,
        editor.state.selection.to,
      ),
  };

  computePosition(virtualElement, element, {
    placement: "bottom-start",
    strategy: "absolute",
    middleware: [shift(), flip()],
  })
    .then(({ x, y, strategy }) => {
      element.style.width = "max-content";
      element.style.position = strategy;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    })
    .catch((error) => console.error(error));
}

interface MentionItem {
  id: string;
  label: string;
}

interface MentionListRef {
  onKeyDown: ({ event }: { event: globalThis.KeyboardEvent }) => boolean;
}

interface MentionListProps {
  items: MentionItem[];
  command: (props: MentionNodeAttrs) => void;
}

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

export function getEditorExtensions(userList?: User[], submit?: () => void) {
  return [
    Extension.create({
      name: "Submit",
      addKeyboardShortcuts: () => ({
        Enter: ({ editor }) => {
          if (editor.isActive("mention")) {
            return false;
          }

          if (submit == null) return true;
          submit();
          editor.commands.clearContent(true);
          return true;
        },
      }),
    }),
    StarterKit.configure({
      blockquote: false,
      bold: false,
      bulletList: false,
      orderedList: false,
      code: false,
      codeBlock: false,
      heading: false,
      horizontalRule: false,
      italic: false,
      strike: false,
      underline: false,
      link: { linkOnPaste: false },
    }),
    CharacterCount.configure({ limit: 256 }),
    Placeholder.configure({ placeholder: "Write something!" }),
    Mention.configure({
      suggestion: {
        char: "@",
        items: ({ query }) =>
          userList == null
            ? []
            : userList
                .map((user) => ({ id: user.id, label: user.name }))
                .filter((item) =>
                  item.label != null
                    ? item.label.toLowerCase().startsWith(query.toLowerCase())
                    : false,
                )
                .slice(0, 5),
        render: () => {
          let component:
            | ReactRenderer<
                MentionListRef,
                MentionListProps & RefAttributes<MentionListRef>
              >
            | undefined;

          return {
            onStart: (props) => {
              component = new ReactRenderer(MentionList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              component.element.style.position = "absolute";

              document.body.appendChild(component.element);

              updatePosition(props.editor, component.element);
            },

            onUpdate(props) {
              if (!component) return;

              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              updatePosition(props.editor, component.element);
            },

            onKeyDown(props) {
              if (!component) return false;

              if (props.event.key === "Escape") {
                component.destroy();

                return true;
              }

              if (!component.ref) return false;

              return component.ref.onKeyDown(props);
            },

            onExit() {
              if (!component) return;

              component.destroy();
            },
          };
        },
      },
    }),
  ];
}
