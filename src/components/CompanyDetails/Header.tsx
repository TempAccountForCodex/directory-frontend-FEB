import React from "react";
import { Grid, Typography, Stack, styled, useTheme } from "@mui/material";
import Image from "../../assets/images/your-background-image.jpeg";
import { keyframes } from "@emotion/react";
import Arrow from "../../assets/images/line-arrow.png";
import HomeSearch from "../publicComponents/Home/HomeSearch";

const fadeInBottom = keyframes`
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledHeader = styled(Grid)(({ theme }) => ({
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  position: "relative",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  animation: `${fadeInBottom} 3s ease`,
  "&::after": {
    content: '""',
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "black",
    opacity: "0.4",
  },
  [theme.breakpoints.down("sm")]: {
    backgroundPosition: "center",
    minHeight: "70vh",
  },
}));
export const StyledHeaderItem = styled(Grid)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  [theme.breakpoints.up("md")]: {
    alignItems: "flex-start",
  },
  flexDirection: "column",
  zIndex: 1,
  color: theme.palette.common.white,
}));

export const StyledHeading = styled(Typography)(({ theme }) => ({
  fontSize: "46px",
  fontWeight: "bold",
  [theme.breakpoints.down("md")]: {
    fontSize: "26px",
  },
}));
export const StyledSubHeading = styled(Typography)(({ theme }) => ({
  fontFamily: "Sacramento",
  fontSize: "70px",
  fontWeight: 400,
  textTransform: "none",
  position: "relative",
  zIndex: 1,
  lineHeight: 1,
  color: (theme.palette.primary as any).focus,
  [theme.breakpoints.down("md")]: {
    fontSize: "26px",
  },
}));
export const CategoryHeading = styled(Typography)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  marginLeft: "auto",
  marginRight: "auto",
  fontFamily: "Sacramento",
  fontSize: "20px",
  fontWeight: 400,
  textTransform: "none",
  lineHeight: 1,
  color: theme.palette.common.white,
  [theme.breakpoints.down("md")]: {
    fontSize: "26px",
  },
  "&&::before": {
    content: '""',
    width: "64px",
    height: "110px",
    position: "absolute",
    bottom: "90%",
    left: "-85px",
    background: `url(${Arrow}) no-repeat center center transparent`,
    backgroundSize: "contain",
    zIndex: -1,
  },
}));

interface HeaderProps {
  BgHead: string | any;
  isAPIRunning?: boolean;
  intro: string;
  title: string;
}

const Header: React.FC<HeaderProps> = ({
  BgHead,
  isAPIRunning,
  intro,
  title,
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const theme = useTheme();
  return (
    <>
      <Grid
        container
        sx={{
          backgroundImage: isAPIRunning
            ? `url(${backendUrl}/${BgHead})`
            : `url(${BgHead})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          mt: { md: "-100px", sm: "-100px" },
        }}
      >
        <StyledHeader sx={{ mt: { xs: 0, md: 0 }, width: "100%" }}>
          <StyledHeaderItem
            px={{ xs: 4, md: 12 }}
            pt={{ xs: 15 }}
            pb={{ xs: 8 }}
            ml="auto"
            mr="auto"
          >
            <StyledHeading
              sx={{
                fontSize: { xs: "30px", sm: "50px", md: "80px" },
                lineHeight: { xs: "2rem", sm: "3rem", md: "5rem" },
                textAlign: { xs: "center" },
                fontWeight: 800,
                fontFamily: "Barlow",
              }}
            >
              {" "}
              {title}{" "}
            </StyledHeading>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: { xs: "12px", sm: "20px" },
                textAlign: { xs: "center" },
                fontWeight: 400,
                marginY: "8px",
                wordWrap: "break-word",
                px: { sm: "10rem" },
                pt: { sm: "2rem" },
                mt: "2rem",
                width: "100%",
              }}
            >
              {intro}
            </Typography>
          </StyledHeaderItem>
        </StyledHeader>
      </Grid>
    </>
  );
};

export default Header;
