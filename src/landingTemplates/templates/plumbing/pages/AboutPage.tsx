import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Check, Phone, Star } from "lucide-react";
import {
  TemplateInnerContainer,
  TemplateSectionBoundary,
} from "../../../components/TemplateSectionLayout";
import { getEditableTextProps } from "../../../utils/editableProps";
import { renderEditableMedia } from "../../../utils/editableComponents";
import { plumbingProAssets } from "../../../assets/plumbing/plumbing-pro";
import { rgba } from "../../company/theme";
import {
  asArray,
  asRecord,
  containerProps,
  pillSx,
  plumbingProUnderHeaderSx,
  resolveLink,
  resolvePlumbingFeatureIcon,
  type PlumbingProTheme,
} from "../plumbingProShared";

type AboutPageProps = {
  theme: PlumbingProTheme;
  about: Record<string, any>;
  siteSlug?: string;
};

const AboutPage: React.FC<AboutPageProps> = ({ theme, about, siteSlug }) => {
  const { blue, yellow, navy, softGray, ink, inkSoft, headingFont, bodyFont } =
    theme;

  const banner = asRecord(about.banner);
  const valueCards = asRecord(about.valueCards);
  const intro = asRecord(about.intro);
  const members = asRecord(about.members);
  const stats = asRecord(about.stats);
  const why = asRecord(about.why);
  const testimonials = asRecord(about.testimonials);
  const cta = asRecord(about.cta);

  const values = asArray(valueCards.features || valueCards.items, [
    {
      title: "Affordable Price",
      description: "Transparent rates with no surprise fees on residential or commercial jobs.",
      image: plumbingProAssets.service1,
    },
    {
      title: "Expert Plumber",
      description: "Licensed technicians trained for repairs, installs, and emergencies.",
      image: plumbingProAssets.service2,
    },
    {
      title: "Quality Improve",
      description: "Durable parts and careful workmanship that last for years.",
      image: plumbingProAssets.service3,
    },
    {
      title: "100% Certified",
      description: "Fully insured, bonded, and certified for peace of mind.",
      image: plumbingProAssets.service4,
    },
  ]);

  const checklist = asArray(intro.items || intro.features, [
    { title: "Residential and Commercial Services" },
    { title: "Highly skilled and experienced plumbers" },
    { title: "Immediate 24/7 Emergency Service" },
  ]);

  const memberItems = asArray(members.members || members.items, [
    { name: "Sonu Maahi", role: "Plumber", photo: plumbingProAssets.member1 },
    { name: "Alex Rivera", role: "Chief Plumber", photo: plumbingProAssets.member2 },
    { name: "Jordan Lee", role: "Technician", photo: plumbingProAssets.member3 },
    { name: "Morgan Blake", role: "Installer", photo: plumbingProAssets.founder },
  ]);

  const statsItems = asArray(stats.items, [
    { value: "324k", heading: "Satisfied Customer" },
    { value: "250+", heading: "Expert Plumbers" },
    { value: "125k", heading: "Successful Projects" },
    { value: "100%", heading: "Quality Service" },
  ]);

  const whyFeatures = asArray(why.features || why.items, [
    {
      icon: "experience",
      title: "Experience Team",
      description: "Seasoned plumbers who diagnose fast and fix it right the first time.",
    },
    {
      icon: "delivery",
      title: "On-time Delivery",
      description: "Clear arrival windows and methodical work that respects your schedule.",
    },
  ]);

  const reviewItems = asArray(testimonials.testimonials || testimonials.items, [
    {
      name: "Leslie Alexander",
      role: "Homeowner",
      quote: "QuickFix restored our kitchen plumbing overnight. Professional and courteous.",
      photo: plumbingProAssets.clientMorgan,
    },
    {
      name: "Cameron West",
      role: "Property Manager",
      quote: "Reliable commercial support with clear pricing and excellent follow-through.",
      photo: plumbingProAssets.clientTaylor,
    },
  ]);

  return (
    <>
      <TemplateSectionBoundary
        blockId={banner.blockId}
        label="About banner"
        sectionKey="banner"
        content={banner}
        sx={{
          ...plumbingProUnderHeaderSx,
          bgcolor: blue,
          color: "#fff",
          py: { xs: 7, md: 9 },
          textAlign: "center",
        }}
      >
        <TemplateInnerContainer sx={{ maxWidth: 720 }}>
          <Typography
            component="h1"
            {...getEditableTextProps(banner.blockId, "heading", "multi")}
            sx={{
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "2.2rem", md: "3rem" },
              mb: 1.5,
            }}
          >
            {banner.heading || "About Us"}
          </Typography>
          <Typography
            {...getEditableTextProps(banner.blockId, "body", "multi")}
            sx={{ color: rgba("#fff", 0.9), lineHeight: 1.7, fontSize: "1.05rem" }}
          >
            {banner.body ||
              "Professional, dependable, and affordable plumbing solutions for your home or business."}
          </Typography>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={valueCards.blockId}
        label="Value cards"
        sectionKey="valueCards"
        content={valueCards}
        sx={{ bgcolor: softGray, py: { xs: 5, md: 7 } }}
      >
        <TemplateInnerContainer
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 2.5,
          }}
        >
          {values.map((item, index) => (
            <Box
              key={index}
              {...containerProps(
                valueCards.blockId,
                `valueCards.features.${index}`,
                item.title || "Value",
                "card",
              )}
              sx={{
                bgcolor: "#fff",
                borderRadius: "16px",
                p: 3,
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                textAlign: "center",
              }}
            >
              {renderEditableMedia({
                blockId: valueCards.blockId,
                field: `features.${index}.image`,
                label: "Icon image",
                src: item.image || plumbingProAssets.serviceThumbnail,
                alt: item.title || "Value",
                sx: { width: 64, height: 64, objectFit: "cover", borderRadius: "12px", mb: 2, mx: "auto" },
              })}
              <Typography
                {...getEditableTextProps(valueCards.blockId, `features.${index}.title`, "single")}
                sx={{ fontFamily: headingFont, fontWeight: 800, mb: 1, color: ink }}
              >
                {item.title}
              </Typography>
              <Typography
                {...getEditableTextProps(
                  valueCards.blockId,
                  `features.${index}.description`,
                  "multi",
                )}
                sx={{ color: inkSoft, fontSize: "0.9rem", lineHeight: 1.6 }}
              >
                {item.description}
              </Typography>
            </Box>
          ))}
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={intro.blockId}
        label="About intro"
        sectionKey="intro"
        content={intro}
        sx={{ bgcolor: "#fff", py: { xs: 6, md: 9 } }}
      >
        <TemplateInnerContainer
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 4, md: 6 },
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              {...getEditableTextProps(intro.blockId, "eyebrow", "single")}
              sx={{ ...pillSx(rgba(blue, 0.12), blue, bodyFont), mb: 1.5 }}
            >
              {intro.eyebrow || "ABOUT US"}
            </Typography>
            <Typography
              component="h2"
              {...getEditableTextProps(intro.blockId, "heading", "multi")}
              sx={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: { xs: "1.7rem", md: "2.2rem" },
                mb: 2,
                color: ink,
              }}
            >
              {intro.heading || "Smart plumber solution for you 24/7 hours"}
            </Typography>
            <Typography
              {...getEditableTextProps(intro.blockId, "body", "multi")}
              sx={{ color: inkSoft, lineHeight: 1.7, mb: 2.5 }}
            >
              {intro.body ||
                "We combine modern tools with trusted craftsmanship to keep water flowing safely in homes and workplaces."}
            </Typography>
            <Stack spacing={1.2} sx={{ mb: 3 }}>
              {checklist.map((item, index) => (
                <Stack key={index} direction="row" spacing={1.2} alignItems="center">
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      bgcolor: blue,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Check size={13} color="#fff" />
                  </Box>
                  <Typography
                    {...getEditableTextProps(intro.blockId, `items.${index}.title`, "single")}
                    sx={{ fontWeight: 600 }}
                  >
                    {item.title}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Button
              href={resolveLink(intro.ctaLink || "/services", siteSlug)}
              {...getEditableTextProps(intro.blockId, "ctaText", "single")}
              sx={{
                bgcolor: yellow,
                color: navy,
                borderRadius: 999,
                px: 3,
                fontWeight: 800,
                textTransform: "none",
                "&:hover": { bgcolor: yellow, opacity: 0.92 },
              }}
            >
              {intro.ctaText || "Learn More"}
            </Button>
          </Box>
          <Box sx={{ position: "relative" }}>
            {renderEditableMedia({
              blockId: intro.blockId,
              field: "image",
              label: "About image",
              src: intro.image || plumbingProAssets.aboutImage,
              alt: "Plumber",
              sx: {
                width: "100%",
                height: { xs: 300, md: 440 },
                objectFit: "cover",
                borderRadius: "20px",
              },
            })}
            <Box
              sx={{
                position: "absolute",
                left: 16,
                bottom: 16,
                bgcolor: "#fff",
                borderRadius: "14px",
                px: 2.5,
                py: 1.5,
                boxShadow: "0 10px 30px rgba(15,23,42,0.15)",
              }}
            >
              <Typography
                {...getEditableTextProps(intro.blockId, "badgeValue", "single")}
                sx={{ fontFamily: headingFont, fontWeight: 800, fontSize: "1.8rem", color: blue }}
              >
                {intro.badgeValue || "25+"}
              </Typography>
              <Typography
                {...getEditableTextProps(intro.blockId, "badgeLabel", "single")}
                sx={{ fontSize: "0.82rem", fontWeight: 600, color: ink }}
              >
                {intro.badgeLabel || "Years Of Experience"}
              </Typography>
            </Box>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={members.blockId}
        label="Team"
        sectionKey="members"
        content={members}
        sx={{ bgcolor: softGray, py: { xs: 6, md: 9 } }}
      >
        <TemplateInnerContainer>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              {...getEditableTextProps(members.blockId, "eyebrow", "single")}
              sx={{ color: blue, fontWeight: 800, letterSpacing: "0.12em", mb: 1 }}
            >
              {members.eyebrow || "— TEAM MEMBER —"}
            </Typography>
            <Typography
              component="h2"
              {...getEditableTextProps(members.blockId, "heading", "multi")}
              sx={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: { xs: "1.7rem", md: "2.2rem" },
              }}
            >
              {members.heading || "Our hard working members"}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 2.5,
            }}
          >
            {memberItems.map((member, index) => (
              <Box
                key={index}
                {...containerProps(
                  members.blockId,
                  `members.members.${index}`,
                  member.name || "Member",
                  "card",
                )}
                sx={{ bgcolor: "#fff", borderRadius: "16px", overflow: "hidden", textAlign: "center" }}
              >
                <Box sx={{ bgcolor: rgba(blue, 0.12) }}>
                  {renderEditableMedia({
                    blockId: members.blockId,
                    field: `members.${index}.photo`,
                    label: "Photo",
                    src: member.photo || plumbingProAssets.member1,
                    alt: member.name || "Member",
                    sx: { width: "100%", height: 220, objectFit: "cover", objectPosition: "top" },
                  })}
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography
                    {...getEditableTextProps(members.blockId, `members.${index}.name`, "single")}
                    sx={{ fontWeight: 800 }}
                  >
                    {member.name}
                  </Typography>
                  <Typography
                    {...getEditableTextProps(members.blockId, `members.${index}.role`, "single")}
                    sx={{ color: inkSoft, fontSize: "0.88rem" }}
                  >
                    {member.role}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={stats.blockId}
        label="Stats"
        sectionKey="stats"
        content={stats}
        sx={{ bgcolor: blue, color: "#fff" }}
      >
        <TemplateInnerContainer
          sx={{
            py: { xs: 4, md: 5 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 3,
            textAlign: "center",
          }}
        >
          {statsItems.map((stat, index) => (
            <Box key={index}>
              <Typography
                {...getEditableTextProps(stats.blockId, `items.${index}.value`, "single")}
                sx={{ fontFamily: headingFont, fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.2rem" } }}
              >
                {stat.value}
              </Typography>
              <Typography
                {...getEditableTextProps(stats.blockId, `items.${index}.heading`, "single")}
                sx={{ color: rgba("#fff", 0.9) }}
              >
                {stat.heading}
              </Typography>
            </Box>
          ))}
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={why.blockId}
        label="Why choose us"
        sectionKey="why"
        content={why}
        sx={{ bgcolor: "#fff", py: { xs: 6, md: 9 } }}
      >
        <TemplateInnerContainer
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 4, md: 6 },
            alignItems: "center",
          }}
        >
          {renderEditableMedia({
            blockId: why.blockId,
            field: "image",
            label: "Why image",
            src: why.image || plumbingProAssets.whyImage,
            alt: "Experienced plumber",
            sx: {
              width: "100%",
              height: { xs: 280, md: 420 },
              objectFit: "cover",
              borderRadius: "20px",
            },
          })}
          <Box>
            <Typography
              {...getEditableTextProps(why.blockId, "eyebrow", "single")}
              sx={{ ...pillSx(rgba(blue, 0.12), blue, bodyFont), mb: 1.5 }}
            >
              {why.eyebrow || "WHY CHOOSE US"}
            </Typography>
            <Typography
              component="h2"
              {...getEditableTextProps(why.blockId, "heading", "multi")}
              sx={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: { xs: "1.7rem", md: "2.1rem" },
                mb: 3,
              }}
            >
              {why.heading || "We're experience of 24 years in plumbing service"}
            </Typography>
            <Stack spacing={2.5} sx={{ mb: 3 }}>
              {whyFeatures.map((feature, index) => {
                const FeatureIcon = resolvePlumbingFeatureIcon(feature, index);
                return (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        bgcolor: blue,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        color: "#fff",
                        boxShadow: `0 8px 18px ${rgba(blue, 0.35)}`,
                      }}
                    >
                      <FeatureIcon size={20} strokeWidth={2.25} />
                    </Box>
                    <Box>
                      <Typography
                        {...getEditableTextProps(
                          why.blockId,
                          `features.${index}.title`,
                          "single",
                        )}
                        sx={{ fontWeight: 800, mb: 0.5 }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        {...getEditableTextProps(
                          why.blockId,
                          `features.${index}.description`,
                          "multi",
                        )}
                        sx={{ color: inkSoft, lineHeight: 1.6 }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
            <Button
              href={resolveLink(why.ctaLink || `tel:${why.phone || "+1234567890"}`, siteSlug)}
              startIcon={<Phone size={16} />}
              {...getEditableTextProps(why.blockId, "ctaText", "single")}
              sx={{
                bgcolor: yellow,
                color: navy,
                borderRadius: 999,
                px: 3,
                fontWeight: 800,
                textTransform: "none",
                "&:hover": { bgcolor: yellow, opacity: 0.92 },
              }}
            >
              {why.ctaText || why.phone || "(+1) 234 567 890"}
            </Button>
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={testimonials.blockId}
        label="Testimonials"
        sectionKey="testimonials"
        content={testimonials}
        sx={{ bgcolor: softGray, py: { xs: 6, md: 9 } }}
      >
        <TemplateInnerContainer>
          <Box sx={{ mb: 4 }}>
            <Typography
              {...getEditableTextProps(testimonials.blockId, "eyebrow", "single")}
              sx={{ ...pillSx(rgba(blue, 0.12), blue, bodyFont), mb: 1.5 }}
            >
              {testimonials.eyebrow || "CLIENT FEEDBACK"}
            </Typography>
            <Typography
              component="h2"
              {...getEditableTextProps(testimonials.blockId, "heading", "multi")}
              sx={{ fontFamily: headingFont, fontWeight: 800, fontSize: { xs: "1.7rem", md: "2.2rem" } }}
            >
              {testimonials.heading || "315k+ Positive Reviews"}
            </Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
            {reviewItems.map((review, index) => (
              <Box
                key={index}
                {...containerProps(
                  testimonials.blockId,
                  `testimonials.testimonials.${index}`,
                  review.name || "Review",
                  "card",
                )}
                sx={{ bgcolor: "#fff", borderRadius: "18px", p: 3 }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  {renderEditableMedia({
                    blockId: testimonials.blockId,
                    field: `testimonials.${index}.photo`,
                    label: "Avatar",
                    src: review.photo || plumbingProAssets.clientAlex,
                    alt: review.name || "Customer",
                    sx: { width: 48, height: 48, borderRadius: "50%", objectFit: "cover" },
                  })}
                  <Box>
                    <Typography
                      {...getEditableTextProps(
                        testimonials.blockId,
                        `testimonials.${index}.name`,
                        "single",
                      )}
                      sx={{ fontWeight: 800 }}
                    >
                      {review.name}
                    </Typography>
                    <Typography
                      {...getEditableTextProps(
                        testimonials.blockId,
                        `testimonials.${index}.role`,
                        "single",
                      )}
                      sx={{ color: inkSoft, fontSize: "0.82rem" }}
                    >
                      {review.role}
                    </Typography>
                  </Box>
                </Stack>
                <Typography
                  {...getEditableTextProps(
                    testimonials.blockId,
                    `testimonials.${index}.quote`,
                    "multi",
                  )}
                  sx={{ color: inkSoft, lineHeight: 1.7, mb: 1.5 }}
                >
                  {review.quote}
                </Typography>
                <Stack direction="row" spacing={0.3}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={14} fill={yellow} color={yellow} />
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>

      <TemplateSectionBoundary
        blockId={cta.blockId}
        label="CTA banner"
        sectionKey="cta"
        content={cta}
        sx={{ bgcolor: navy, color: "#fff" }}
      >
        <TemplateInnerContainer
          sx={{
            py: { xs: 4, md: 5 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            justifyContent: "space-between",
            alignItems: { md: "center" },
          }}
        >
          <Typography
            {...getEditableTextProps(cta.blockId, "heading", "multi")}
            sx={{ fontFamily: headingFont, fontWeight: 800, fontSize: { xs: "1.5rem", md: "2rem" }, maxWidth: 480 }}
          >
            {cta.heading || "Looking for a reliable plumbing service?"}
          </Typography>
          <Button
            href={resolveLink(cta.ctaLink || `tel:${cta.phone || "+13945984958"}`, siteSlug)}
            startIcon={<Phone size={18} />}
            {...getEditableTextProps(cta.blockId, "ctaText", "single")}
            sx={{
              bgcolor: yellow,
              color: navy,
              borderRadius: 999,
              px: 3,
              py: 1.4,
              fontWeight: 800,
              textTransform: "none",
              "&:hover": { bgcolor: yellow, opacity: 0.92 },
            }}
          >
            {cta.ctaText || cta.phone || "GET A FREE QUOTE"}
          </Button>
        </TemplateInnerContainer>
      </TemplateSectionBoundary>
    </>
  );
};

export default AboutPage;
