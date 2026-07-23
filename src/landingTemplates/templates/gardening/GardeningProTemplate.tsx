import React from "react";
import { useLocation } from "react-router-dom";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import type { TemplateProps } from "../../templateEngine/types";
import type { TemplateChromeProps } from "../../templateEngine/templateChromeRegistry";
import TemplatePageShell from "../../components/TemplatePageShell";
import TemplateNavbarHeader from "../../components/TemplateNavbarHeader";
import {
  getEditableSectionProps,
  getEditableTextProps,
} from "../../utils/editableProps";
import { renderEditableMedia } from "../../utils/editableComponents";
import { gardeningProAssets } from "../../assets/gardening/gardening-pro";
import { rgba } from "../company/theme";
import { buildSharedHeaderTheme } from "../../utils/headerTheme";
import { filterHeaderNavigationPages } from "../../utils/headerNavigationPages";
import { useTemplateContactForm } from "../../utils/useTemplateContactForm";
import { normalizeContactFormFields } from "../../../api/formSubmissions";
import {
  footerHasCanonicalLinks,
  normalizeFooterLinks,
} from "../../utils/footerLinks";
import {
  asArray,
  asRecord,
  buildGardeningProTheme,
  containerProps,
  resolveLink,
} from "./gardeningProShared";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";

export const GardeningProTemplateHeader: React.FC<TemplateChromeProps> = ({
  data,
}) => {
  const { headingFont } = buildGardeningProTheme(data);
  const content = asRecord(data.templateContent);
  const navbar = asRecord(content.navbar);
  const blockId = navbar.blockId;
  const fallbackNavItems = [
    { label: "Home", link: "/" },
    { label: "About", link: "/about" },
    { label: "Services", link: "/services" },
    { label: "Contact", link: "/contact" },
  ];
  // Prefer real website pages (Company Executive pattern) so Manage Pages
  // add/delete/visibility stays synced with Header nav.
  const pageNavItems = filterHeaderNavigationPages(data.pages).map((page) => {
    const path = String(page.path || "/").trim() || "/";
    const isHome = Boolean(page.isHome) || path === "/";
    return {
      label: isHome ? "Home" : page.title || "Page",
      link: path,
      target: path,
      id: `page-${String(page.id ?? path)}`,
    };
  });
  const navItems =
    pageNavItems.length > 0
      ? pageNavItems
      : asArray(navbar.navigationItems, fallbackNavItems);
  const brandName =
    typeof navbar.brandName === "string" &&
    navbar.brandName.trim() &&
    navbar.brandName.trim() !== "Your Headline"
      ? navbar.brandName.trim()
      : data.name || "Greenth";

  const headerTheme = buildSharedHeaderTheme(data, navbar, {
    defaultPrimary: "#2D3E2F",
  });

  return (
    <Box {...getEditableSectionProps(blockId, "Header", "sectionStyle")}>
      <TemplateNavbarHeader
        navbarContent={{
          ...navbar,
          brandName,
          ctaText: navbar.ctaText || "Book a Visit",
          ctaUrl: navbar.ctaLink || "/contact",
          navigationItems: navItems,
          navLinkColor: navbar.navLinkColor || headerTheme.navLinkColor,
          ctaColor: navbar.ctaColor || headerTheme.ctaColor,
        }}
        fallbackName={data.name}
        sectionNavItems={navItems.map((item: Record<string, any>) => ({
          label: item.label,
          id: String(item.id || item.label || "").toLowerCase(),
          target: item.link || item.target || "",
        }))}
        themeColor={headerTheme.themeColor}
        headingFont={headingFont}
        bgColor={headerTheme.bgColor}
        borderColor={headerTheme.borderColor}
        websiteId={data.websiteId}
        ctaHoverTextColor={headerTheme.ctaHoverTextColor}
        mobileCtaColor={headerTheme.mobileCtaColor}
        mobileCtaHoverTextColor={headerTheme.mobileCtaHoverTextColor}
      />
    </Box>
  );
};

export const GardeningProTemplateFooter: React.FC<TemplateChromeProps> = ({
  data,
}) => {
  const { forest, forestDeep, lime, headingFont, bodyFont } =
    buildGardeningProTheme(data);
  const content = asRecord(data.templateContent);
  const footer = asRecord(content.footer);
  const blockId = footer.blockId;
  const siteSlug =
    typeof content.__siteSlug === "string" ? content.__siteSlug : undefined;
  const {
    status: newsletterStatus,
    errorMessage: newsletterError,
    getFieldProps: getNewsletterFieldProps,
    handleSubmit: handleNewsletterSubmit,
  } = useTemplateContactForm(
    [{ label: "Email", fieldType: "email", required: true }],
    data.websiteId,
    "footer-newsletter-form",
    { formId: blockId, formName: footer.heading || "Footer newsletter" },
  );
  const footerLogo =
    typeof footer.logo === "string" &&
    footer.logo.trim() &&
    /^(?:https?:\/\/|\/)/i.test(footer.logo.trim())
      ? footer.logo
      : "";
  const footerLogoText =
    typeof footer.logoText === "string" && footer.logoText.trim()
      ? footer.logoText.trim()
      : data.name || "Greenth";
  // Footer nav links are driven entirely by the Footer block's persisted
  // `links` repeater (with a legacy `columns` fallback), so the editor panel
  // and canvas stay in sync and add/edit/remove persists.
  const footerLinks = normalizeFooterLinks(footer);
  const canonicalLinks = footerHasCanonicalLinks(footer);

  return (
    <Box
      component="footer"
      {...getEditableSectionProps(blockId, "Footer", "sectionStyle")}
      sx={{ bgcolor: forestDeep, color: "#eef2eb" }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        {/* Newsletter */}
        <Box
          {...containerProps(
            blockId,
            "footer.newsletter",
            "Newsletter row",
            "card",
          )}
          sx={{
            py: { xs: 5, md: 6 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
            gap: 3,
            alignItems: "center",
            borderBottom: `1px solid ${rgba("#ffffff", 0.1)}`,
          }}
        >
          <Typography
            {...getEditableTextProps(blockId, "heading", "multi")}
            sx={{
              fontFamily: headingFont,
              fontWeight: 500,
              fontSize: { xs: "1.55rem", md: "2rem" },
              maxWidth: 460,
              lineHeight: 1.25,
            }}
          >
            {footer.heading || "Seasonal notes from the studio"}
          </Typography>
          <Box
            component="form"
            onSubmit={handleNewsletterSubmit}
            sx={{ width: "100%" }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Box
                component="input"
                type="email"
                placeholder="Enter your email"
                {...getNewsletterFieldProps("Email")}
                sx={{
                  bgcolor: rgba("#ffffff", 0.06),
                  border: `1px solid ${rgba("#ffffff", 0.16)}`,
                  borderRadius: 0,
                  px: 2.5,
                  py: 1.2,
                  minWidth: { sm: 240 },
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontFamily: bodyFont,
                  outline: "none",
                  "&::placeholder": { color: rgba("#ffffff", 0.5) },
                  "&:focus": { borderColor: rgba(lime, 0.6) },
                }}
              />
              <Button
                type="submit"
                disabled={newsletterStatus === "loading"}
                {...getEditableTextProps(blockId, "ctaText", "single")}
                sx={{
                  bgcolor: lime,
                  color: forestDeep,
                  borderRadius: 0,
                  px: 3,
                  fontWeight: 700,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: lime, opacity: 0.9 },
                }}
              >
                {newsletterStatus === "loading"
                  ? "Subscribing…"
                  : footer.ctaText || "Subscribe"}
              </Button>
            </Stack>
            {newsletterStatus === "success" && (
              <Typography
                sx={{
                  mt: 1.2,
                  color: lime,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                Thanks for subscribing!
              </Typography>
            )}
            {newsletterStatus === "error" && (
              <Typography
                sx={{
                  mt: 1.2,
                  color: "#ffb4a8",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                {newsletterError}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Columns */}
        <Box
          sx={{
            py: { xs: 5, md: 6 },
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.5fr repeat(2, 1fr) auto",
            },
            gap: 4,
            alignItems: "start",
          }}
        >
          <Box>
            {footerLogo ? (
              renderEditableMedia({
                blockId,
                field: "logo",
                label: "Footer logo",
                src: footerLogo,
                alt: data.name || "Greenth",
                sx: {
                  width: "min(180px, 100%)",
                  height: 44,
                  objectFit: "contain",
                },
              })
            ) : (
              <Typography
                {...getEditableTextProps(blockId, "logoText", "single")}
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 600,
                  fontSize: "1.7rem",
                  color: "#fff",
                }}
              >
                {footerLogoText}
              </Typography>
            )}
            <Typography
              {...getEditableTextProps(blockId, "description", "multi")}
              sx={{
                mt: 1.5,
                color: rgba("#ffffff", 0.58),
                lineHeight: 1.7,
                maxWidth: 300,
                fontSize: "0.92rem",
              }}
            >
              {footer.description ||
                "A landscape studio crafting gardens that feel settled, seasonal, and quietly remarkable."}
            </Typography>
          </Box>

          <Box
            {...containerProps(blockId, "footer.links", "Footer links", "card")}
            sx={{
              gridColumn: { md: "span 2" },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.3,
              alignContent: "start",
            }}
          >
            {footerLinks.map((link, linkIndex) => (
              <Box
                key={`${link.label}-${linkIndex}`}
                component="a"
                href={resolveLink(link.url, siteSlug)}
                {...(canonicalLinks
                  ? getEditableTextProps(
                      blockId,
                      `links.${linkIndex}.label`,
                      "single",
                    )
                  : {})}
                sx={{
                  color: rgba("#ffffff", 0.55),
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  "&:hover": { color: lime },
                }}
              >
                {link.label}
              </Box>
            ))}
          </Box>

          <Box
            {...containerProps(
              blockId,
              "footer.portrait",
              "Footer portrait",
              "card",
            )}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {renderEditableMedia({
              blockId,
              field: "image",
              label: "Footer portrait",
              src: footer.image || gardeningProAssets.footerPortrait,
              alt: "Garden portrait",
              sx: {
                width: 160,
                height: 200,
                objectFit: "cover",
                display: "block",
              },
            })}
          </Box>
        </Box>

        <Typography
          {...getEditableTextProps(blockId, "copyright", "single")}
          sx={{
            py: 3,
            borderTop: `1px solid ${rgba("#ffffff", 0.1)}`,
            color: rgba("#ffffff", 0.4),
            fontSize: "0.8rem",
            textAlign: "center",
            fontFamily: bodyFont,
          }}
        >
          {footer.copyright ||
            `© 2026 ${data.name || "Greenth"}. All Rights Reserved.`}
        </Typography>
      </Container>
    </Box>
  );
};

const GardeningProTemplate: React.FC<TemplateProps> = ({ data }) => {
  const theme = buildGardeningProTheme(data);
  const { creamSoft, ink, bodyFont } = theme;
  const content = asRecord(data.templateContent);
  const pageBodies = asRecord(content.pageBodies);
  const home = asRecord(pageBodies.home);
  const about = asRecord(pageBodies.about);
  const services = asRecord(pageBodies.services);
  const contactBody = asRecord(pageBodies.contact);
  const contactPage = asRecord(contactBody.contact || content.contact);
  const siteSlug =
    typeof content.__siteSlug === "string" ? content.__siteSlug : undefined;

  // Contact form fields are fully dynamic — sourced from the CONTACT block's
  // persisted `formFields` (the editor's "Form Fields" repeater) so the canvas,
  // Save, Live Preview, and public site always match what the editor shows.
  const contactFields = React.useMemo(
    () => normalizeContactFormFields(contactPage.formFields, contactPage),
    [contactPage],
  );

  const contactForm = useTemplateContactForm(
    contactFields,
    data.websiteId,
    "contact-page-form",
    {
      formId: contactPage.blockId,
      formName: contactPage.formHeading || contactPage.heading || "Contact page form",
    },
  );

  const location = useLocation();
  const previewPageMatch = location.pathname.match(
    /^\/landing-preview\/[^/]+\/([^/?#]+)/,
  );
  const publicSitePageMatch = location.pathname.match(
    /^\/site\/[^/]+\/([^/?#]+)/,
  );
  const editorPagePath =
    typeof content.__activePagePath === "string"
      ? content.__activePagePath.replace(/^\/+|\/+$/g, "")
      : "";
  const requestedPage =
    editorPagePath ||
    previewPageMatch?.[1] ||
    publicSitePageMatch?.[1] ||
    "home";
  const activePage = (
    ["about", "services", "contact"].includes(requestedPage)
      ? requestedPage
      : requestedPage === "home" || !requestedPage
        ? "home"
        : "dynamic"
  ) as "home" | "about" | "services" | "contact" | "dynamic";

  // Dynamic pages (Blog, user-added) are rendered by page-shell at the host
  // level. If this full template still mounts for an unknown path, do not fall
  // back to Home body content.
  const pageContent =
    activePage === "about" ? (
      <AboutPage theme={theme} about={about} />
    ) : activePage === "services" ? (
      <ServicesPage theme={theme} services={services} siteSlug={siteSlug} />
    ) : activePage === "contact" ? (
      <ContactPage
        theme={theme}
        contactBody={contactBody}
        form={contactForm}
        fields={contactFields}
      />
    ) : activePage === "dynamic" ? null : (
      <HomePage theme={theme} home={home} content={content} />
    );

  return (
    <TemplatePageShell templateId="gardening-pro" data={data}>
      <Box sx={{ fontFamily: bodyFont, color: ink, bgcolor: creamSoft }}>
        {pageContent}
      </Box>
    </TemplatePageShell>
  );
};

export default GardeningProTemplate;
