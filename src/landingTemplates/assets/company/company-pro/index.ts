import hero from "./images/company-pro-editorial-hero.png";
import about from "./images/company-pro-editorial-team.png";
import workspace from "./images/company-pro-editorial-leader.png";
import team from "./images/company-pro-editorial-team.png";
import logo from "./images/company-pro-wordmark.svg";

export const companyProAssets = {
  hero,
  about,
  workspace,
  team,
  logo,
  avatars: [hero, workspace, about],
} as const;
