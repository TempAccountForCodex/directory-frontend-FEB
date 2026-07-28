import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
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
import { beautyLinkHubProAssets } from "../../assets/link-hub/beauty-link-hub-pro";
import { renderSavedIcon } from "../../../components/IconLibrary";

const headingFont =
  '"Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif';
const bodyFont = '"Inter", "Segoe UI", system-ui, sans-serif';

/** Phone-style column — desktop keeps the same mobile layout centered. */
const COLUMN_MAX = { xs: 390, sm: 420, md: 440 };

const PILL_BG = "rgba(245, 232, 220, 0.42)";
const PILL_BORDER = "rgba(255, 255, 255, 0.28)";
/** Dark wash so white text stays readable on bright beauty backgrounds. */
const BG_OVERLAY =
  "linear-gradient(180deg, rgb(0 0 0 / 41%) 0%, rgb(0 0 0 / 35%) 45%, rgb(0 0 0 / 25%) 100%)";

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
    sx.backgroundImage =
      image.startsWith("url(") || image.includes("gradient(")
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

export const BeautyLinkHubProTemplateHeader: React.FC<
  TemplateChromeProps
> = () => null;

export const BeautyLinkHubProTemplateFooter: React.FC<TemplateChromeProps> = ({
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
      sx={{ py: 2.5, px: 2, textAlign: "center" }}
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

const BeautyLinkHubProTemplate: React.FC<TemplateProps> = ({ data }) => {
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

  const textColor = "#FFFFFF";

  const avatarSrc =
    profile.image || profile.heroImage || beautyLinkHubProAssets.avatar;
  const displayName = profile.heading || data.name || "Luna Belle";
  const roleLine = profile.subheading || "Makeup | Skin | Entrepreneur";
  const bio = profile.body || profile.description || "";

  const socialItems = visibleFeatures(asArray(socials.features, []));
  const featuredItems = visibleFeatures(asArray(featured.features, [])).slice(
    0,
    1,
  );
  const linkItems = visibleFeatures(asArray(links.features, []));
  const productItems = visibleFeatures(asArray(products.features, []));

  const contactFields = normalizeContactFormFields(contact.formFields, contact);
  const { status, errorMessage, getFieldProps, handleSubmit } =
    useTemplateContactForm(
      contactFields,
      data.websiteId,
      "beauty-link-hub-pro-form",
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
  const pageBg = savedBg || beautyLinkHubProAssets.background;

  const renderPillLink = (
    item: Record<string, any>,
    index: number,
    blockContent: Record<string, any>,
    blockId: string | number | undefined,
    sectionKey: string,
  ) => {
    const href = openHref(item.link || item.url || "");
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: { xs: 54, md: 58 },
          px: 2.5,
          py: 1.35,
          borderRadius: 999,
          textDecoration: "none",
          color: textColor,
          bgcolor: PILL_BG,
          border: `1px solid ${PILL_BORDER}`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 8px 28px rgba(40, 28, 20, 0.18)",
          transition: "transform 0.2s ease, background-color 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            bgcolor: "rgba(245, 232, 220, 0.55)",
          },
          ...containerStyleSx(blockContent, cardId),
        }}
      >
        <Box sx={{ minWidth: 0, textAlign: "center", width: "100%" }}>
          <Typography
            {...getEditableTextProps(
              blockId,
              `features.${index}.title`,
              "single",
            )}
            sx={{
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "0.92rem", md: "1rem" },
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              lineHeight: 1.2,
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
            sx={{ display: "none" }}
          >
            {item.description || ""}
          </Typography>
          <Typography
            {...getEditableTextProps(
              blockId,
              `features.${index}.link`,
              "single",
            )}
            sx={{ display: "none" }}
          >
            {item.link || item.url || ""}
          </Typography>
        </Box>
      </Box>
    );
  };

  const firstLink = linkItems[0];
  const remainingLinks = linkItems.slice(1);

  return (
    <TemplatePageShell
      templateId="beauty-link-hub-pro"
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
          bgcolor: "#2a221c",
        }}
      >
        {/* Soft ambient desktop surround from page background */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            backgroundImage: `url(${pageBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(28px)",
            transform: "scale(1.08)",
            opacity: 0.55,
          }}
        />

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
            mx: "auto",
            borderRadius: { xs: 0, sm: "36px" },
            my: { xs: 0, sm: 2 },
            boxShadow: {
              xs: "none",
              sm: "0 24px 64px rgba(0,0,0,0.35)",
            },
            px: { xs: 2.4, md: 2.8 },
            pt: { xs: 4.5, md: 5 },
            pb: { xs: 4, md: 5 },
            color: textColor,
            backgroundImage: `url(${pageBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            // Black overlay lives on ::before so editor sectionStyle bg images
            // cannot wipe it when they replace backgroundImage.
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
              borderRadius: "inherit",
              background: BG_OVERLAY,
            },
            "& > *": { position: "relative", zIndex: 2 },
          }}
        >
          {/* Editable background image field */}
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
              src: pageBg,
              alt: "Background",
              sx: { width: 1, height: 1 },
            })}
          </Box>

          {/* Profile */}
          <Box sx={{ textAlign: "center", pb: 2.5 }}>
            <Box
              {...containerProps(
                profile.blockId,
                "profile.avatar",
                "Profile avatar",
                "card",
              )}
              sx={{
                width: { xs: 108, md: 120 },
                height: { xs: 108, md: 120 },
                mx: "auto",
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid rgba(255,255,255,0.55)",
                boxShadow: "0 14px 36px rgba(40,28,20,0.35)",
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
                mt: 2,
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: { xs: "1.35rem", md: "1.5rem" },
                letterSpacing: "-0.01em",
                color: "#FFFFFF",
                textShadow: "0 2px 12px rgba(0,0,0,0.25)",
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
                mt: 0.6,
                fontWeight: 500,
                fontSize: { xs: "0.88rem", md: "0.94rem" },
                color: "#FFFFFF",
                letterSpacing: "0.01em",
                ...(profile.subheadingStyle || {}),
              }}
            >
              {roleLine}
            </Typography>

            {bio ? (
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
                  maxWidth: 320,
                  fontSize: "0.84rem",
                  lineHeight: 1.5,
                  color: "#FFFFFF",
                  ...(profile.bodyStyle || profile.descriptionStyle || {}),
                }}
              >
                {bio}
              </Typography>
            ) : (
              <Typography
                {...getEditableTextProps(
                  profile.blockId,
                  "body",
                  "multi",
                  "bodyStyle",
                )}
                sx={{ display: "none" }}
              >
                {bio}
              </Typography>
            )}
          </Box>

          {/* First link pill (e.g. MUA) */}
          <TemplateSectionBoundary
            blockId={links.blockId}
            label="Links"
            sectionKey="links"
            content={links}
            styleKey="sectionStyle"
            id="links"
            sx={{ mt: 0.5 }}
          >
            <Stack spacing={1.5}>
              {firstLink
                ? renderPillLink(firstLink, 0, links, links.blockId, "links")
                : null}
            </Stack>
          </TemplateSectionBoundary>

          {/* Featured tutorials card */}
          <TemplateSectionBoundary
            blockId={featured.blockId}
            label="Featured link"
            sectionKey="featured"
            content={featured}
            styleKey="sectionStyle"
            sx={{ mt: 2.4 }}
          >
            <Typography
              {...getEditableTextProps(
                featured.blockId,
                "heading",
                "single",
                "headingStyle",
              )}
              sx={{
                mb: 1.4,
                textAlign: "center",
                fontFamily: headingFont,
                fontWeight: 600,
                fontSize: { xs: "0.95rem", md: "1.02rem" },
                letterSpacing: "0.02em",
                color: "#FFFFFF",
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                ...(featured.headingStyle || {}),
              }}
            >
              {featured.heading || "💄 Make Up Tutorials 💄"}
            </Typography>

            <Stack spacing={1.35}>
              {featuredItems.map((item, index) => {
                const href = openHref(item.link || item.url || "");
                const cardId = `featured.features.${index}`;
                const thumb = item.image || beautyLinkHubProAssets.featured;
                return (
                  <Box
                    key={cardId}
                    {...containerProps(
                      featured.blockId,
                      cardId,
                      item.title || "Featured",
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
                      display: "block",
                      textDecoration: "none",
                      color: textColor,
                      borderRadius: "22px",
                      overflow: "hidden",
                      bgcolor: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      backdropFilter: "blur(10px)",
                      boxShadow: "0 14px 36px rgba(40,28,20,0.28)",
                      transition: "transform 0.2s ease",
                      "&:hover": { transform: "translateY(-2px)" },
                      ...containerStyleSx(featured, cardId),
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: { xs: 168, md: 190 },
                        overflow: "hidden",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          inset: 0,
                          bgcolor: "rgb(0 0 0 / 9%)",
                          pointerEvents: "none",
                          zIndex: 1,
                        },
                      }}
                    >
                      {renderEditableMedia({
                        blockId: featured.blockId,
                        field: `features.${index}.image`,
                        label: "Featured image",
                        src: thumb,
                        alt: item.title || "Featured",
                        sx: {
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        },
                      })}
                    </Box>
                    <Box sx={{ display: "none" }}>
                      <Typography
                        {...getEditableTextProps(
                          featured.blockId,
                          `features.${index}.title`,
                          "single",
                        )}
                      >
                        {item.title || ""}
                      </Typography>
                      <Typography
                        {...getEditableTextProps(
                          featured.blockId,
                          `features.${index}.description`,
                          "single",
                        )}
                      >
                        {item.description || ""}
                      </Typography>
                      <Typography
                        {...getEditableTextProps(
                          featured.blockId,
                          `features.${index}.link`,
                          "single",
                        )}
                      >
                        {item.link || item.url || ""}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </TemplateSectionBoundary>

          {/* Remaining link pills (e.g. Referral Codes) */}
          {remainingLinks.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Stack spacing={1.5}>
                {remainingLinks.map((item, offset) =>
                  renderPillLink(
                    item,
                    offset + 1,
                    links,
                    links.blockId,
                    "links",
                  ),
                )}
              </Stack>
            </Box>
          ) : null}

          {/* Socials — bottom row */}
          <TemplateSectionBoundary
            blockId={socials.blockId}
            label="Social links"
            sectionKey="socials"
            content={socials}
            styleKey="sectionStyle"
            sx={{ mt: 3.5 }}
          >
            <Stack
              direction="row"
              spacing={2.4}
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
                      width: 30,
                      height: 30,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: textColor,
                      textDecoration: "none",
                      opacity: 0.95,
                      filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.25))",
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
                      <Typography
                        {...getEditableTextProps(
                          socials.blockId,
                          `features.${index}.icon`,
                          "single",
                        )}
                      >
                        {item.icon || ""}
                      </Typography>
                    </Box>
                    {renderSavedIcon({
                      value: item.icon || item.title,
                      size: 20,
                    })}
                  </Box>
                );
              })}
            </Stack>
          </TemplateSectionBoundary>

          {/* Products — soft optional cards */}
          {productItems.length > 0 ? (
            <TemplateSectionBoundary
              blockId={products.blockId}
              label="Products"
              sectionKey="products"
              content={products}
              styleKey="sectionStyle"
              id="products"
              sx={{ mt: 3 }}
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
                  fontSize: "0.72rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#FFFFFF",
                  textAlign: "center",
                  ...(products.headingStyle || {}),
                }}
              >
                {products.heading || ""}
              </Typography>
              <Stack spacing={1.35}>
                {productItems.map((item, index) =>
                  renderPillLink(
                    item,
                    index,
                    products,
                    products.blockId,
                    "products",
                  ),
                )}
              </Stack>
            </TemplateSectionBoundary>
          ) : null}

          {/* Contact */}
          <TemplateSectionBoundary
            blockId={contact.blockId}
            label="Contact"
            sectionKey="contact"
            content={contact}
            styleKey="sectionStyle"
            id="contact"
            sx={{ mt: 3.25 }}
          >
            <Box
              {...containerProps(
                contact.blockId,
                "contact.card",
                "Contact card",
                "card",
              )}
              sx={{
                p: 2,
                borderRadius: "22px",
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(12px)",
                ...containerStyleSx(contact, "contact.card"),
              }}
            >
              <Typography
                {...getEditableTextProps(
                  contact.blockId,
                  "heading",
                  "single",
                  "headingStyle",
                )}
                sx={{
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: "1rem",
                  mb: 0.75,
                  color: "#FFFFFF",
                  ...(contact.headingStyle || {}),
                }}
              >
                {contact.heading || "Get in touch"}
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
                  fontSize: "0.84rem",
                  color: "#FFFFFF",
                  mb: 1.5,
                  ...(contact.descriptionStyle || {}),
                }}
              >
                {contact.description || contact.body || ""}
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "grid", gap: 1.1 }}
              >
                {contactFields.map((field) => (
                  <Box
                    key={field.key}
                    component="input"
                    {...getFieldProps(field.key)}
                    placeholder={field.placeholder || field.label}
                    sx={{
                      width: "100%",
                      border: "1px solid rgba(255,255,255,0.28)",
                      borderRadius: 999,
                      px: 1.75,
                      py: 1.15,
                      bgcolor: "rgba(255,255,255,0.14)",
                      color: textColor,
                      outline: "none",
                      fontFamily: bodyFont,
                      fontSize: "0.9rem",
                      "&::placeholder": {
                        color: "#FFFFFF",
                        opacity: 1,
                      },
                    }}
                  />
                ))}
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    mt: 0.5,
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: "rgba(255,255,255,0.92)",
                    color: "#3a2c24",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#fff",
                      boxShadow: "none",
                    },
                  }}
                >
                  <Typography
                    component="span"
                    {...getEditableTextProps(
                      contact.blockId,
                      "buttonLabel",
                      "single",
                    )}
                    sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#3a2c24" }}
                  >
                    {contact.buttonLabel || contact.ctaText || "Join"}
                  </Typography>
                </Button>
                {status === "success" ? (
                  <Typography
                    sx={{
                      textAlign: "center",
                      fontSize: "0.8rem",
                      color: "#FFFFFF",
                    }}
                  >
                    Thanks — you’re on the list.
                  </Typography>
                ) : null}
                {status === "error" && errorMessage ? (
                  <Typography
                    sx={{
                      textAlign: "center",
                      fontSize: "0.8rem",
                      color: "#ffd7d0",
                    }}
                  >
                    {errorMessage}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </TemplateSectionBoundary>

          <TemplateSectionBoundary
            blockId={footer.blockId}
            label="Footer"
            sectionKey="footer"
            content={footer}
            styleKey="sectionStyle"
            sx={{ mt: 2.5, textAlign: "center" }}
          >
            <Typography
              {...getEditableTextProps(
                footer.blockId,
                "heading",
                "single",
                "headingStyle",
              )}
              sx={{
                fontSize: "0.78rem",
                color: "#FFFFFF",
                ...(footer.headingStyle || {}),
              }}
            >
              {footer.heading || displayName}
            </Typography>
            <Typography
              {...getEditableTextProps(footer.blockId, "body", "single")}
              sx={{
                mt: 0.35,
                fontSize: "0.72rem",
                color: "#FFFFFF",
              }}
            >
              {footer.body || "Beauty Link Hub Pro"}
            </Typography>
          </TemplateSectionBoundary>
        </TemplateSectionBoundary>
      </Box>
    </TemplatePageShell>
  );
};

export default BeautyLinkHubProTemplate;
