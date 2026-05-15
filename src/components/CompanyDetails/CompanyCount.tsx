import { Box, CardMedia, Grid, Typography } from "@mui/material";
import { useInView } from "react-intersection-observer";
import useFormatData from "../../hooks/useFormatData.tsx";
import theme from "../../styles/theme.ts";

/* ---------------- Types ---------------- */
interface CompanyCountProps {
  banner?: string;
  title?: string;
  desc?: string;
  isAPIRunning?: boolean;
  whyUs?: string;
}

/* ---------------- Component ---------------- */
const CompanyCount: React.FC<CompanyCountProps> = ({
  banner,
  title,
  desc,
  isAPIRunning,
  whyUs,
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const truncateDesc = (desc: string, maxLength: number): string => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = desc;
    const textContent = tempElement.textContent || "";
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + "..."
      : textContent;
  };

  const { ref: aboutUsRef, inView: aboutUsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: imageRef, inView: imageInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const truncateText = (
    text: string | undefined,
    maxLength: number,
  ): string => {
    if (!text) return "";
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + "...";
  };

  const truncatedwhyUs = truncateText(whyUs, 400);
  const formattedData: string[] = useFormatData(truncatedwhyUs);

  return (
    <Grid
      container
      ref={aboutUsRef}
      id="about-us-section"
      sx={{
        height: "auto",
        position: "relative",
        alignItems: "center",
        backgroundImage:
          "url(https://redvisionexperts.com/wp-content/uploads/2020/10/bg-map-3.png)",
        backgroundPosition: "0%",
        backgroundRepeat: "no-repeat",
        textAlign: "center",
        display: "block",
        justifyContent: "left",
        overflow: "hidden",
        px: { lg: 10, md: 5, sm: 10, xs: 4 },
        py: { lg: 10, md: 10, sm: 8, xs: 5 },
      }}
      rowSpacing={1}
    >
      <Grid
        item
        xs={12}
        sm={12}
        md={6.5}
        sx={{
          position: "relative",
          ml: { lg: "570px", sm: "0px" },
          maxWidth: "100%",
          minWidth: { lg: "0", md: "100%" },
        }}
        ref={imageRef}
        id="image-section"
        component="div"
        {...({} as any)}
      >
        {/* Text Box */}
        <Grid
          item
          direction="column"
          sx={{
            display: "flex",
            position: { lg: "absolute", md: "relative" },
            right: { lg: "70%", md: "0" },
            top: { lg: "11%", md: "0" },
            width: { lg: "800px", xs: "100%" },
            height: { lg: "400px", md: "auto", sm: "auto", xs: "auto" },
            bgcolor: "#fff",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            px: { lg: 5, md: 5, sm: 5, xs: 0 },
            py: { lg: 5, md: 5, sm: 5, xs: 2 },
            overflow: "hidden",
            opacity: imageInView ? 1 : 0,
            transform: imageInView ? "translateX(0)" : "translateX(100%)",
            animation: imageInView ? "slideInRight 1s forwards" : "none",
            zIndex: "99",
          }}
          component="div"
          {...({} as any)}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "left",
              flexDirection: "column",
              height: "100%",
              with: "100%",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: { md: "46px", sm: "40px", xs: "25px" },
                fontWeight: "800",
                lineHeight: "1.2",
                textAlign: { lg: "left", xs: "center" },
                color: (theme.palette.primary as any).hover,
                mb: { sm: 2, xs: 1 },
                fontFamily: "Barlow",
              }}
            >
              Why Us?
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "grey",
                  lineHeight: "1.5",
                  textAlign: "left",
                  fontSize: { md: "16px", sm: "16px", xs: "11px" },
                  px: { sm: 0, xs: "20px" },
                  ml: 8,
                }}
              >
                {formattedData.map((item, index) => (
                  <span key={index}>
                    {item}
                    <br />
                  </span>
                ))}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Banner Image */}
        <CardMedia
          component="img"
          image={isAPIRunning ? `${backendUrl}/${banner}` : `${banner}`}
          alt="ok"
          sx={{
            cursor: "pointer",
            maxWidth: "86.5%",
            opacity: imageInView ? 1 : 0,
            height: { md: "500px", sm: "400px", xs: "200px" },
            transform: aboutUsInView ? "translateX(0)" : "translateX(-100%)",
            animation: aboutUsInView ? "slideInLeft 1s forwards" : "none",
          }}
        />
      </Grid>

      {/* Animations */}
      <style>
        {`@keyframes slideInLeft {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        #about-us-section {
          opacity: 0;
          animation: slideInLeft 2s forwards;
        }
        
        #image-section {
          opacity: 0;
          animation: slideInRight 2s forwards;
        }`}
      </style>
    </Grid>
  );
};

export default CompanyCount;
