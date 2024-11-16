import * as React from 'react';

export function useDynamicNode<Node extends HTMLElement = HTMLDivElement>() {
  const [node, setNode] = React.useState<Node | null>(null);

  const ref = (node: Node) => {
    if (!node) return;
    setNode(node);
  };

  return [node, ref] as const;
}
