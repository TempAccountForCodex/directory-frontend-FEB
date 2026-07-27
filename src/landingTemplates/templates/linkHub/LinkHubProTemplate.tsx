import React from "react";
import { Box, Button, Stack, Typography, keyframes } from "@mui/material";
import { ExternalLink, Mail } from "lucide-react";
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
import { linkHubProAssets } from "../../assets/link-hub/link-hub-pro";
import { renderSavedIcon } from "../../../components/IconLibrary";

const headingFont = '"Sora", "Avenir Next", "Segoe UI", sans-serif';
const bodyFont = '"DM Sans", "Segoe UI", sans-serif';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const softPulse = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

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

const resolveLink = (href: string, siteSlug?: string) =>
  resolveTemplateInternalLink(href, { siteSlug });

const isExternalHref = (href: string) =>
  /^(https?:\/\/|mailto:|tel:)/i.test(href.trim());

const visibleFeatures = (items: Record<string, any>[]) =>
  items.filter((item) => item?.isVisible !== false);

const glassCard = {
  bgcolor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
};

/** Link Hub keeps shared Header minimal / hidden on all pages. */
export const LinkHubProTemplateHeader: React.FC<TemplateChromeProps> = () =>
  null;

export const LinkHubProTemplateFooter: React.FC<TemplateChromeProps> = ({
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
        py: 3,
        px: 2,
        textAlign: "center",
        color: "rgba(255,255,255,0.55)",
        bgcolor: "transparent",
      }}
    >
      <Typography
        {...getEditableTextProps(blockId, "heading", "single")}
        sx={{ fontFamily: bodyFont, fontSize: "0.85rem" }}
      >
        {footer.heading || data.name || "Link Hub"}
      </Typography>
    </Box>
  );
};

const LinkHubProTemplate: React.FC<TemplateProps> = ({ data }) => {
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
    data.themeSettings?.primaryColor || data.primaryColor || "#7C5CFF";
  const ink = "#07070D";
  const paper = "#F4F2FF";

  const avatarSrc =
    profile.image || profile.heroImage || linkHubProAssets.avatar;
  const displayName = profile.heading || data.name || "Alex Rivera";
  const handle = profile.subheading || "@alexcreates";
  const bio =
    profile.body ||
    profile.description ||
    data.description ||
    "Creator, designer, and builder of calm digital products.";

  const socialItems = visibleFeatures(asArray(socials.features, []));
  const featuredItems = visibleFeatures(asArray(featured.features, []));
  const linkItems = visibleFeatures(asArray(links.features, []));
  const productItems = visibleFeatures(asArray(products.features, []));

  const contactFields = normalizeContactFormFields(contact.formFields, contact);
  const { status, errorMessage, getFieldProps, handleSubmit } =
    useTemplateContactForm(contactFields, data.websiteId, "link-hub-pro-form", {
      formId: contact.blockId,
      formName: contact.heading || "Link Hub signup",
    });

  const openHref = (raw: string) => {
    const href = String(raw || "").trim();
    if (!href || href === "#") return undefined;
    if (isExternalHref(href)) return href;
    return resolveLink(href, siteSlug);
  };

  const sectionBg =
    asRecord(profile.sectionStyle).backgroundImageUrl ||
    asRecord(profile.sectionStyle).backgroundImage ||
    profile.heroImage ||
    linkHubProAssets.background;

  const linkButtonSx = {
    width: "100%",
    minHeight: 64,
    borderRadius: 3.5,
    px: 2.1,
    py: 1.55,
    bgcolor: "rgba(255,255,255,0.08)",
    color: paper,
    boxShadow: "0 12px 36px rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    textTransform: "none" as const,
    fontFamily: bodyFont,
    fontWeight: 700,
    fontSize: "0.98rem",
    justifyContent: "space-between",
    transition:
      "transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease, border-color 0.25s ease",
    "&:hover": {
      bgcolor: "rgba(255,255,255,0.14)",
      borderColor: `${primary}88`,
      transform: "translateY(-3px)",
      boxShadow: `0 18px 44px rgba(0,0,0,0.32), 0 0 0 1px ${primary}44`,
    },
  };

  return (
    <TemplatePageShell
      templateId="link-hub-pro"
      data={data}
      mode="full-template"
    >
      <Box
        sx={{
          minHeight: "100vh",
          fontFamily: bodyFont,
          color: paper,
          position: "relative",
          overflow: "hidden",
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, ${primary}40 0%, transparent 55%),
            radial-gradient(circle at 85% 20%, rgba(120,80,255,0.18) 0%, transparent 35%),
            radial-gradient(circle at 10% 60%, rgba(56,189,248,0.08) 0%, transparent 40%),
            linear-gradient(180deg, #12101c 0%, ${ink} 52%, #050508 100%)
          `,
        }}
      >
        {/* Soft abstract orbs (CSS fallback layer) */}
        <Box
          aria-hidden
          sx={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -80,
              left: "50%",
              width: 420,
              height: 420,
              ml: "-210px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${primary}55 0%, transparent 70%)`,
              filter: "blur(40px)",
              animation: `${softPulse} 8s ease-in-out infinite`,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 180,
              right: -60,
              width: 260,
              height: 260,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(236,72,153,0.28) 0%, transparent 70%)",
              filter: "blur(36px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 120,
              left: -40,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)",
              filter: "blur(32px)",
            }}
          />
        </Box>

        <TemplateSectionBoundary
          blockId={profile.blockId}
          label="Profile"
          sectionKey="profile"
          content={profile}
          styleKey="sectionStyle"
          sx={{
            position: "relative",
            zIndex: 1,
            overflow: "hidden",
            px: { xs: 2, sm: 3 },
            pt: { xs: 4.5, md: 6 },
            pb: 1,
            "&::after": {
              content: '""',
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,1) 50%, transparent 100%)",
              pointerEvents: "none",
              zIndex: 2,
            },
          }}
        >
          {/* Editable header visual — creator abstract (local asset) + soft wash */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `
                linear-gradient(180deg, rgba(7,7,13,0.25) 0%, rgba(7,7,13,0.55) 45%, ${ink} 100%),
                url(${sectionBg})
              `,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              filter: "saturate(1.05)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, ${primary}18 0%, transparent 40%, ${ink} 100%)`,
            }}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              width: 0,
              height: 0,
              overflow: "hidden",
              opacity: 0,
            }}
            aria-hidden
          >
            {renderEditableMedia({
              blockId: profile.blockId,
              field: "heroImage",
              label: "Page background image",
              src: sectionBg,
              alt: "Background",
              sx: { width: 1, height: 1 },
            })}
          </Box>

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              maxWidth: 440,
              mx: "auto",
              textAlign: "center",
              animation: `${fadeUp} 0.7s ease both`,
            }}
          >
            {/* Premium avatar card */}
            <Box
              {...containerProps(
                profile.blockId,
                "profile.avatar",
                "Profile avatar",
                "card",
              )}
              sx={{
                width: 124,
                height: 124,
                mx: "auto",
                borderRadius: "50%",
                p: "3px",
                background: `linear-gradient(145deg, ${primary}, rgba(255,255,255,0.55) 45%, ${primary}88)`,
                boxShadow: `0 0 0 8px ${primary}22, 0 22px 48px rgba(0,0,0,0.45)`,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid rgba(7,7,13,0.65)",
                  bgcolor: "#12101c",
                }}
              >
                {renderEditableMedia({
                  blockId: profile.blockId,
                  field: "image",
                  label: "Profile avatar",
                  src: avatarSrc,
                  alt: displayName,
                  style: profile.imageStyle,
                  sx: {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  },
                })}
              </Box>
            </Box>

            <Typography
              {...getEditableTextProps(profile.blockId, "heading", "single")}
              sx={{
                mt: 2.4,
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: { xs: "1.75rem", md: "1.95rem" },
                letterSpacing: "-0.035em",
                textShadow: "0 8px 28px rgba(0,0,0,0.35)",
              }}
            >
              {displayName}
            </Typography>
            <Typography
              {...getEditableTextProps(profile.blockId, "subheading", "single")}
              sx={{
                mt: 0.7,
                display: "inline-flex",
                px: 1.4,
                py: 0.35,
                borderRadius: 999,
                bgcolor: `${primary}22`,
                border: `1px solid ${primary}55`,
                color: "#E8E0FF",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              {handle}
            </Typography>
            <Typography
              {...getEditableTextProps(profile.blockId, "body", "multi")}
              sx={{
                my: 1.6,
                color: "rgba(244,242,255,0.78)",
                fontSize: "0.98rem",
                lineHeight: 1.7,
                maxWidth: 360,
                mx: "auto",
              }}
            >
              {bio}
            </Typography>
          </Box>
        </TemplateSectionBoundary>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            px: { xs: 2, sm: 3 },
            pb: { xs: 7, md: 9 },
          }}
        >
          <Box sx={{ maxWidth: 440, mx: "auto", pt: 2.25 }}>
            {/* Socials */}
            <TemplateSectionBoundary
              blockId={socials.blockId}
              label="Social links"
              sectionKey="socials"
              content={socials}
              styleKey="sectionStyle"
              sx={{
                mt: 0.5,
                animation: `${fadeUp} 0.7s ease 0.08s both`,
              }}
            >
              <Stack
                direction="row"
                spacing={1.4}
                justifyContent="center"
                flexWrap="wrap"
                useFlexGap
              >
                {socialItems.map((item, index) => {
                  const href = openHref(item.link || item.url || "");
                  return (
                    <Box
                      key={`social-${index}`}
                      {...containerProps(
                        socials.blockId,
                        `socials.features.${index}`,
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
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(255,255,255,0.08)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.16)",
                        backdropFilter: "blur(12px)",
                        textDecoration: "none",
                        transition:
                          "transform 0.22s ease, background 0.22s ease, box-shadow 0.22s ease",
                        "&:hover": {
                          transform: "translateY(-3px) scale(1.04)",
                          bgcolor: primary,
                          boxShadow: `0 12px 28px ${primary}55`,
                        },
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
                          {item.title}
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
              sx={{
                mt: 3.25,
                animation: `${fadeUp} 0.7s ease 0.14s both`,
              }}
            >
              {featuredItems.slice(0, 1).map((item, index) => {
                const href = openHref(item.link || item.url || "");
                return (
                  <Box
                    key={`featured-${index}`}
                    {...containerProps(
                      featured.blockId,
                      `featured.features.${index}`,
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
                      color: "inherit",
                      borderRadius: 4,
                      overflow: "hidden",
                      ...glassCard,
                      border: `1px solid ${primary}33`,
                      transition:
                        "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        borderColor: `${primary}77`,
                        boxShadow: `0 24px 56px rgba(0,0,0,0.38), 0 0 0 1px ${primary}44`,
                      },
                    }}
                  >
                    {renderEditableMedia({
                      blockId: featured.blockId,
                      field: `features.${index}.image`,
                      label: "Featured image",
                      src: item.image || linkHubProAssets.featured,
                      alt: item.title || "Featured",
                      sx: {
                        width: "100%",
                        aspectRatio: "16 / 10",
                        objectFit: "cover",
                        display: "block",
                      },
                    })}
                    <Box
                      sx={{
                        p: 2.25,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
                      }}
                    >
                      <Typography
                        {...getEditableTextProps(
                          featured.blockId,
                          `features.${index}.title`,
                          "single",
                        )}
                        sx={{
                          fontFamily: headingFont,
                          fontWeight: 700,
                          fontSize: "1.12rem",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {item.title || "Featured drop"}
                      </Typography>
                      <Typography
                        {...getEditableTextProps(
                          featured.blockId,
                          `features.${index}.description`,
                          "multi",
                        )}
                        sx={{
                          mt: 0.7,
                          color: "rgba(244,242,255,0.72)",
                          fontSize: "0.9rem",
                          lineHeight: 1.55,
                        }}
                      >
                        {item.description || "Explore the featured link."}
                      </Typography>
                      <Typography
                        {...getEditableTextProps(
                          featured.blockId,
                          `features.${index}.link`,
                          "single",
                        )}
                        sx={{
                          mt: 1.25,
                          color: primary,
                          fontSize: "0.8rem",
                          fontWeight: 700,
                        }}
                      >
                        {item.link || item.url || "https://"}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </TemplateSectionBoundary>

            {/* Links */}
            <TemplateSectionBoundary
              blockId={links.blockId}
              label="Links"
              sectionKey="links"
              content={links}
              styleKey="sectionStyle"
              id="links"
              sx={{ mt: 2.75 }}
            >
              <Stack spacing={1.45}>
                {linkItems.map((item, index) => {
                  const href = openHref(item.link || item.url || "");
                  return (
                    <Box
                      key={`link-${index}`}
                      {...containerProps(
                        links.blockId,
                        `links.features.${index}`,
                        item.title || `Link ${index + 1}`,
                        "card",
                      )}
                      sx={{
                        animation: `${fadeUp} 0.65s ease ${0.18 + index * 0.07}s both`,
                      }}
                    >
                      <Button
                        component={href ? "a" : "button"}
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
                        endIcon={
                          <ExternalLink size={15} style={{ opacity: 0.7 }} />
                        }
                        sx={linkButtonSx}
                      >
                        <Box sx={{ textAlign: "left", minWidth: 0, flex: 1 }}>
                          <Typography
                            {...getEditableTextProps(
                              links.blockId,
                              `features.${index}.title`,
                              "single",
                            )}
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.98rem",
                              color: paper,
                            }}
                          >
                            {item.title || `Link ${index + 1}`}
                          </Typography>
                          {item.description ? (
                            <Typography
                              {...getEditableTextProps(
                                links.blockId,
                                `features.${index}.description`,
                                "single",
                              )}
                              sx={{
                                mt: 0.25,
                                fontSize: "0.78rem",
                                color: "rgba(244,242,255,0.58)",
                              }}
                            >
                              {item.description}
                            </Typography>
                          ) : null}
                          <Typography
                            {...getEditableTextProps(
                              links.blockId,
                              `features.${index}.link`,
                              "single",
                            )}
                            sx={{
                              mt: 0.35,
                              fontSize: "0.7rem",
                              color: "rgba(244,242,255,0.4)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.link || item.url || ""}
                          </Typography>
                        </Box>
                      </Button>
                    </Box>
                  );
                })}
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
              sx={{
                mt: 3.5,
                animation: `${fadeUp} 0.7s ease 0.32s both`,
              }}
            >
              <Typography
                {...getEditableTextProps(products.blockId, "heading", "single")}
                sx={{
                  mb: 1.6,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: "1.02rem",
                  letterSpacing: "-0.02em",
                  color: "rgba(244,242,255,0.92)",
                }}
              >
                {products.heading || "Products & services"}
              </Typography>
              <Stack spacing={1.45}>
                {productItems.map((item, index) => {
                  const href = openHref(item.link || item.url || "");
                  return (
                    <Box
                      key={`product-${index}`}
                      {...containerProps(
                        products.blockId,
                        `products.features.${index}`,
                        item.title || `Product ${index + 1}`,
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
                        display: "grid",
                        gridTemplateColumns: "76px 1fr",
                        gap: 1.55,
                        alignItems: "center",
                        p: 1.15,
                        borderRadius: 3.5,
                        textDecoration: "none",
                        color: "inherit",
                        ...glassCard,
                        transition:
                          "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          borderColor: `${primary}66`,
                          boxShadow: `0 20px 44px rgba(0,0,0,0.34), 0 0 0 1px ${primary}33`,
                        },
                      }}
                    >
                      {renderEditableMedia({
                        blockId: products.blockId,
                        field: `features.${index}.image`,
                        label: `Product image ${index + 1}`,
                        src: item.image || linkHubProAssets.product,
                        alt: item.title || "Product",
                        sx: {
                          width: 76,
                          height: 76,
                          borderRadius: 2.5,
                          objectFit: "cover",
                          display: "block",
                        },
                      })}
                      <Box sx={{ minWidth: 0, pr: 0.5 }}>
                        <Typography
                          {...getEditableTextProps(
                            products.blockId,
                            `features.${index}.title`,
                            "single",
                          )}
                          sx={{ fontWeight: 700, fontSize: "0.95rem" }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          {...getEditableTextProps(
                            products.blockId,
                            `features.${index}.description`,
                            "single",
                          )}
                          sx={{
                            mt: 0.35,
                            fontSize: "0.8rem",
                            color: "rgba(244,242,255,0.66)",
                          }}
                        >
                          {item.description}
                        </Typography>
                        <Typography
                          {...getEditableTextProps(
                            products.blockId,
                            `features.${index}.link`,
                            "single",
                          )}
                          sx={{
                            mt: 0.45,
                            fontSize: "0.72rem",
                            color: primary,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.link || item.url || ""}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </TemplateSectionBoundary>

            {/* Contact / newsletter */}
            <TemplateSectionBoundary
              blockId={contact.blockId}
              label="Contact"
              sectionKey="contact"
              content={contact}
              styleKey="sectionStyle"
              id="contact"
              sx={{
                mt: 3.75,
                p: { xs: 2.4, sm: 2.75 },
                borderRadius: 4,
                ...glassCard,
                border: `1px solid ${primary}28`,
                animation: `${fadeUp} 0.7s ease 0.4s both`,
              }}
            >
              <Typography
                {...getEditableTextProps(contact.blockId, "heading", "multi")}
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: "1.28rem",
                  letterSpacing: "-0.025em",
                }}
              >
                {contact.heading || "Stay in the loop"}
              </Typography>
              <Typography
                {...getEditableTextProps(
                  contact.blockId,
                  "description",
                  "multi",
                )}
                sx={{
                  mt: 0.85,
                  color: "rgba(244,242,255,0.7)",
                  fontSize: "0.92rem",
                  lineHeight: 1.65,
                }}
              >
                {contact.description ||
                  "Drop your email for drops, collabs, and new links."}
              </Typography>

              <Button
                component="a"
                href={`mailto:${contact.email || data.contact?.email || "hello@example.com"}`}
                startIcon={<Mail size={16} />}
                {...getEditableTextProps(
                  contact.blockId,
                  "buttonLabel",
                  "single",
                  "ctaTextStyle",
                )}
                sx={{
                  mt: 2.15,
                  width: "100%",
                  borderRadius: 999,
                  py: 1.4,
                  bgcolor: primary,
                  color: "#fff",
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: `0 14px 34px ${primary}55`,
                  transition:
                    "transform 0.22s ease, box-shadow 0.22s ease, opacity 0.22s ease",
                  "&:hover": {
                    bgcolor: primary,
                    opacity: 0.94,
                    transform: "translateY(-2px)",
                    boxShadow: `0 18px 40px ${primary}66`,
                  },
                }}
              >
                {contact.buttonLabel || "Email me"}
              </Button>
              <Typography
                {...getEditableTextProps(contact.blockId, "email", "single")}
                sx={{
                  mt: 1.1,
                  textAlign: "center",
                  fontSize: "0.8rem",
                  color: "rgba(244,242,255,0.52)",
                }}
              >
                {contact.email || data.contact?.email || "hello@example.com"}
              </Typography>

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ mt: 2.35, display: "grid", gap: 1.25 }}
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
                        mb: 0.65,
                        fontSize: "0.72rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "rgba(244,242,255,0.52)",
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
                        height: 50,
                        px: 1.6,
                        borderRadius: 2.5,
                        border: "1px solid rgba(255,255,255,0.14)",
                        bgcolor: "rgba(255,255,255,0.06)",
                        color: "#fff",
                        fontSize: "0.95rem",
                        outline: "none",
                        transition:
                          "border-color 0.2s ease, box-shadow 0.2s ease",
                        "&:focus": {
                          borderColor: `${primary}99`,
                          boxShadow: `0 0 0 3px ${primary}33`,
                        },
                        "&::placeholder": {
                          color: "rgba(255,255,255,0.35)",
                        },
                      }}
                    />
                  </Box>
                ))}
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  sx={{
                    mt: 0.55,
                    borderRadius: 999,
                    py: 1.25,
                    bgcolor: "#fff",
                    color: ink,
                    fontWeight: 700,
                    textTransform: "none",
                    transition:
                      "transform 0.22s ease, background-color 0.22s ease",
                    "&:hover": {
                      bgcolor: paper,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {status === "loading"
                    ? "Sending…"
                    : contact.ctaText || "Join list"}
                </Button>
                {errorMessage ? (
                  <Typography sx={{ color: "#ff8f8f", fontSize: "0.82rem" }}>
                    {errorMessage}
                  </Typography>
                ) : null}
                {status === "success" ? (
                  <Typography sx={{ color: "#9dffb0", fontSize: "0.82rem" }}>
                    Thanks — you’re on the list.
                  </Typography>
                ) : null}
              </Box>
            </TemplateSectionBoundary>

            {/* In-page footer branding */}
            <Box
              component="footer"
              {...getEditableSectionProps(
                footer.blockId,
                "Footer",
                "sectionStyle",
              )}
              sx={{
                mt: 4.5,
                textAlign: "center",
                animation: `${fadeUp} 0.7s ease 0.48s both`,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 2,
                  mx: "auto",
                  mb: 2,
                  borderRadius: 99,
                  background: `linear-gradient(90deg, transparent, ${primary}, transparent)`,
                }}
              />
              <Typography
                {...getEditableTextProps(footer.blockId, "heading", "single")}
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 600,
                  fontSize: "0.92rem",
                }}
              >
                {footer.heading || displayName}
              </Typography>
              <Typography
                {...getEditableTextProps(footer.blockId, "body", "multi")}
                sx={{
                  mt: 0.65,
                  fontSize: "0.76rem",
                  color: "rgba(244,242,255,0.42)",
                  letterSpacing: "0.01em",
                }}
              >
                {footer.body || "Link Hub · Share your world in one place."}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </TemplatePageShell>
  );
};

export default LinkHubProTemplate;
