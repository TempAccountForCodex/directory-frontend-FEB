/**
 * Optional Link Hub setup step for Create Website modal.
 * Collects profile/links/socials/featured/product/contact defaults that seed
 * persisted FEATURES/HERO/CONTACT block.content on create.
 */
import React, { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { Plus, Trash2, ArrowUp, ArrowDown, Upload } from "lucide-react";
import { alpha } from "@mui/material/styles";
import { apiClient, isAxiosError } from "../../api/client";
import type { TemplateEditorPage } from "../../templates/frontendTemplateEditorSupport";

const ACCENT = "#378C92";
const ACCENT_BRIGHT = "#5BB8BE";

export type LinkHubSetupLinkItem = {
  title: string;
  link: string;
  description: string;
  image: string;
};

export type LinkHubSetupSocialItem = {
  title: string;
  link: string;
  icon: string;
};

export type LinkHubSetupData = {
  displayName: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  backgroundUrl: string;
  links: LinkHubSetupLinkItem[];
  socials: LinkHubSetupSocialItem[];
  featuredTitle: string;
  featuredLink: string;
  featuredImage: string;
  featuredDescription: string;
  productTitle: string;
  productLink: string;
  productImage: string;
  productDescription: string;
  contactEmail: string;
  contactButtonLabel: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
};

export const EMPTY_LINK_HUB_SETUP: LinkHubSetupData = {
  displayName: "",
  handle: "",
  bio: "",
  avatarUrl: "",
  backgroundUrl: "",
  links: [{ title: "", link: "", description: "", image: "" }],
  socials: [
    {
      title: "Instagram",
      link: "",
      icon: "lucide:instagram",
    },
  ],
  featuredTitle: "",
  featuredLink: "",
  featuredImage: "",
  featuredDescription: "",
  productTitle: "",
  productLink: "",
  productImage: "",
  productDescription: "",
  contactEmail: "",
  contactButtonLabel: "",
  newsletterTitle: "",
  newsletterSubtitle: "",
};

const SOCIAL_PLATFORM_OPTIONS = [
  { title: "Instagram", icon: "lucide:instagram" },
  { title: "TikTok", icon: "lucide:music-2" },
  { title: "YouTube", icon: "lucide:youtube" },
  { title: "Twitter", icon: "lucide:twitter" },
  { title: "Facebook", icon: "lucide:facebook" },
  { title: "LinkedIn", icon: "lucide:linkedin" },
];

type ModalColors = {
  text: string;
  textSecondary: string;
  textDim: string;
  textMuted: string;
  panelBg: string;
  panelBorder: string;
  softButton: string;
  softButtonBorder: string;
  inputBg: string;
};

interface LinkHubSetupStepProps {
  value: LinkHubSetupData;
  onChange: (next: LinkHubSetupData) => void;
  modalColors: ModalColors;
  softButtonSx: Record<string, unknown>;
}

const fieldLabelSx = (colors: ModalColors) => ({
  color: colors.textSecondary,
  mb: 0.75,
  fontSize: 13,
  fontWeight: 600,
});

const LinkHubSetupStep: React.FC<LinkHubSetupStepProps> = ({
  value,
  onChange,
  modalColors,
  softButtonSx,
}) => {
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const [featuredImageUploading, setFeaturedImageUploading] = useState(false);
  const [featuredImageError, setFeaturedImageError] = useState<string | null>(
    null,
  );

  const patch = (partial: Partial<LinkHubSetupData>) =>
    onChange({ ...value, ...partial });

  const updateLink = (index: number, partial: Partial<LinkHubSetupLinkItem>) => {
    const links = value.links.map((item, i) =>
      i === index ? { ...item, ...partial } : item,
    );
    patch({ links });
  };

  const updateSocial = (
    index: number,
    partial: Partial<LinkHubSetupSocialItem>,
  ) => {
    const socials = value.socials.map((item, i) =>
      i === index ? { ...item, ...partial } : item,
    );
    patch({ socials });
  };

  const moveItem = <T,>(items: T[], from: number, to: number): T[] => {
    if (to < 0 || to >= items.length) return items;
    const next = [...items];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    return next;
  };

  const handleFeaturedImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFeaturedImageError("Please choose an image file");
      return;
    }

    setFeaturedImageError(null);
    setFeaturedImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await apiClient.post("/upload/image", formData);
      const url =
        typeof response.data?.url === "string" ? response.data.url : "";
      if (!url) {
        throw new Error("Upload did not return an image URL");
      }
      patch({ featuredImage: url });
    } catch (err: unknown) {
      const apiMessage =
        isAxiosError(err) && typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : null;
      setFeaturedImageError(apiMessage || "Upload failed — please try again");
    } finally {
      setFeaturedImageUploading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "14px",
        border: `1px solid ${modalColors.panelBorder}`,
        background: modalColors.panelBg,
        p: { xs: 2.5, sm: 3 },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{ color: ACCENT_BRIGHT, fontWeight: 600, mb: 0.5 }}
        >
          Link Hub Setup
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: modalColors.textDim, mb: 2.5, display: "block" }}
        >
          Add your profile and links now, or skip and customize later.
        </Typography>

        <Stack gap={3}>
          <Box>
            <Typography sx={{ ...fieldLabelSx(modalColors), mb: 1.25 }}>
              Profile
            </Typography>
            <Stack gap={1.5}>
              <TextField
                fullWidth
                size="small"
                label="Display name"
                placeholder="Luna Belle"
                value={value.displayName}
                onChange={(e) => patch({ displayName: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="Username / handle"
                placeholder="@lunabelle"
                value={value.handle}
                onChange={(e) => patch({ handle: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Bio / short intro"
                placeholder="Soft glam looks, skin routines, and beauty referrals."
                value={value.bio}
                onChange={(e) => patch({ bio: e.target.value })}
              />
            </Stack>
          </Box>

          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={1.25}
            >
              <Typography sx={fieldLabelSx(modalColors)}>Main links</Typography>
              <Button
                size="small"
                startIcon={<Plus size={14} />}
                onClick={() =>
                  patch({
                    links: [
                      ...value.links,
                      { title: "", link: "", description: "", image: "" },
                    ],
                  })
                }
                sx={{ ...softButtonSx, minHeight: 32, px: 1.25 }}
              >
                Add link
              </Button>
            </Stack>
            <Stack gap={1.5}>
              {value.links.map((item, index) => (
                <Box
                  key={`link-${index}`}
                  sx={{
                    p: 1.5,
                    borderRadius: "12px",
                    border: `1px solid ${alpha(ACCENT, 0.25)}`,
                    bgcolor: alpha("#000", 0.18),
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    gap={0.5}
                    mb={1}
                  >
                    <IconButton
                      size="small"
                      aria-label="Move link up"
                      disabled={index === 0}
                      onClick={() =>
                        patch({
                          links: moveItem(value.links, index, index - 1),
                        })
                      }
                      sx={{ color: modalColors.textMuted }}
                    >
                      <ArrowUp size={14} />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Move link down"
                      disabled={index === value.links.length - 1}
                      onClick={() =>
                        patch({
                          links: moveItem(value.links, index, index + 1),
                        })
                      }
                      sx={{ color: modalColors.textMuted }}
                    >
                      <ArrowDown size={14} />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Remove link"
                      disabled={value.links.length <= 1}
                      onClick={() =>
                        patch({
                          links: value.links.filter((_, i) => i !== index),
                        })
                      }
                      sx={{ color: modalColors.textMuted }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </Stack>
                  <Stack gap={1.25}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Link title"
                      value={item.title}
                      onChange={(e) =>
                        updateLink(index, { title: e.target.value })
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Link URL"
                      placeholder="https://"
                      value={item.link}
                      onChange={(e) =>
                        updateLink(index, { link: e.target.value })
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Description (optional)"
                      value={item.description}
                      onChange={(e) =>
                        updateLink(index, { description: e.target.value })
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Thumbnail URL (optional)"
                      value={item.image}
                      onChange={(e) =>
                        updateLink(index, { image: e.target.value })
                      }
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={1.25}
            >
              <Typography sx={fieldLabelSx(modalColors)}>
                Social links
              </Typography>
              <Button
                size="small"
                startIcon={<Plus size={14} />}
                onClick={() =>
                  patch({
                    socials: [
                      ...value.socials,
                      {
                        title: "Instagram",
                        link: "",
                        icon: "lucide:instagram",
                      },
                    ],
                  })
                }
                sx={{ ...softButtonSx, minHeight: 32, px: 1.25 }}
              >
                Add social
              </Button>
            </Stack>
            <Stack gap={1.5}>
              {value.socials.map((item, index) => (
                <Box
                  key={`social-${index}`}
                  sx={{
                    p: 1.5,
                    borderRadius: "12px",
                    border: `1px solid ${alpha(ACCENT, 0.25)}`,
                    bgcolor: alpha("#000", 0.18),
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    gap={0.5}
                    mb={1}
                  >
                    <IconButton
                      size="small"
                      aria-label="Move social up"
                      disabled={index === 0}
                      onClick={() =>
                        patch({
                          socials: moveItem(value.socials, index, index - 1),
                        })
                      }
                      sx={{ color: modalColors.textMuted }}
                    >
                      <ArrowUp size={14} />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Move social down"
                      disabled={index === value.socials.length - 1}
                      onClick={() =>
                        patch({
                          socials: moveItem(value.socials, index, index + 1),
                        })
                      }
                      sx={{ color: modalColors.textMuted }}
                    >
                      <ArrowDown size={14} />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Remove social"
                      disabled={value.socials.length <= 1}
                      onClick={() =>
                        patch({
                          socials: value.socials.filter((_, i) => i !== index),
                        })
                      }
                      sx={{ color: modalColors.textMuted }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </Stack>
                  <Stack gap={1.25}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Platform"
                      value={item.title}
                      onChange={(e) => {
                        const option = SOCIAL_PLATFORM_OPTIONS.find(
                          (entry) => entry.title === e.target.value,
                        );
                        updateSocial(index, {
                          title: e.target.value,
                          icon: option?.icon || item.icon,
                        });
                      }}
                    >
                      {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                        <MenuItem key={option.title} value={option.title}>
                          {option.title}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth
                      size="small"
                      label="Profile URL"
                      placeholder="https://"
                      value={item.link}
                      onChange={(e) =>
                        updateSocial(index, { link: e.target.value })
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Icon token"
                      helperText="e.g. lucide:instagram"
                      value={item.icon}
                      onChange={(e) =>
                        updateSocial(index, { icon: e.target.value })
                      }
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ ...fieldLabelSx(modalColors), mb: 1.25 }}>
              Featured link
            </Typography>
            <Stack gap={1.25}>
              <TextField
                fullWidth
                size="small"
                label="Featured title"
                value={value.featuredTitle}
                onChange={(e) => patch({ featuredTitle: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                label="Featured URL"
                value={value.featuredLink}
                onChange={(e) => patch({ featuredLink: e.target.value })}
              />
              <Box>
                <Typography
                  sx={{
                    ...fieldLabelSx(modalColors),
                    mb: 0.75,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  Featured image
                </Typography>
                <input
                  ref={featuredImageInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFeaturedImageUpload}
                />
                {value.featuredImage ? (
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: `1px solid ${modalColors.panelBorder}`,
                      bgcolor: modalColors.inputBg,
                    }}
                  >
                    <Box
                      component="img"
                      src={value.featuredImage}
                      alt="Featured preview"
                      sx={{
                        display: "block",
                        width: "100%",
                        maxHeight: 180,
                        objectFit: "cover",
                      }}
                    />
                    <Stack
                      direction="row"
                      gap={1}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                      }}
                    >
                      <Button
                        size="small"
                        disabled={featuredImageUploading}
                        onClick={() => featuredImageInputRef.current?.click()}
                        sx={{
                          ...softButtonSx,
                          minHeight: 30,
                          px: 1.25,
                          bgcolor: alpha("#000", 0.55),
                        }}
                      >
                        Replace
                      </Button>
                      <IconButton
                        size="small"
                        aria-label="Remove featured image"
                        disabled={featuredImageUploading}
                        onClick={() => {
                          setFeaturedImageError(null);
                          patch({ featuredImage: "" });
                        }}
                        sx={{
                          bgcolor: alpha("#000", 0.55),
                          color: "#fff",
                          "&:hover": { bgcolor: alpha("#000", 0.75) },
                        }}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    component="button"
                    type="button"
                    disabled={featuredImageUploading}
                    onClick={() => featuredImageInputRef.current?.click()}
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.75,
                      py: 2.5,
                      px: 2,
                      borderRadius: "10px",
                      border: `1px dashed ${modalColors.softButtonBorder}`,
                      bgcolor: modalColors.inputBg,
                      color: modalColors.textSecondary,
                      cursor: featuredImageUploading
                        ? "default"
                        : "pointer",
                      font: "inherit",
                      transition: "border-color 0.15s ease, background 0.15s ease",
                      "&:hover": featuredImageUploading
                        ? {}
                        : {
                            borderColor: ACCENT,
                            color: modalColors.text,
                          },
                    }}
                  >
                    {featuredImageUploading ? (
                      <CircularProgress size={22} sx={{ color: ACCENT }} />
                    ) : (
                      <Upload size={20} />
                    )}
                    <Typography variant="body2" sx={{ color: "inherit" }}>
                      {featuredImageUploading
                        ? "Uploading…"
                        : "Upload featured image"}
                    </Typography>
                  </Box>
                )}
                {featuredImageError ? (
                  <Typography
                    variant="caption"
                    sx={{ color: "#f87171", mt: 0.75, display: "block" }}
                  >
                    {featuredImageError}
                  </Typography>
                ) : null}
              </Box>
              <TextField
                fullWidth
                size="small"
                label="Featured description"
                value={value.featuredDescription}
                onChange={(e) =>
                  patch({ featuredDescription: e.target.value })
                }
              />
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default LinkHubSetupStep;

const trim = (value: string | undefined | null) =>
  typeof value === "string" ? value.trim() : "";

const hasText = (value: string | undefined | null) => Boolean(trim(value));

/**
 * Merge optional Link Hub setup answers into seeded Home blocks.
 * Empty fields leave template defaults untouched.
 */
export const applyLinkHubSetupToPages = (
  pages: TemplateEditorPage[],
  setup: LinkHubSetupData,
): TemplateEditorPage[] => {
  if (!pages.length) return pages;

  return pages.map((page) => {
    if (!page.isHome && page.path !== "/") return page;

    const blocks = (page.blocks || []).map((block) => {
      const section =
        typeof block.content?.editorSection === "string"
          ? block.content.editorSection
          : "";
      const content = {
        ...((block.content || {}) as Record<string, unknown>),
      };

      if (section === "profile") {
        if (hasText(setup.displayName)) content.heading = trim(setup.displayName);
        if (hasText(setup.handle)) content.subheading = trim(setup.handle);
        if (hasText(setup.bio)) {
          content.body = trim(setup.bio);
          content.description = trim(setup.bio);
        }
        if (hasText(setup.avatarUrl)) {
          content.image = trim(setup.avatarUrl);
        }
        if (hasText(setup.backgroundUrl)) {
          content.heroImage = trim(setup.backgroundUrl);
          const sectionStyle =
            content.sectionStyle &&
            typeof content.sectionStyle === "object" &&
            !Array.isArray(content.sectionStyle)
              ? { ...(content.sectionStyle as Record<string, unknown>) }
              : {};
          content.sectionStyle = {
            ...sectionStyle,
            backgroundType: "image",
            backgroundImageUrl: trim(setup.backgroundUrl),
            backgroundSize: "cover",
            backgroundPosition: "center top",
          };
        }
      }

      if (section === "links") {
        const filledLinks = setup.links
          .map((item) => ({
            title: trim(item.title),
            description:
              trim(item.description) || trim(item.title) || "Link",
            link: trim(item.link),
            image: trim(item.image),
            type: "link",
            isVisible: true,
          }))
          .filter((item) => item.title || item.link);
        if (filledLinks.length) {
          content.features = filledLinks;
          content.items = filledLinks;
        }
      }

      if (section === "socials") {
        const filledSocials = setup.socials
          .map((item) => ({
            title: trim(item.title) || "Social",
            description: `${trim(item.title) || "Social"} profile`,
            link: trim(item.link),
            icon: trim(item.icon) || "lucide:link",
            type: "social",
            isVisible: true,
          }))
          .filter((item) => item.link);
        if (filledSocials.length) {
          content.features = filledSocials;
          content.items = filledSocials;
        }
      }

      if (section === "featured") {
        const title = trim(setup.featuredTitle);
        const link = trim(setup.featuredLink);
        const image = trim(setup.featuredImage);
        const description =
          trim(setup.featuredDescription) || title || "Featured";
        if (title || link || image) {
          if (title) content.heading = title;
          content.features = [
            {
              title: title || "Featured",
              description,
              link: link || "#",
              image,
              type: "featured",
              isFeatured: true,
              isVisible: true,
            },
          ];
          content.items = content.features;
        }
      }

      if (section === "products") {
        const title = trim(setup.productTitle);
        const link = trim(setup.productLink);
        const image = trim(setup.productImage);
        const description =
          trim(setup.productDescription) || title || "Product";
        if (title || link || image) {
          content.features = [
            {
              title: title || "Product",
              description,
              link: link || "#",
              image,
              type: "product",
              isVisible: true,
            },
          ];
          content.items = content.features;
        }
      }

      if (section === "contact") {
        if (hasText(setup.contactEmail)) {
          content.email = trim(setup.contactEmail);
        }
        if (hasText(setup.contactButtonLabel)) {
          content.buttonLabel = trim(setup.contactButtonLabel);
          content.ctaText = trim(setup.contactButtonLabel);
        }
        if (hasText(setup.newsletterTitle)) {
          content.heading = trim(setup.newsletterTitle);
        }
        if (hasText(setup.newsletterSubtitle)) {
          content.description = trim(setup.newsletterSubtitle);
          content.body = trim(setup.newsletterSubtitle);
        }
      }

      return { ...block, content };
    });

    return { ...page, blocks };
  });
};

