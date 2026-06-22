/**
 * CodeBlock — Clerk-style dark, copyable code block.
 *
 * Renders a language label and a copy button in a header strip above a dark
 * code surface (dark even in light mode, matching Clerk's docs). Used as the
 * `pre` override for the docs Markdown renderer.
 */

import React, { memo, useCallback, useState } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { Check, Copy } from "lucide-react";
import { DOCS } from "./docsTheme";

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock = memo<CodeBlockProps>(({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const write = navigator?.clipboard?.writeText?.(code);
    Promise.resolve(write)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        /* clipboard unavailable — no-op */
      });
  }, [code]);

  return (
    <Box
      sx={{
        position: "relative",
        my: 3,
        borderRadius: "12px",
        overflow: "hidden",
        border: `1px solid ${DOCS.border}`,
        bgcolor: DOCS.codeBg,
      }}
    >
      {/* Header strip: language label + copy */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.75,
          py: 0.75,
          borderBottom: `1px solid ${DOCS.border}`,
          bgcolor: "rgba(255,255,255,0.02)",
        }}
      >
        <Box
          component="span"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.72rem",
            letterSpacing: 0.4,
            textTransform: "lowercase",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          {language || "code"}
        </Box>
        <Tooltip title={copied ? "Copied" : "Copy"} placement="left">
          <Box
            component="button"
            type="button"
            onClick={handleCopy}
            aria-label="Copy code"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: copied ? "#4ade80" : "rgba(255,255,255,0.6)",
              fontSize: "0.72rem",
              p: 0.5,
              borderRadius: "6px",
              transition: "color 0.15s",
              "&:hover": { color: "#fff" },
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </Box>
        </Tooltip>
      </Box>

      {/* Code surface */}
      <Box
        component="pre"
        sx={{
          m: 0,
          px: 2,
          py: 1.75,
          overflowX: "auto",
          fontSize: "0.825rem",
          lineHeight: 1.7,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          color: DOCS.codeText,
          "& code": {
            fontFamily: "inherit",
            bgcolor: "transparent",
            p: 0,
            color: "inherit",
            fontSize: "inherit",
          },
        }}
      >
        {code}
      </Box>
    </Box>
  );
});

CodeBlock.displayName = "CodeBlock";

export default CodeBlock;
