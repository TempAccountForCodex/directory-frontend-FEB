import { useEffect, useRef, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Container, Grid } from "@mui/material";
import { useLocation } from "react-router-dom";
import LanguageIcon from "@mui/icons-material/Language";
import CallIcon from "@mui/icons-material/Call";

/* ---------------- Styles ---------------- */
const useStyles = makeStyles(() => ({
  userHover: {
    "&:hover": {
      color: "#1c9ac0",
      opacity: "1",
    },
    opacity: "0.5",
  },
  userIconHover: {
    "&:hover": {
      opacity: "1",
    },
    opacity: "0.5",
  },
  paired: {
    "&:hover": {
      opacity: "1",
    },
    opacity: "0.5",
    cursor: "pointer",
  },
  rightPair: {
    position: "relative",
    top: "2px",
  },
}));

/* ---------------- Types ---------------- */
interface CompanyTopbarProps {
  isLoggedIn?: boolean;
  phone?: string;
  website?: string;
  formattedNumber?: string;
}

const styleForIcon: React.CSSProperties = {
  fontSize: "19px",
};

const styleForIconTxt: React.CSSProperties = {
  top: "-4px",
  position: "relative",
  marginLeft: "11px",
  fontSize: "14px",
  cursor: "pointer",
  fontFamily: "sans-serif",
};

const CompanyTopbar: React.FC<CompanyTopbarProps> = ({
  isLoggedIn,
  phone,
  website,
  formattedNumber,
}) => {
  const classes = useStyles();
  const location = useLocation();
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const [isSearch, setIsSearch] = useState(false);
  const shouldHide = website === "https://www.example.com/";

  useEffect(() => {
    setIsSearch(false);
  }, [location]);

  return (
    <Box
      sx={{ bgcolor: "grey.900", color: "grey.300", position: "sticky" }}
      style={{
        transition: "0.32s ease-in-out",
        height: "auto",
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 0, sm: 0, md: 0 } }}>
        <Grid
          container
          m={0}
          sx={{
            background: "black",
            color: "white",
            gap: 2,
            px: { sm: 4, xs: 0 },
            pt: "10px",
            pb: { sm: "8px", xs: 0 },
          }}
        >
          {/* Left side: phone + website */}
          <Grid
            item
            xs={12}
            sm={5.8}
            sx={{
              textAlign: { xs: "center", sm: "left" },
              justifyContent: { xs: "center", sm: "start" },
              display: "flex",
              columnGap: "24px",
              flexWrap: "wrap",
            }}
            component="div"
            {...({} as any)}
          >
            {/* Phone */}
            {phone && (
              <a
                href={`tel:${phone}`}
                style={{ textDecoration: "none", color: "unset" }}
              >
                <div className={classes.paired}>
                  <span>
                    <CallIcon style={styleForIcon} />
                  </span>
                  <span
                    style={{
                      top: "-4px",
                      position: "relative",
                      marginLeft: "11px",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontFamily: "sans-serif",
                    }}
                  >
                    {formattedNumber}
                  </span>
                </div>
              </a>
            )}

            {/* Website */}
            <div className={classes.paired}>
              {!shouldHide && website && (
                <a
                  href={website}
                  style={{ textDecoration: "none", color: "unset" }}
                >
                  <span>
                    <LanguageIcon style={styleForIcon} />
                  </span>
                  <span style={styleForIconTxt}>{website}</span>
                </a>
              )}
            </div>
          </Grid>

          {/* Right side (search placeholder box) */}
          <Grid
            item
            xs={12}
            sm={5.8}
            ref={searchBoxRef}
            sx={{
              textAlign: { xs: "center", sm: "left" },
              justifyContent: { xs: "center", sm: "end" },
              position: "relative",
            }}
            style={{ display: "flex", gap: "24px" }}
            justifyContent="flex-end"
            component="div"
            {...({} as any)}
          >
            <Box
              sx={{
                background: "white",
                padding: "13px",
                position: "absolute",
                zIndex: 9,
                left: "50%",
                top: "44px",
                display: isSearch ? "block" : "none",
                borderRadius: "10px",
              }}
            ></Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CompanyTopbar;
