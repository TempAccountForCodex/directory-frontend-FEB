import plumbingHero from "./images/plumbing-hero.jpg";
import plumberService from "./images/plumber-service.jpg";
import bathroomRenovation from "./images/bathroom-renovation.jpg";
import constructionWorker from "./images/construction-worker.jpg";
import serviceThumbnail from "./images/service-thumbnail.webp";
import pipeRepair from "./images/pipe-repair.jpg";
import serviceTeam from "./images/service-team.jpg";
import founder from "./avatars/founder.jpg";
import member1 from "./avatars/member-1.jpg";
import member2 from "./avatars/member-2.jpg";
import member3 from "./avatars/member-3.jpg";
import clientAlex from "./avatars/client-alex.jpg";
import clientJordan from "./avatars/client-jordan.jpg";
import clientMorgan from "./avatars/client-morgan.jpg";
import clientTaylor from "./avatars/client-taylor.jpg";

export const plumbingProAssets = {
  plumbingHero,
  plumberService,
  bathroomRenovation,
  constructionWorker,
  serviceThumbnail,
  pipeRepair,
  serviceTeam,
  founder,
  member1,
  member2,
  member3,
  clientAlex,
  clientJordan,
  clientMorgan,
  clientTaylor,
  // Aliases used across Home / About / Services / Contact composers
  hero: plumbingHero,
  aboutImage: plumberService,
  servicesWhy: bathroomRenovation,
  contactImage: pipeRepair,
  promoImage: constructionWorker,
  teamImage: serviceTeam,
  service1: plumberService,
  service2: serviceTeam,
  service3: bathroomRenovation,
  service4: pipeRepair,
  service5: constructionWorker,
  service6: serviceThumbnail,
  whyImage: bathroomRenovation,
  experienceImage: pipeRepair,
  trustAvatar: clientAlex,
} as const;
