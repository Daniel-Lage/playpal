import type { TipTapNode } from "@troop.com/tiptap-react-render";

export function flattenContent(node: TipTapNode): TipTapNode[] {
  const nodes = [];
  if (node?.content == null) {
    nodes.push(node);
  } else {
    for (const subnode of node.content) {
      nodes.push(...flattenContent(subnode));
    }
  }
  return nodes;
}
