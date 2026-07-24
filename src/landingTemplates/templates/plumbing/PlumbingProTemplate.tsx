import React from "react";
import { useLocation } from "react-router-dom";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Mail, MapPin, Phone } from "lucide-react";
import type { TemplateProps } from "../../templateEngine/types";
import type { TemplateChromeProps } from "../../templateEngine/templateChromeRegistry";
import TemplatePageShell from "../../components/TemplatePageShell";
import TemplateNavbarHeader from "../../components/TemplateNavbarHeader";
import {
  getEditableSectionProps,
  getEditableTextProps,
} from "../../utils/editableProps";
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
  buildPlumbingProTheme,
  containerProps,
  resolveLink,
  PLUMBING_PRO_NAVY,
} from "./plumbingProShared";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";

export const PlumbingProTemplateHeader: React.FC<TemplateChromeProps> = ({
  data,
}) => {
  const { headingFont } = buildPlumbingProTheme(data);
  const content = asRecord(data.templateContent);
  const navbar = asRecord(content.navbar);
  const blockId = navbar.blockId;
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fallbackNavItems = [
    { label: "Home", link: "/" },
    { label: "About", link: "/about" },
    { label: "Services", link: "/services" },
    { label: "Contact", link: "/contact" },
  ];
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
      : data.name || "QuickFix";

  // Transparent-by-default overlay header. Manual editor background still wins.
  // After scroll (light body sections), use a solid navy bar so white text stays
  // readable — only when the transparent default is active.
  const headerTheme = buildSharedHeaderTheme(data, navbar, {
    defaultPrimary: "#1D7BFF",
    defaultBackground: "transparent",
    transparentText: "light",
  });
  const overlayActive = !headerTheme.hasManualBackground;
  const bgColor = overlayActive
    ? scrolled
      ? PLUMBING_PRO_NAVY
      : "transparent"
    : headerTheme.bgColor;
  const navLinkColor = overlayActive
    ? "#ffffff"
    : navbar.navLinkColor || headerTheme.navLinkColor;
  const ctaColor = overlayActive
    ? "#ffffff"
    : navbar.ctaColor || headerTheme.ctaColor;
  const borderColor = overlayActive
    ? "#ffffff2b"
    : headerTheme.borderColor;

  return (
    <Box
      {...getEditableSectionProps(blockId, "Header", "sectionStyle")}
      sx={{
        // Keep sticky header in flow but allow heroes to pull under it via
        // negative margin so the transparent default sits on the imagery.
        position: "sticky",
        top: 0,
        zIndex: 30,
        // Kill the frosted solid look while the transparent default is active
        // and the user has not scrolled onto light content yet.
        "& header":
          overlayActive && !scrolled
            ? {
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
                backgroundColor: "transparent",
              }
            : undefined,
      }}
    >
      <TemplateNavbarHeader
        navbarContent={{
          ...navbar,
          brandName,
          ctaText: navbar.ctaText || "Book A Plumber",
          ctaUrl: navbar.ctaLink || "/contact",
          navigationItems: navItems,
          navLinkColor,
          ctaColor,
          sticky: false,
        }}
        fallbackName={data.name}
        sectionNavItems={navItems.map((item: Record<string, any>) => ({
          label: item.label,
          id: String(item.id || item.label || "").toLowerCase(),
          target: item.link || item.target || "",
        }))}
        themeColor={headerTheme.themeColor}
        headingFont={headingFont}
        bgColor={bgColor}
        borderColor={borderColor}
        websiteId={data.websiteId}
        ctaHoverTextColor={
          overlayActive ? PLUMBING_PRO_NAVY : headerTheme.ctaHoverTextColor
        }
        mobileCtaColor={headerTheme.mobileCtaColor}
        mobileCtaHoverTextColor={headerTheme.mobileCtaHoverTextColor}
      />
    </Box>
  );
};

export const PlumbingProTemplateFooter: React.FC<TemplateChromeProps> = ({
  data,
}) => {
  const { blue, yellow, navy, headingFont, bodyFont } =
    buildPlumbingProTheme(data);
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
    { formId: blockId, formName: footer.newsletterHeading || "Footer newsletter" },
  );
  const footerLogoText =
    typeof footer.logoText === "string" && footer.logoText.trim()
      ? footer.logoText.trim()
      : data.name || "QuickFix";
  const footerLinks = normalizeFooterLinks(footer);
  const canonicalLinks = footerHasCanonicalLinks(footer);

  return (
    <Box
      component="footer"
      {...getEditableSectionProps(blockId, "Footer", "sectionStyle")}
      sx={{ bgcolor: navy, color: "#e8eef8", fontFamily: bodyFont }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            py: { xs: 5, md: 7 },
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1.4fr 1fr 1.2fr 1.3fr",
            },
            gap: 4,
          }}
        >
          <Box>
            <Typography
              {...getEditableTextProps(blockId, "logoText", "single")}
              sx={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: "1.55rem",
                color: "#fff",
              }}
            >
              {footerLogoText}
            </Typography>
            <Typography
              {...getEditableTextProps(blockId, "description", "multi")}
              sx={{
                mt: 1.5,
                color: rgba("#ffffff", 0.62),
                lineHeight: 1.7,
                maxWidth: 300,
                fontSize: "0.9rem",
              }}
            >
              {footer.description ||
                "QuickFix provides reliable electrical and plumbing services for homes and businesses with licensed technicians on call."}
            </Typography>
          </Box>

          <Box {...containerProps(blockId, "footer.links", "Footer links", "card")}>
            <Typography
              {...getEditableTextProps(blockId, "linksHeading", "single")}
              sx={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                mb: 2,
                color: "#fff",
              }}
            >
              {footer.linksHeading || "LINKS"}
            </Typography>
            <Stack spacing={1.1}>
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
                    color: rgba("#ffffff", 0.62),
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    "&:hover": { color: yellow },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Stack>
          </Box>

          <Box {...containerProps(blockId, "footer.info", "Footer info", "card")}>
            <Typography
              {...getEditableTextProps(blockId, "infoHeading", "single")}
              sx={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                mb: 2,
                color: "#fff",
              }}
            >
              {footer.infoHeading || "INFO"}
            </Typography>
            <Stack spacing={1.4}>
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <MapPin size={16} color={yellow} style={{ marginTop: 2 }} />
                <Typography
                  {...getEditableTextProps(blockId, "address", "multi")}
                  sx={{ color: rgba("#ffffff", 0.62), fontSize: "0.88rem", lineHeight: 1.5 }}
                >
                  {footer.address ||
                    data.contact?.address ||
                    "455 West Orchard Street, Light City, UK"}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Phone size={16} color={yellow} />
                <Typography
                  {...getEditableTextProps(blockId, "phone", "single")}
                  sx={{ color: rgba("#ffffff", 0.62), fontSize: "0.88rem" }}
                >
                  {footer.phone || data.contact?.phone || "+1 (123) 005 763"}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Mail size={16} color={yellow} />
                <Typography
                  {...getEditableTextProps(blockId, "email", "single")}
                  sx={{ color: rgba("#ffffff", 0.62), fontSize: "0.88rem" }}
                >
                  {footer.email || data.contact?.email || "hello@quickfix.com"}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Box>
            <Typography
              {...getEditableTextProps(blockId, "newsletterHeading", "single")}
              sx={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                mb: 2,
                color: "#fff",
              }}
            >
              {footer.newsletterHeading || "NEWSLETTER"}
            </Typography>
            <Typography
              {...getEditableTextProps(blockId, "newsletterBody", "multi")}
              sx={{ color: rgba("#ffffff", 0.62), fontSize: "0.88rem", mb: 1.5 }}
            >
              {footer.newsletterBody || "Sign up to get updates & news."}
            </Typography>
            <Box component="form" onSubmit={handleNewsletterSubmit}>
              <Stack spacing={1.2}>
                <Box
                  component="input"
                  type="email"
                  placeholder="Email Address"
                  {...getNewsletterFieldProps("Email")}
                  sx={{
                    bgcolor: rgba("#ffffff", 0.08),
                    border: `1px solid ${rgba("#ffffff", 0.14)}`,
                    borderRadius: "10px",
                    px: 2,
                    py: 1.2,
                    color: "#fff",
                    fontSize: "0.85rem",
                    fontFamily: bodyFont,
                    outline: "none",
                    "&::placeholder": { color: rgba("#ffffff", 0.45) },
                  }}
                />
                <Button
                  type="submit"
                  disabled={newsletterStatus === "loading"}
                  {...getEditableTextProps(blockId, "ctaText", "single")}
                  sx={{
                    bgcolor: blue,
                    color: "#fff",
                    borderRadius: "10px",
                    px: 2.5,
                    py: 1.1,
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    "&:hover": { bgcolor: blue, opacity: 0.92 },
                  }}
                >
                  {newsletterStatus === "loading"
                    ? "Subscribing…"
                    : footer.ctaText || "SUBSCRIBE NOW"}
                </Button>
              </Stack>
              {newsletterStatus === "success" && (
                <Typography sx={{ mt: 1, color: yellow, fontSize: "0.8rem", fontWeight: 600 }}>
                  Thanks for subscribing!
                </Typography>
              )}
              {newsletterStatus === "error" && (
                <Typography sx={{ mt: 1, color: "#ffb4a8", fontSize: "0.8rem", fontWeight: 600 }}>
                  {newsletterError}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            borderTop: `1px solid ${rgba("#ffffff", 0.1)}`,
            py: 2.5,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            justifyContent: "space-between",
            alignItems: { sm: "center" },
          }}
        >
          <Typography
            {...getEditableTextProps(blockId, "copyright", "single")}
            sx={{ color: rgba("#ffffff", 0.5), fontSize: "0.82rem" }}
          >
            {footer.copyright ||
              `© ${new Date().getFullYear()} All Right Reserved by ${footerLogoText}`}
          </Typography>
          <Typography
            {...getEditableTextProps(blockId, "legalText", "single")}
            sx={{ color: rgba("#ffffff", 0.5), fontSize: "0.82rem" }}
          >
            {footer.legalText || "Privacy Policy | Terms of Use"}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const PlumbingProTemplate: React.FC<TemplateProps> = ({ data }) => {
  const theme = buildPlumbingProTheme(data);
  const { softGray, ink, bodyFont } = theme;
  const content = asRecord(data.templateContent);
  const pageBodies = asRecord(content.pageBodies);
  const home = asRecord(pageBodies.home);
  const about = asRecord(pageBodies.about);
  const services = asRecord(pageBodies.services);
  const contactBody = asRecord(pageBodies.contact);
  const contactPage = asRecord(contactBody.contact || content.contact);
  const siteSlug =
    typeof content.__siteSlug === "string" ? content.__siteSlug : undefined;

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
      formName:
        contactPage.formHeading || contactPage.heading || "Contact page form",
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

  const pageContent =
    activePage === "about" ? (
      <AboutPage theme={theme} about={about} siteSlug={siteSlug} />
    ) : activePage === "services" ? (
      <ServicesPage theme={theme} services={services} siteSlug={siteSlug} />
    ) : activePage === "contact" ? (
      <ContactPage
        theme={theme}
        contactBody={contactBody}
        form={contactForm}
        fields={contactFields}
        siteSlug={siteSlug}
      />
    ) : activePage === "dynamic" ? null : (
      <HomePage theme={theme} home={home} content={content} />
    );

  return (
    <TemplatePageShell templateId="plumbing-pro" data={data}>
      <Box sx={{ fontFamily: bodyFont, color: ink, bgcolor: softGray }}>
        {pageContent}
      </Box>
    </TemplatePageShell>
  );
};

export default PlumbingProTemplate;
