import type { ComponentProps } from "react";
import { SvgIcon } from "@mui/material";
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
} from "@mui/icons-material";

import NotFoundContent from "@/components/UI/NotFoundContent";
import type { NotFoundSocialLink } from "@/components/UI/NotFoundContent";

const DiscordIcon = (props: ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.516c-.21.375-.444.88-.608 1.275a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.275A19.74 19.74 0 0 0 3.832 4.37C.534 9.046-.36 13.58.087 18.058a19.9 19.9 0 0 0 5.994 3.03c.48-.655.91-1.35 1.28-2.08a12.98 12.98 0 0 1-2.02-.97c.17-.124.336-.253.498-.385 3.9 1.804 8.13 1.804 11.982 0 .164.134.33.263.498.386-.64.38-1.317.705-2.02.97.37.73.798 1.425 1.28 2.08a19.88 19.88 0 0 0 5.994-3.03c.524-5.188-.894-9.68-3.256-13.69ZM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.333-.956 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.333-.946 2.419-2.157 2.419Z" />
  </SvgIcon>
);

const socialLinks: NotFoundSocialLink[] = [
  {
    label: "Discord",
    href: "https://discord.gg/fNCrM6gA7F",
    Icon: DiscordIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/thetechietribe.official",
    Icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/thetechietribe_/",
    Icon: InstagramIcon,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@thetechietribe.official",
    Icon: YouTubeIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/techietribe",
    Icon: LinkedInIcon,
  },
];

/** Techietribe-branded 404 for the marketing site. */
const NotFound = () => (
  <NotFoundContent
    homeHref="/"
    homeLabel="Back to Techietribe Home"
    backgroundImage="/assets/images/home/bg-image.webp"
    socialLinks={socialLinks}
    showParticles
    // Clears the 70px fixed Navbar that overlays this section.
    topOffset="70px"
  />
);

export default NotFound;
