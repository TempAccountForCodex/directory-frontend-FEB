// @ts-nocheck
import { useMemo } from "react";
import { motion } from "framer-motion";
import "./StickerPeel.css";

const StickerPeel = ({
  imageSrc,
  rotate = 30,
  peelBackHoverPct = 30,
  peelBackActivePct = 40,
  width = 200,
  shadowIntensity = 0.6,
  lightingIntensity = 0.1,
  peelDirection = 0,
  className = "",
}) => {
  const defaultPadding = 10;

  const cssVars = useMemo(
    () => ({
      "--sticker-rotate": `${rotate}deg`,
      "--sticker-p": `${defaultPadding}px`,
      "--sticker-peelback-hover": `${peelBackHoverPct}%`,
      "--sticker-peelback-active": `${peelBackActivePct}%`,
      "--sticker-width": `${width}px`,
      "--sticker-shadow-opacity": shadowIntensity,
      "--sticker-lighting-constant": lightingIntensity,
      "--peel-direction": `${peelDirection}deg`,
    }),
    [
      rotate,
      peelBackHoverPct,
      peelBackActivePct,
      width,
      shadowIntensity,
      lightingIntensity,
      peelDirection,
    ],
  );

  return (
    <motion.div
      className={`draggable ${className}`}
      style={cssVars}
      drag
      dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
      dragElastic={0.1}
      whileDrag={{ scale: 1.05, rotate: rotate + 5 }}
      whileHover={{ scale: 1.02 }}
    >
      <svg width="0" height="0">
        <defs>
          <filter id="dropShadow">
            <feDropShadow
              dx="2"
              dy="4"
              stdDeviation={3 * shadowIntensity}
              floodColor="black"
              floodOpacity={shadowIntensity}
            />
          </filter>
        </defs>
      </svg>

      <div className="sticker-container">
        <div className="sticker-main">
          <div className="sticker-lighting">
            <img
              src={imageSrc}
              alt=""
              className="sticker-image"
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>

        <div className="flap">
          <div className="flap-lighting">
            <img
              src={imageSrc}
              alt=""
              className="flap-image"
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StickerPeel;
