import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { MoreVertical, Share } from "lucide-react";
import type { TemplateProps } from "../../templateEngine/types";
import type { TemplateChromeProps } from "../../templateEngine/templateChromeRegistry";
import TemplatePageShell from "../../components/TemplatePageShell";
import { TemplateSectionBoundary } from "../../components/TemplateSectionLayout";
import {
  getEditableSectionProps,
  getEditableTextProps,
  getStaticSelectableProps,
} from "../../utils/editableProps";
import { renderEditableMedia } from "../../utils/editableComponents";
import { useTemplateContactForm } from "../../utils/useTemplateContactForm";
import { normalizeContactFormFields } from "../../../api/formSubmissions";
import { resolveTemplateInternalLink } from "../../utils/resolveTemplateLink";
import { linkHubDarkProAssets } from "../../assets/link-hub/link-hub-dark-pro";
import { renderSavedIcon } from "../../../components/IconLibrary";

const headingFont =
  '"Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif';
const bodyFont = '"Inter", "Segoe UI", system-ui, sans-serif';

const COLUMN_MAX = { xs: 425, md: 480, lg: 520 };

/** Linktree-style grain for middle column — fixed SVG filter + data URI. */
const COLUMN_NOISE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch" result="noise"/><feColorMatrix in="noise" type="saturate" values="0" result="mono"/><feComponentTransfer in="mono" result="bits"><feFuncR type="discrete" tableValues="0 1"/><feFuncG type="discrete" tableValues="0 1"/><feFuncB type="discrete" tableValues="0 1"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#noiseFilter)"/></svg>`;
const COLUMN_NOISE_BG = `url("data:image/svg+xml;utf8,${encodeURIComponent(COLUMN_NOISE_SVG)}")`;

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};

const asArray = <T,>(value: unknown, fallback: T[] = []): T[] =>
  Array.isArray(value) && value.length ? (value as T[]) : fallback;

const containerProps = (
  blockId: string | number | undefined,
  id: string,
  label: string,
  type: "container" | "card" = "container",
) => getStaticSelectableProps(blockId, label, id, "containerStyles", type);

/** Apply persisted containerStyles[id] so public/editor paint matches saved edits. */
const containerStyleSx = (
  content: Record<string, any>,
  id: string,
): Record<string, any> => {
  const style = asRecord(asRecord(content.containerStyles)[id]);
  const sx: Record<string, any> = {};
  if (style.backgroundColor) sx.bgcolor = style.backgroundColor;
  if (style.borderRadius) sx.borderRadius = style.borderRadius;
  if (style.borderColor) sx.borderColor = style.borderColor;
  if (style.borderWidth) sx.borderWidth = style.borderWidth;
  if (style.borderStyle) sx.borderStyle = style.borderStyle;
  if (style.paddingTop) sx.pt = style.paddingTop;
  if (style.paddingBottom) sx.pb = style.paddingBottom;
  if (style.paddingLeft) sx.pl = style.paddingLeft;
  if (style.paddingRight) sx.pr = style.paddingRight;
  if (style.width) sx.width = style.width;
  if (style.height) sx.height = style.height;
  if (style.opacity !== undefined && style.opacity !== "") {
    sx.opacity = style.opacity;
  }
  const image = String(
    style.backgroundImageUrl || style.backgroundImage || "",
  ).trim();
  if (image) {
    sx.backgroundImage = image.startsWith("url(") || image.includes("gradient(")
      ? image
      : `url(${image})`;
    sx.backgroundSize = style.backgroundSize || "cover";
    sx.backgroundPosition = style.backgroundPosition || "center";
  }
  return sx;
};

const resolveLink = (href: string, siteSlug?: string) =>
  resolveTemplateInternalLink(href, { siteSlug });

const isExternalHref = (href: string) =>
  /^(https?:\/\/|mailto:|tel:)/i.test(href.trim());

const visibleFeatures = (items: Record<string, any>[]) =>
  items.filter((item) => item?.isVisible !== false);

/** Minimal chrome — Link Hub Dark Pro is a single profile column. */
export const LinkHubDarkProTemplateHeader: React.FC<TemplateChromeProps> =
  () => null;

export const LinkHubDarkProTemplateFooter: React.FC<TemplateChromeProps> = ({
  data,
  mode,
}) => {
  if (mode === "full-template") return null;
  const footer = asRecord(asRecord(data.templateContent).footer);
  const blockId = footer.blockId;
  return (
    <Box
      component="footer"
      {...getEditableSectionProps(blockId, "Footer", "sectionStyle")}
      sx={{
        py: 2.5,
        px: 2,
        textAlign: "center",
      }}
    >
      <Typography
        {...getEditableTextProps(blockId, "heading", "single", "headingStyle")}
        sx={{
          fontFamily: bodyFont,
          fontSize: "0.8rem",
          ...(footer.headingStyle || {}),
        }}
      >
        {footer.heading || data.name || ""}
      </Typography>
    </Box>
  );
};

const LinkHubDarkProTemplate: React.FC<TemplateProps> = ({ data }) => {
  const templateContent = asRecord(data.templateContent);
  const siteSlug =
    typeof templateContent.__siteSlug === "string"
      ? templateContent.__siteSlug
      : undefined;
  const profile = asRecord(templateContent.profile || templateContent.hero);
  const socials = asRecord(templateContent.socials);
  const featured = asRecord(templateContent.featured);
  const links = asRecord(templateContent.links);
  const products = asRecord(templateContent.products);
  const contact = asRecord(templateContent.contact);
  const footer = asRecord(templateContent.footer);

  const primary =
    data.themeSettings?.primaryColor || data.primaryColor || "#FFFFFF";
  // Dark template: keep text light for contrast (do not use dark secondary as text).
  const textColor = "#FFFFFF";

  const avatarSrc =
    profile.image || profile.heroImage || linkHubDarkProAssets.avatar;
  const displayName = profile.heading || data.name || "";
  const handle = profile.subheading || "";
  const bio = profile.body || profile.description || data.description || "";

  const socialItems = visibleFeatures(asArray(socials.features, []));
  const featuredItems = visibleFeatures(asArray(featured.features, []));
  const linkItems = visibleFeatures(asArray(links.features, []));
  const productItems = visibleFeatures(asArray(products.features, []));

  const contactFields = normalizeContactFormFields(contact.formFields, contact);
  const { status, errorMessage, getFieldProps, handleSubmit } =
    useTemplateContactForm(
      contactFields,
      data.websiteId,
      "link-hub-dark-pro-form",
      {
        formId: contact.blockId,
        formName: contact.heading || "Contact",
      },
    );

  const openHref = (raw: string) => {
    const href = String(raw || "").trim();
    if (!href || href === "#") return undefined;
    if (isExternalHref(href)) return href;
    return resolveLink(href, siteSlug);
  };

  const profileStyle = asRecord(profile.sectionStyle);
  const savedBg =
    profileStyle.backgroundImageUrl ||
    profileStyle.backgroundImage ||
    profile.heroImage ||
    "";
  const hasPersistedBg = Boolean(
    savedBg ||
      profileStyle.backgroundColor ||
      (profileStyle.backgroundType &&
        profileStyle.backgroundType !== "none") ||
      profileStyle.backgroundAnimatedPreset ||
      profileStyle.backgroundPatternPreset,
  );

  const renderLinkCard = (
    item: Record<string, any>,
    index: number,
    blockContent: Record<string, any>,
    blockId: string | number | undefined,
    sectionKey: string,
    fallbackImage?: string,
  ) => {
    const href = openHref(item.link || item.url || "");
    const thumb = item.image || fallbackImage || "";
    const cardId = `${sectionKey}.features.${index}`;
    return (
      <Box
        key={cardId}
        {...containerProps(
          blockId,
          cardId,
          item.title || `Link ${index + 1}`,
          "card",
        )}
        component={href ? "a" : "div"}
        href={href || undefined}
        target={
          href && isExternalHref(String(item.link || item.url || ""))
            ? "_blank"
            : undefined
        }
        rel={
          href && isExternalHref(String(item.link || item.url || ""))
            ? "noopener noreferrer"
            : undefined
        }
        sx={{
          display: "grid",
          gridTemplateColumns: "52px 1fr 28px",
          alignItems: "center",
          gap: 1.25,
          minHeight: 68,
          px: { xs: 1.1, md: 1.35 },
          py: { xs: 1, md: 1.2 },
          borderRadius: 2.5,
          textDecoration: "none",
          color: textColor,
          // Soft template defaults — overridden by persisted containerStyles.
          bgcolor: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          transition: "transform 0.2s ease, background-color 0.2s ease",
          "&:hover": { transform: "translateY(-2px)" },
          ...containerStyleSx(blockContent, cardId),
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 1.5,
            overflow: "hidden",
            flexShrink: 0,
            bgcolor: "rgba(255,255,255,0.06)",
          }}
        >
          {renderEditableMedia({
            blockId,
            field: `features.${index}.image`,
            label: "Link thumbnail",
            src: thumb || linkHubDarkProAssets.linkOne,
            alt: item.title || "Link",
            sx: {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: thumb ? 1 : 0.35,
            },
          })}
        </Box>
        <Box sx={{ minWidth: 0, textAlign: "center", px: 0.5 }}>
          <Typography
            {...getEditableTextProps(
              blockId,
              `features.${index}.title`,
              "single",
            )}
            sx={{
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "0.82rem", md: "0.92rem" },
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1.25,
            }}
          >
            {item.title || ""}
          </Typography>
          <Typography
            {...getEditableTextProps(
              blockId,
              `features.${index}.description`,
              "single",
            )}
            sx={{
              mt: 0.35,
              fontSize: { xs: "0.72rem", md: "0.8rem" },
              color: "rgba(255,255,255,0.45)",
              display: "none",
            }}
          >
            {item.description || ""}
          </Typography>
          <Typography
            {...getEditableTextProps(
              blockId,
              `features.${index}.link`,
              "single",
            )}
            sx={{
              mt: 0.25,
              fontSize: { xs: "0.68rem", md: "0.74rem" },
              color: "rgba(255,255,255,0.35)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "none",
            }}
          >
            {item.link || item.url || ""}
          </Typography>
        </Box>
        <Box
          {...containerProps(
            blockId,
            `${cardId}.menu`,
            "Link menu icon",
            "card",
          )}
          aria-hidden
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.55)",
            pointerEvents: "none",
            ...containerStyleSx(blockContent, `${cardId}.menu`),
          }}
        >
          <MoreVertical size={16} />
        </Box>
      </Box>
    );
  };

  return (
    <TemplatePageShell
      templateId="link-hub-dark-pro"
      data={data}
      mode="full-template"
    >
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          fontFamily: bodyFont,
          color: textColor,
          display: "flex",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          // Desktop stage matches Linktree-style dark surround (not white).
          bgcolor: "#000000",
          backgroundColor: "#000000",
        }}
      >
        {/* Linktree-style: blurred profile picture as ambient page background */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            left: "-5vw",
            top: "-5vh",
            width: "110vw",
            height: "110dvh",
            minHeight: "110%",
            pointerEvents: "none",
            zIndex: 0,
            opacity: 0.25,
            backgroundImage: avatarSrc ? `url(${avatarSrc})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(50px)",
            transform: "translateZ(0)",
          }}
        />

        {/*
          Profile section owns the full phone-column background via sectionStyle
          (color / image / gradient from editor). Soft defaults sit first so
          saved sectionStyle always wins.
        */}
        <TemplateSectionBoundary
          blockId={profile.blockId}
          label="Profile"
          sectionKey="profile"
          content={profile}
          styleKey="sectionStyle"
          sx={{
            width: "100%",
            maxWidth: COLUMN_MAX,
            minHeight: "100vh",
            position: "relative",
            overflow: "hidden",
            zIndex: 1,
            px: { xs: 2, md: 2.5 },
            pt: { xs: 2, md: 2.5 },
            pb: { xs: 5, md: 6 },
            color: textColor,
            // Soft dark base so blurred avatar + grain read clearly.
            ...(!hasPersistedBg
              ? {
                  backgroundColor: "rgba(10,10,10,0.72)",
                  backgroundImage: `
                    linear-gradient(180deg, rgba(20,16,14,0.55) 0%, rgba(8,8,8,0.82) 100%)
                  `,
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                }
              : {
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                }),
            // Grain overlay via ::before so it always sits on the middle column.
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 1,
              opacity: 0.12,
              mixBlendMode: "overlay",
              backgroundImage: COLUMN_NOISE_BG,
              backgroundRepeat: "repeat",
              backgroundSize: "512px 512px",
            },
            "& > *:not([aria-hidden='true'])": {
              position: "relative",
              zIndex: 2,
            },
          }}
        >
          {/* Blurred avatar wash inside middle column (profile picture ambient) */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              left: "-8%",
              top: "-8%",
              width: "116%",
              height: "116%",
              pointerEvents: "none",
              zIndex: 0,
              opacity: 0.35,
              backgroundImage: avatarSrc ? `url(${avatarSrc})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              filter: "blur(50px)",
              transform: "translateZ(0)",
            }}
          />

          {/* Editable background image field (heroImage) for media replace */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              width: 0,
              height: 0,
              overflow: "hidden",
              opacity: 0,
              zIndex: 0,
            }}
            aria-hidden
          >
            {renderEditableMedia({
              blockId: profile.blockId,
              field: "heroImage",
              label: "Page background image",
              src: savedBg || linkHubDarkProAssets.featured,
              alt: "Background",
              sx: { width: 1, height: 1 },
            })}
          </Box>

          {/* Top share action — selectable / hideable container */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mb: 2.5,
            }}
          >
            <Box
              {...containerProps(
                profile.blockId,
                "profile.share",
                "Share action",
                "card",
              )}
              component="a"
              href={`mailto:${contact.email || data.contact?.email || ""}`}
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: primary,
                color: "#111",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
                ...containerStyleSx(profile, "profile.share"),
              }}
            >
              <Share size={15} />
            </Box>
          </Box>

          <Box sx={{ position: "relative", pb: 1.5, textAlign: "center" }}>
            <Box
              {...containerProps(
                profile.blockId,
                "profile.avatar",
                "Profile avatar",
                "card",
              )}
              sx={{
                width: { xs: 104, md: 118 },
                height: { xs: 104, md: 118 },
                mx: "auto",
                position: "relative",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid rgba(255,255,255,0.2)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
                ...containerStyleSx(profile, "profile.avatar"),
              }}
            >
              {renderEditableMedia({
                blockId: profile.blockId,
                field: "image",
                label: "Profile avatar",
                src: avatarSrc,
                alt: displayName || "Avatar",
                style: profile.imageStyle,
                sx: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                },
              })}
            </Box>

            <Typography
              {...getEditableTextProps(
                profile.blockId,
                "heading",
                "single",
                "headingStyle",
              )}
              sx={{
                mt: 1.75,
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: { xs: "1.4rem", md: "1.65rem", lg: "1.8rem" },
                letterSpacing: "-0.02em",
                ...(profile.headingStyle || {}),
              }}
            >
              {displayName}
            </Typography>
            <Typography
              {...getEditableTextProps(
                profile.blockId,
                "subheading",
                "single",
                "subheadingStyle",
              )}
              sx={{
                mt: 0.35,
                fontWeight: 700,
                fontSize: { xs: "1rem", md: "1.08rem" },
                color: "rgba(255,255,255,0.85)",
                ...(profile.subheadingStyle || {}),
              }}
            >
              {handle}
            </Typography>
            <Typography
              {...getEditableTextProps(
                profile.blockId,
                "body",
                "multi",
                "bodyStyle",
              )}
              sx={{
                mt: 1,
                mx: "auto",
                maxWidth: { xs: 320, md: 380 },
                fontSize: { xs: "0.88rem", md: "0.98rem" },
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.55)",
                ...(profile.bodyStyle || profile.descriptionStyle || {}),
              }}
            >
              {bio}
            </Typography>
          </Box>

          {/* Socials */}
          <TemplateSectionBoundary
            blockId={socials.blockId}
            label="Social links"
            sectionKey="socials"
            content={socials}
            styleKey="sectionStyle"
            sx={{ mt: 1.75 }}
          >
            <Stack
              direction="row"
              spacing={1.75}
              justifyContent="center"
              flexWrap="wrap"
              useFlexGap
            >
              {socialItems.map((item, index) => {
                const href = openHref(item.link || item.url || "");
                const socialId = `socials.features.${index}`;
                return (
                  <Box
                    key={socialId}
                    {...containerProps(
                      socials.blockId,
                      socialId,
                      item.title || `Social ${index + 1}`,
                      "card",
                    )}
                    component={href ? "a" : "div"}
                    href={href || undefined}
                    target={
                      href &&
                      isExternalHref(String(item.link || item.url || ""))
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      href &&
                      isExternalHref(String(item.link || item.url || ""))
                        ? "noopener noreferrer"
                        : undefined
                    }
                    sx={{
                      width: 28,
                      height: 28,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: textColor,
                      textDecoration: "none",
                      opacity: 0.92,
                      transition: "opacity 0.2s ease, transform 0.2s ease",
                      "&:hover": { opacity: 1, transform: "translateY(-1px)" },
                      ...containerStyleSx(socials, socialId),
                    }}
                  >
                    <Box sx={{ display: "none" }}>
                      <Typography
                        {...getEditableTextProps(
                          socials.blockId,
                          `features.${index}.title`,
                          "single",
                        )}
                      >
                        {item.title || ""}
                      </Typography>
                      <Typography
                        {...getEditableTextProps(
                          socials.blockId,
                          `features.${index}.link`,
                          "single",
                        )}
                      >
                        {item.link || item.url || ""}
                      </Typography>
                    </Box>
                    {renderSavedIcon({
                      value: item.icon || item.title,
                      size: 18,
                    })}
                  </Box>
                );
              })}
            </Stack>
          </TemplateSectionBoundary>

          {/* Featured */}
          <TemplateSectionBoundary
            blockId={featured.blockId}
            label="Featured link"
            sectionKey="featured"
            content={featured}
            styleKey="sectionStyle"
            sx={{ mt: 2.75 }}
          >
            <Stack spacing={1.35}>
              {featuredItems.slice(0, 1).map((item, index) =>
                renderLinkCard(
                  item,
                  index,
                  featured,
                  featured.blockId,
                  "featured",
                  linkHubDarkProAssets.featured,
                ),
              )}
            </Stack>
          </TemplateSectionBoundary>

          {/* Links */}
          <TemplateSectionBoundary
            blockId={links.blockId}
            label="Links"
            sectionKey="links"
            content={links}
            styleKey="sectionStyle"
            id="links"
            sx={{ mt: 1.35 }}
          >
            <Stack spacing={1.35}>
              {linkItems.map((item, index) =>
                renderLinkCard(
                  item,
                  index,
                  links,
                  links.blockId,
                  "links",
                  index === 0
                    ? linkHubDarkProAssets.linkOne
                    : index === 1
                      ? linkHubDarkProAssets.linkTwo
                      : undefined,
                ),
              )}
            </Stack>
          </TemplateSectionBoundary>

          {/* Products */}
          <TemplateSectionBoundary
            blockId={products.blockId}
            label="Products"
            sectionKey="products"
            content={products}
            styleKey="sectionStyle"
            id="products"
            sx={{ mt: 1.35 }}
          >
            <Typography
              {...getEditableTextProps(
                products.blockId,
                "heading",
                "single",
                "headingStyle",
              )}
              sx={{
                mb: 1.25,
                fontSize: { xs: "0.75rem", md: "0.82rem" },
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                textAlign: "center",
                ...(products.headingStyle || {}),
              }}
            >
              {products.heading || ""}
            </Typography>
            <Stack spacing={1.35}>
              {productItems.map((item, index) =>
                renderLinkCard(
                  item,
                  index,
                  products,
                  products.blockId,
                  "products",
                  linkHubDarkProAssets.product,
                ),
              )}
            </Stack>
          </TemplateSectionBoundary>

          {/* Contact / join CTA */}
          <TemplateSectionBoundary
            blockId={contact.blockId}
            label="Contact"
            sectionKey="contact"
            content={contact}
            styleKey="sectionStyle"
            id="contact"
            sx={{ mt: 3 }}
          >
            <Typography
              {...getEditableTextProps(
                contact.blockId,
                "heading",
                "multi",
                "headingStyle",
              )}
              sx={{
                textAlign: "center",
                fontWeight: 700,
                fontSize: { xs: "1.05rem", md: "1.15rem" },
                mb: 0.75,
                ...(contact.headingStyle || {}),
              }}
            >
              {contact.heading || ""}
            </Typography>
            <Typography
              {...getEditableTextProps(
                contact.blockId,
                "description",
                "multi",
                "descriptionStyle",
              )}
              sx={{
                textAlign: "center",
                mb: 1.25,
                fontSize: { xs: "0.88rem", md: "0.95rem" },
                color: "rgba(255,255,255,0.55)",
                ...(contact.descriptionStyle || {}),
              }}
            >
              {contact.description || ""}
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "grid", gap: 1.1 }}
            >
              {contactFields.map((field, index) => (
                <Box key={`${field.label}-${index}`}>
                  <Typography
                    {...getEditableTextProps(
                      contact.blockId,
                      `formFields.${index}.label`,
                      "single",
                    )}
                    sx={{
                      mb: 0.5,
                      fontSize: "0.68rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.4)",
                      textAlign: "center",
                    }}
                  >
                    {field.label}
                  </Typography>
                  <Box
                    component="input"
                    placeholder={field.placeholder || field.label}
                    {...getFieldProps(field.label)}
                    sx={{
                      width: "100%",
                      height: 46,
                      px: 1.5,
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.14)",
                      bgcolor: "rgba(0,0,0,0.45)",
                      color: textColor,
                      fontSize: "0.9rem",
                      outline: "none",
                      textAlign: "center",
                      "&::placeholder": { color: "rgba(255,255,255,0.35)" },
                    }}
                  />
                </Box>
              ))}
              <Button
                type="submit"
                disabled={status === "loading"}
                {...getEditableTextProps(
                  contact.blockId,
                  "ctaText",
                  "single",
                  "ctaTextStyle",
                )}
                sx={{
                  mt: 0.4,
                  borderRadius: 999,
                  py: 1.35,
                  bgcolor: primary,
                  color: "#111",
                  fontWeight: 800,
                  textTransform: "none",
                  fontSize: { xs: "0.95rem", md: "1.02rem" },
                  boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
                  "&:hover": { bgcolor: primary, opacity: 0.95 },
                  ...(contact.ctaTextStyle || {}),
                }}
              >
                {status === "loading"
                  ? "Sending…"
                  : contact.ctaText || contact.buttonLabel || ""}
              </Button>
              <Typography
                {...getEditableTextProps(
                  contact.blockId,
                  "buttonLabel",
                  "single",
                  "buttonLabelStyle",
                )}
                sx={{ display: "none", ...(contact.buttonLabelStyle || {}) }}
              >
                {contact.buttonLabel || ""}
              </Typography>
              <Typography
                {...getEditableTextProps(contact.blockId, "email", "single")}
                sx={{
                  textAlign: "center",
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {contact.email || data.contact?.email || ""}
              </Typography>
              {errorMessage ? (
                <Typography
                  sx={{
                    color: "#ff8f8f",
                    fontSize: "0.78rem",
                    textAlign: "center",
                  }}
                >
                  {errorMessage}
                </Typography>
              ) : null}
              {status === "success" ? (
                <Typography
                  sx={{
                    color: "#9dffb0",
                    fontSize: "0.78rem",
                    textAlign: "center",
                  }}
                >
                  Thanks — you’re on the list.
                </Typography>
              ) : null}
            </Box>
          </TemplateSectionBoundary>

          <Box
            component="footer"
            {...getEditableSectionProps(
              footer.blockId,
              "Footer",
              "sectionStyle",
            )}
            sx={{ mt: 3.5, textAlign: "center" }}
          >
            <Typography
              {...getEditableTextProps(
                footer.blockId,
                "heading",
                "single",
                "headingStyle",
              )}
              sx={{
                fontWeight: 600,
                fontSize: "0.8rem",
                ...(footer.headingStyle || {}),
              }}
            >
              {footer.heading || displayName}
            </Typography>
            <Typography
              {...getEditableTextProps(
                footer.blockId,
                "body",
                "multi",
                "bodyStyle",
              )}
              sx={{
                mt: 0.5,
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.35)",
                ...(footer.bodyStyle || {}),
              }}
            >
              {footer.body || ""}
            </Typography>
          </Box>
        </TemplateSectionBoundary>
      </Box>
    </TemplatePageShell>
  );
};

export default LinkHubDarkProTemplate;
