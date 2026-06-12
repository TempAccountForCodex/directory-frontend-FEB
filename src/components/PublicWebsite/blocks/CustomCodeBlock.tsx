import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";

interface Props {
  block: {
    id: number;
    blockType: string;
    content: { code?: string };
    sortOrder: number;
  };
}

const CustomCodeBlock: React.FC<Props> = ({ block }) => {
  const code = (block.content.code || "").trim();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = code;

    // <style> tags inside innerHTML are parsed but not always applied in all
    // browsers — move them to <head> to guarantee they take effect.
    el.querySelectorAll("style").forEach((styleEl) => {
      const clone = document.createElement("style");
      clone.setAttribute("data-custom-block", String(block.id));
      clone.textContent = styleEl.textContent;
      document.head.appendChild(clone);
      styleEl.remove();
    });

    // Scripts set via innerHTML don't execute — recreate each one so the
    // browser runs them.
    el.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value),
      );
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });

    return () => {
      document.querySelectorAll(`style[data-custom-block="${block.id}"]`)
        .forEach((el) => el.remove());
    };
  }, [code, block.id]);

  return <Box ref={containerRef} sx={{ width: "100%" }} />;
};

export default CustomCodeBlock;
