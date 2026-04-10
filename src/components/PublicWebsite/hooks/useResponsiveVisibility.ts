import { useMemo } from 'react';

export interface ResponsiveVisibilityFields {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

export interface ResponsiveVisibilityResult {
  isHidden: boolean;
  visibilitySx: Record<string, unknown>;
}

export function useResponsiveVisibility(
  fields: ResponsiveVisibilityFields
): ResponsiveVisibilityResult {
  return useMemo(() => {
    const { hideOnMobile = false, hideOnTablet = false, hideOnDesktop = false } = fields;

    if (!hideOnMobile && !hideOnTablet && !hideOnDesktop) {
      return { isHidden: false, visibilitySx: {} };
    }

    if (hideOnMobile && hideOnTablet && hideOnDesktop) {
      return { isHidden: true, visibilitySx: {} };
    }

    const display: Record<string, string> = {};

    if (hideOnMobile) {
      display.xs = 'none';
      display.sm = 'none';
    }

    if (hideOnTablet) {
      display.md = 'none';
    }

    if (hideOnDesktop) {
      display.lg = 'none';
      display.xl = 'none';
    }

    return {
      isHidden: false,
      visibilitySx: { display },
    };
  }, [fields]);
}
