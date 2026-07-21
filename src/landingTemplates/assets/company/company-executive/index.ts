import studioHero from "./images/studio-hero.webp";
import studioStrategy from "./images/studio-strategy.webp";
import teamCollaboration from "./images/team-collaboration.jpg";
import teamBoardroom from "./images/team-boardroom.jpg";
import digitalWorkspace from "./images/digital-workspace.jpg";
import worldMap from "./images/world-map.svg";
import clientAlex from "./avatars/client-alex.jpg";
import clientJordan from "./avatars/client-jordan.jpg";
import clientMorgan from "./avatars/client-morgan.jpg";
import clientTaylor from "./avatars/client-taylor.jpg";

export const companyStudioAssets = {
  heroPortrait: studioHero,
  strategy: studioStrategy,
  team: teamCollaboration,
  office: teamBoardroom,
  boardroom: digitalWorkspace,
  worldMap,
  avatars: [clientAlex, clientJordan, clientMorgan, clientTaylor],
} as const;
