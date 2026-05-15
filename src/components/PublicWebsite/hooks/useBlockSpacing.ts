import { useMemo } from "react";

export type SpacingToken = "none" | "sm" | "md" | "lg" | "xl";

export interface BlockSpacingFields {
  paddingTop?: SpacingToken;
  paddingBottom?: SpacingToken;
  marginTop?: SpacingToken;
  marginBottom?: SpacingToken;
}

export interface BlockSpacingResult {
  spacingSx: Record<string, unknown>;
}

const TOKEN_MAP: Record<SpacingToken, number> = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,
};

function resolveToken(
  token?: SpacingToken,
  defaultToken: SpacingToken = "md",
): number {
  if (token === undefined) return TOKEN_MAP[defaultToken];
  return TOKEN_MAP[token] ?? TOKEN_MAP[defaultToken];
}

export function useBlockSpacing(
  fields: BlockSpacingFields,
): BlockSpacingResult {
  return useMemo(() => {
    const pt = resolveToken(fields.paddingTop);
    const pb = resolveToken(fields.paddingBottom);
    // margins default to 0 (none) when not provided
    const mt =
      fields.marginTop !== undefined ? resolveToken(fields.marginTop) : 0;
    const mb =
      fields.marginBottom !== undefined ? resolveToken(fields.marginBottom) : 0;

    const spacingSx: Record<string, unknown> = { pt, pb };

    if (mt !== 0) spacingSx.mt = mt;
    if (mb !== 0) spacingSx.mb = mb;

    return { spacingSx };
  }, [fields]);
}
