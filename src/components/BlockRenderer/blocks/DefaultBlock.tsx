import React from "react";
import type { BlockRendererProps } from "../types";

const DefaultBlock: React.FC<BlockRendererProps> = ({ block }) => {
  const blockType = String(block.blockType || "UNKNOWN").toUpperCase();

  return <div className="block block--default" data-block-type={blockType} />;
};

export default React.memo(DefaultBlock);
