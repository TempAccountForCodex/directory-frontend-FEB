import * as React from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { Box, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useInView } from "react-intersection-observer";

/* ---------------- Types ---------------- */
interface CompanyLatestProjectProps {
  img?: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  imgB?: string;
  isAPIRunning?: boolean;
  latestProjectIntro?: string;
}

interface ItemData {
  img: string;
}

/* ---------------- Component ---------------- */
const CompanyLatestProject: React.FC<CompanyLatestProjectProps> = ({
  img,
  img1,
  img2,
  img3,
  img4,
  imgB,
  isAPIRunning,
  latestProjectIntro,
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const itemData: ItemData[] = [
    { img: isAPIRunning ? `${backendUrl}/${img}` : `${img}` },
    { img: isAPIRunning ? `${backendUrl}/${img1}` : `${img1}` },
    { img: isAPIRunning ? `${backendUrl}/${img2}` : `${img2}` },
    { img: isAPIRunning ? `${backendUrl}/${img3}` : `${img3}` },
    { img: isAPIRunning ? `${backendUrl}/${img4}` : `${img4}` },
    { img: isAPIRunning ? `${backendUrl}/${imgB}` : `${imgB}` },
  ].filter((item) => !!item.img);

  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.only("xs"));
  const isSM = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));
  const isXl = useMediaQuery(theme.breakpoints.only("xl"));

  let cols = 1;
  if (isXS) cols = 1;
  if (isSM) cols = 2;
  if (isMd) cols = 2;
  if (isLg) cols = 3;
  if (isXl) cols = 3;

  const { ref: projRef, inView: projInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: imageRef, inView: imageInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Box
      ref={projRef}
      id="proj-section"
      sx={{ width: "90%", mx: "auto", height: "100%" }}
    >
      <Typography
        variant="h5"
        color="#2d3954"
        sx={{
          fontSize: "32px",
          lineHeight: "42px",
          textAlign: "center",
          fontWeight: 600,
          fontFamily: "poppins",
          mb: "20px",
          mt: "-25px",
          transition: isXS ? "none" : "transform 0.5s ease-in-out",
          transform: projInView || isXS ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        Our Latest Projects
      </Typography>

      <Typography
        variant="h6"
        color="#72809d"
        sx={{
          fontSize: "16px",
          lineHeight: "22px",
          textAlign: "center",
          fontWeight: 400,
          fontFamily: "poppins",
          marginTop: "10px",
          px: { lg: "150px", md: "auto" },
          transition: isXS ? "none" : "opacity 1s ease-in-out",
          opacity: projInView || isXS ? 1 : 0,
        }}
      >
        {latestProjectIntro}
      </Typography>

      <br />

      <ImageList sx={{ gap: "30px" }} cols={cols}>
        {itemData.map((item, index) => (
          <ImageListItem
            key={index}
            sx={{
              padding: "10px",
              transition: isXS
                ? "none"
                : "opacity 1s ease-in-out, transform 1s ease-in-out",
              opacity: imageInView || isXS ? 1 : 0,
              transform:
                imageInView || isXS
                  ? "translateX(0)"
                  : index > 3
                    ? "translateX(-100%)"
                    : "translateX(100%)",
              "&:hover": { opacity: 0.9 },
            }}
          >
            <img
              src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
              alt={`Project ${index + 1}`}
              loading="lazy"
              style={{
                width: "100%",
                height: "300px",
              }}
              ref={imageRef}
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
};

export default CompanyLatestProject;
