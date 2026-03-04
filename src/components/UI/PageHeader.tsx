import React from "react";
import {
  Box,
  Stack,
  Typography,
  styled,
  keyframes,
  useTheme,
} from "@mui/material";
import BlogHeaderPic from "../../assets/images/BlogHeader.avif";
import { Link } from "react-router-dom";

const fadeInBottom = keyframes`
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledHeader = styled(Box)(({ theme }) => ({
  width: "100%",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  position: "relative",
  minHeight: "64vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  animation: `${fadeInBottom} 3s ease`,
  letterSpacing: 1,
  "&::after": {
    content: '""',
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundImage:
      "linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0))",
    zIndex: 1,
  },
  [theme.breakpoints.down("sm")]: {
    minHeight: "50vh",
  },
}));

const StyledHeaderItem = styled(Box)(() => ({
  width: "100%",
  zIndex: 2,
  color: "primary.main",
  textAlign: "center",
}));

interface PageHeaderProps {
  image?: string;
  page?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  image = BlogHeaderPic,
  page = "Latest Posts",
}) => {
  const theme = useTheme();
  return (
    <StyledHeader sx={{ backgroundImage: `url(${image})` }}>
      <StyledHeaderItem px={{ xs: 4, sm: 8 }}>
        <Typography
          sx={{
            fontSize: { xs: "30px", sm: "36px" },
            fontWeight: "bold",
            lineHeight: "3rem",
            mt: 5,
            textTransform: "uppercase",
            color: theme.palette.primary.main,
          }}
        >
          {page}
        </Typography>

        <Stack direction="row" justifyContent="center">
          <Typography
            component={Link}
            to="/"
            sx={{
              fontSize: { xs: "12px", sm: "16px" },
              marginY: "6px",
              ml: 0.5,
              textDecoration: "none",
              color: (theme.palette.primary as any).focus,
            }}
          >
            Home
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "12px", sm: "16px" },
              marginY: "6px",
              ml: 0.6,
              color: theme.palette.primary.main,
            }}
          >
            {` - ${page}`}
          </Typography>
        </Stack>
      </StyledHeaderItem>
    </StyledHeader>
  );
};

export default PageHeader;
