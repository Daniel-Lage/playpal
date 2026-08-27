import StarterKit from "@tiptap/starter-kit";
import { CharacterCount } from "@tiptap/extensions";
import Mention from "@tiptap/extension-mention";
import { Placeholder } from "@tiptap/extensions";

export const generateTextExtensions = [
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
        },
    }),
];

