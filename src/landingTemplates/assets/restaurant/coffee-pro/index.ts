import heroLatte from "./images/hero-latte.jpg";
import ritualPour from "./images/ritual-pour.jpg";
import craftEspresso from "./images/craft-espresso.jpg";
import menuLatte from "./images/menu-latte.jpg";
import menuCappuccino from "./images/menu-cappuccino.jpg";
import menuMocha from "./images/menu-mocha.jpg";
import menuFlatwhite from "./images/menu-flatwhite.jpg";
import menuAmericano from "./images/menu-americano.jpg";
import menuEspresso from "./images/menu-espresso.jpg";
import gallery1 from "./images/gallery-1.jpg";
import gallery2 from "./images/gallery-2.jpg";
import gallery3 from "./images/gallery-3.jpg";
import gallery4 from "./images/gallery-4.jpg";
import gallery5 from "./images/gallery-5.jpg";
import avatar1 from "./avatars/avatar-1.jpg";
import avatar2 from "./avatars/avatar-2.jpg";
import avatar3 from "./avatars/avatar-3.jpg";

export const coffeeProAssets = {
  hero: heroLatte,
  ritual: ritualPour,
  craft: craftEspresso,
  menuLatte,
  menuCappuccino,
  menuMocha,
  menuFlatwhite,
  menuAmericano,
  menuEspresso,
  gallery: [gallery1, gallery2, gallery3, gallery4, gallery5],
  avatars: [avatar1, avatar2, avatar3],
} as const;

export default coffeeProAssets;
