import {
  type NodeHandler,
  type TipTapNode,
  TipTapRender,
} from "@troop.com/tiptap-react-render";

export function ContentRenderer({ content }: { content: string }) {
  const doc: NodeHandler = (props) => (
    <div className="tiptap">{props.children}</div>
  );

  const paragraph: NodeHandler = (props) => {
    return <p>{props.children}</p>;
  };

  const text: NodeHandler = (props) => {
    if (props.node.marks != null) {
      const link = props.node.marks.find((mark) => mark.type === "link") as
        | {
            attrs: { href: string };
          }
        | undefined;

      if (link == null) return <></>;

      return (
        <a
          target="_blank"
          rel="noopener noreferrer nofollow"
          href={link?.attrs?.href ?? ""}
        >
          {link?.attrs?.href}
        </a>
      );
    }
    return <span>{props.node.text}</span>;
  };

  const mention: NodeHandler = (props) => {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer nofollow"
        href={`https://playpal-fm.vercel.app/user/${props.node?.attrs?.id}`}
        style={{ textDecoration: "none" }}
      >
        {props.node?.attrs?.mentionSuggestionChar + props.node?.attrs?.label}
      </a>
    );
  };

  return (
    <TipTapRender
      handlers={{
        doc,
        text,
        paragraph,
        mention,
      }}
      node={JSON.parse(content) as TipTapNode}
    />
  );
}
