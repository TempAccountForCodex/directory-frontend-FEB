// import React from "react";
// import { Box, Typography, styled } from "@mui/material";

// // === Styled Components ===
// const FeatureItem = styled(Box)(({ theme }) => ({
//   display: "flex",
//   alignItems: "flex-start",
//   gap: theme.spacing(2),
//   marginBottom: theme.spacing(3),

//   "&:last-child": {
//     marginBottom: 0,
//   },
// }));

// const IconContainer = styled(Box)(({ theme }) => ({
//   display: "flex",
//   flexDirection: "column",
//   alignItems: "center",
//   position: "relative",
//   minWidth: "28px",
//   "&::after": {
//     content: '""',
//     display: "block",
//     width: "2px",
//     height: "100%",
//     position: "absolute",
//     top: "30px",
//   },
// }));

// const Checkmark = styled(Box)(({ theme }) => ({
//   width: "32px",
//   height: "32px",
//   borderRadius: "50%",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   color: "white",
//   zIndex: 1,
// }));

// // === Main Reusable Component ===
// const FeatureList = ({ features = [] }) => {
//   if (!features || features.length === 0) return null;

//   return (
//     <Box>
//       {features.map((feature, index) => {
//         const Icon = feature.icon;
//         return (
//           <FeatureItem key={index}>
//             <IconContainer
//               sx={{
//                 "&::after": { backgroundColor: feature.lineColor || "#141414" },
//               }}
//             >
//               <Checkmark
//                 sx={{ backgroundColor: feature.iconColor || "#141414" }}
//               >
//                 {Icon && <Icon sx={{ fontSize: 18 }} />}
//               </Checkmark>
//             </IconContainer>

//             <Box>
//               <Typography
//                 variant="h6"
//                 sx={{
//                   fontWeight: 700,
//                   color: feature.titleColor || "text.primary",
//                 }}
//               >
//                 {feature.title}
//               </Typography>
//               <Typography
//                 variant="body1"
//                 sx={{ color: feature.descriptionColor || "text.primary" }}
//               >
//                 {feature.description}
//               </Typography>
//             </Box>
//           </FeatureItem>
//         );
//       })}
//     </Box>
//   );
// };

// export default FeatureList;

import React from 'react';
import { Box, Typography, styled, Link } from '@mui/material';

// === Styled Components ===
const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),

  '&:last-child': {
    marginBottom: 0,
  },
}));

const IconContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  minWidth: '28px',
  '&::after': {
    content: '""',
    display: 'block',
    width: '2px',
    height: '100%',
    position: 'absolute',
    top: '30px',
  },
}));

const Checkmark = styled(Box)(() => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  zIndex: 1,
}));

// === Helper Function to Build Link ===
const getLink = (type, description) => {
  switch (type) {
    case 'email':
      return `mailto:${description}`;
    case 'phone':
      // strip spaces for tel link
      return `tel:${description.replace(/\s+/g, '')}`;
    case 'address':
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(description)}`;
    default:
      return null; // no link
  }
};

// === Main Reusable Component ===
const FeatureList = ({ features = [] }) => {
  if (!features || features.length === 0) return null;

  return (
    <Box>
      {features.map((feature, index) => {
        const Icon = feature.icon;
        const link = getLink(feature.type, feature.description);

        return (
          <FeatureItem key={index}>
            <IconContainer
              sx={{
                '&::after': { backgroundColor: feature.lineColor || '#141414' },
              }}
            >
              <Checkmark sx={{ backgroundColor: feature.iconColor || '#141414' }}>
                {Icon && <Icon sx={{ fontSize: 18 }} />}
              </Checkmark>
            </IconContainer>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: feature.titleColor || 'text.primary',
                }}
              >
                {feature.title}
              </Typography>

              {link ? (
                <Link
                  href={link}
                  underline="hover"
                  sx={{
                    color: feature.descriptionColor || 'text.gray',
                    fontSize: '0.95rem',
                    fontWeight: 400,
                  }}
                >
                  {feature.description}
                </Link>
              ) : (
                <Typography
                  variant="body1"
                  sx={{ color: feature.descriptionColor || 'text.primary' }}
                >
                  {feature.description}
                </Typography>
              )}
            </Box>
          </FeatureItem>
        );
      })}
    </Box>
  );
};

export default FeatureList;
