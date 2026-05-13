export type SectionStyleValue = {
  backgroundColor?: string;
  backgroundImageUrl?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  paddingTop?: string | number;
  paddingBottom?: string | number;
  marginTop?: string | number;
  marginBottom?: string | number;
  width?: string | number;
  height?: string | number;
  transform?: string;
};

type ContentLike = Record<string, unknown> | null | undefined;

const readStyleValue = (
  content: ContentLike,
  styleKey: 'sectionStyle' | 'outerSectionStyle' = 'sectionStyle'
): SectionStyleValue => {
  const raw = content?.[styleKey];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }

  return raw as SectionStyleValue;
};

export const getSectionStyleSx = (
  content: ContentLike,
  styleKey: 'sectionStyle' | 'outerSectionStyle' = 'sectionStyle'
): Record<string, string | number> => {
  const sectionStyle = readStyleValue(content, styleKey);
  const sx: Record<string, string | number> = {};

  if (sectionStyle.backgroundColor) {
    sx.backgroundColor = sectionStyle.backgroundColor;
  }
  if (sectionStyle.backgroundImageUrl) {
    const sanitizedUrl = sectionStyle.backgroundImageUrl.replace(/[()'"\\]/g, '');
    sx.backgroundImage = `url(${sanitizedUrl})`;
    sx.backgroundSize = sectionStyle.backgroundSize || 'cover';
    sx.backgroundPosition = sectionStyle.backgroundPosition || 'center';
    sx.backgroundRepeat = sectionStyle.backgroundRepeat || 'no-repeat';
  }
  if (sectionStyle.paddingTop !== undefined) {
    sx.paddingTop = sectionStyle.paddingTop;
  }
  if (sectionStyle.paddingBottom !== undefined) {
    sx.paddingBottom = sectionStyle.paddingBottom;
  }
  if (sectionStyle.marginTop !== undefined) {
    sx.marginTop = sectionStyle.marginTop;
  }
  if (sectionStyle.marginBottom !== undefined) {
    sx.marginBottom = sectionStyle.marginBottom;
  }
  if (sectionStyle.width !== undefined) {
    sx.width = sectionStyle.width;
  }
  if (sectionStyle.height !== undefined) {
    sx.height = sectionStyle.height;
  }
  if (sectionStyle.transform) {
    sx.transform = sectionStyle.transform;
  }

  return sx;
};
