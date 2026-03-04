// import React, { useEffect, useState } from "react";
// import { ComposableMap, Geographies, Geography } from "react-simple-maps";
// import { feature } from "topojson-client";
// import { Tooltip as ReactTooltip } from "react-tooltip";
// import "react-tooltip/dist/react-tooltip.css";
// import SectionHeader from "./../../components/ui/SectionHeader";

// const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// // Countries + Addresses
// const officeLocations = {
//   Pakistan: {
//     address:
//       "718, 7th Floor, Siddique Trade Center, Main Boulevard Gulberg 3, Lahore",
//   },
//   "United States of America": {
//     address: "12828 Willow Centre Dr Ste D #363, Houston, TX 77066",
//   },
// };

// const highlighted = Object.keys(officeLocations);

// const WorldMap = () => {
//   const [geographies, setGeographies] = useState([]);

//   useEffect(() => {
//     fetch(geoUrl)
//       .then((response) => response.json())
//       .then((worldData) => {
//         const geoData = feature(
//           worldData,
//           worldData.objects.countries
//         ).features;
//         setGeographies(geoData);
//       });
//   }, []);

//   return (
//     <div
//       style={{
//         width: "100%",
//         backgroundColor: "#ffffff",
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* Header */}
//       {/* <SectionHeader
//         text="Locations"
//         subtext=""
//         variant="lg"
//         align="center"
//         sx={{ pt: 10, mb: 0 }}
//         titleSx={{
//           color: "text.primary",
//           letterSpacing: 0.5,
//           fontWeight: "800",
//         }}
//         subtextSx={{ maxWidth: 800, color: "text.primary", mb: "100px" }}
//       /> */}

//       {/* Map */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           //   height: "90vh",
//         }}
//       >
//         <ComposableMap
//           projection="geoMercator"
//           projectionConfig={{
//             scale: 160, // ✅ Zoom level (increased to match screenshot)
//             center: [10, 45], // ✅ Moves the map to show US, Europe, and Pakistan
//           }}
//           width={980}
//           height={650}
//           style={{
//             width: "100%",
//             height: "auto",
//           }}
//         >
//           <Geographies geography={geographies}>
//             {({ geographies }) =>
//               geographies.map((geo) => {
//                 const countryName = geo.properties.name;
//                 const isHighlighted = highlighted.includes(countryName);

//                 return (
//                   <Geography
//                     key={geo.rsmKey}
//                     geography={geo}
//                     data-tooltip-id="map-tooltip"
//                     data-tooltip-content={
//                       isHighlighted
//                         ? `${countryName}\n${officeLocations[countryName].address}`
//                         : countryName
//                     }
//                     fill={isHighlighted ? "#38b6b3" : "#e0e0e0"}
//                     stroke="#999"
//                     style={{
//                       default: {
//                         outline: "none",
//                         opacity: isHighlighted ? 1 : 0.8,
//                         transition: "all 0.3s ease-in-out",
//                       },
//                       hover: {
//                         fill: isHighlighted ? "#2a9491" : "#bdbdbd",
//                         outline: "none",
//                         opacity: 1,
//                         cursor: "pointer",
//                       },
//                       pressed: { outline: "none" },
//                     }}
//                   />
//                 );
//               })
//             }
//           </Geographies>
//         </ComposableMap>
//       </div>

//       {/* Tooltip */}
//       <ReactTooltip
//         id="map-tooltip"
//         place="top"
//         style={{
//           backgroundColor: "#ffffff",
//           color: "#000000",
//           border: "1px solid #ccc",
//           borderRadius: "6px",
//           padding: "8px 12px",
//           fontSize: "13px",
//           fontWeight: 500,
//           whiteSpace: "pre-line",
//           boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//           maxWidth: "280px",
//           textAlign: "left",
//         }}
//       />
//     </div>
//   );
// };

// export default WorldMap;

// import React, { useEffect, useState } from "react";
// import {
//   ComposableMap,
//   Geographies,
//   Geography,
//   Marker,
// } from "react-simple-maps";
// import { feature } from "topojson-client";
// import SectionHeader from "./../../components/ui/SectionHeader";
// import { Box } from "@mui/material";

// const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// const officeLocations = {
//   "United States of America": {
//     coords: [-95.3698, 29.7604], // Houston, TX
//     address: "12828 Willow Centre Dr Ste D #363, Houston, TX 77066",
//   },
//   Pakistan: {
//     coords: [74.3587, 31.5204], // Lahore
//     address:
//       "718, 7th Floor, Siddique Trade Center, Main Boulevard Gulberg 3, Lahore",
//   },
// };

// const highlighted = Object.keys(officeLocations);

// const WorldMap = () => {
//   const [geographies, setGeographies] = useState([]);

//   useEffect(() => {
//     fetch(geoUrl)
//       .then((response) => response.json())
//       .then((worldData) => {
//         const geoData = feature(
//           worldData,
//           worldData.objects.countries
//         ).features;
//         setGeographies(geoData);
//       });
//   }, []);

//   return (
//     <Box
//       sx={(t) => ({
//         height: "100vh",
//         width: "100%",
//         backgroundColor: t.palette.bg.dark,
//         position: "relative",
//         paddingBottom: "60px",
//       })}
//     >
//       {/* <SectionHeader
//         text="Locations"
//         variant="lg"
//         align="center"
//         sx={{ pt: 10, mb: 0 }}
//         titleSx={{
//           color: "text.primary",
//           letterSpacing: 0.5,
//           fontWeight: "800",
//         }}
//         subtextSx={{ maxWidth: 800, color: "text.primary", mb: "150px" }}
//       /> */}

//       <ComposableMap
//         projection="geoMercator"
//         projectionConfig={{ scale: 150, center: [5, 50] }}
//         style={{ width: "100%", height: "100vh" }}
//       >
//         <Geographies geography={geographies}>
//           {({ geographies }) =>
//             geographies.map((geo) => {
//               const name = geo.properties.name;
//               const isHighlighted = highlighted.includes(name);
//               return (
//                 <Geography
//                   key={geo.rsmKey}
//                   geography={geo}
//                   fill={isHighlighted ? "#38b6b3" : "#e0e0e0"}
//                   stroke="#999"
//                   style={{
//                     default: { outline: "none" },
//                     hover: { fill: isHighlighted ? "#2a9491" : "#bdbdbd" },
//                   }}
//                 />
//               );
//             })
//           }
//         </Geographies>

//         {/* Always-visible labels */}
//         {Object.entries(officeLocations).map(
//           ([country, { coords, address }]) => (
//             <Marker key={country} coordinates={coords}>
//               <foreignObject
//                 x={10}
//                 y={-30}
//                 width={100}
//                 height={80}
//                 style={{ pointerEvents: "none" }}
//               >
//                 <div
//                   style={{
//                     background: "#ffffffe8",
//                     border: "1px solid #cccccc36",
//                     borderRadius: "6px",
//                     padding: "8px 12px",
//                     // boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                     fontSize: "8px",
//                     color: "#000",
//                     fontWeight: 500,
//                     lineHeight: "1.4",
//                   }}
//                 >
//                   <strong>{country}</strong>
//                   <br />
//                   {address}
//                 </div>
//               </foreignObject>
//             </Marker>
//           )
//         )}
//       </ComposableMap>
//     </Box>
//   );
// };

// export default WorldMap;

import React, { useEffect, useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { feature } from "topojson-client";
import { Box } from "@mui/material";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const officeLocations = {
  "United States of America": {
    coords: [-95.3698, 29.7604],
    address: "12828 Willow Centre Dr Ste D #363, Houston, TX 77066",
  },
  Pakistan: {
    coords: [74.3587, 31.5204],
    address:
      "718, 7th Floor, Siddique Trade Center, Main Boulevard Gulberg 3, Lahore",
  },
};

const highlighted = Object.keys(officeLocations);

const WorldMap = () => {
  const [geoData, setGeoData] = useState(null);

  // ✅ Fetch only once and store as memoized data
  useEffect(() => {
    fetch(geoUrl)
      .then((response) => response.json())
      .then((worldData) => {
        const geoFeatures = feature(
          worldData,
          worldData.objects.countries,
        ).features;
        setGeoData(geoFeatures);
      });
  }, []);

  // ✅ Prevent re-render flicker: don’t render map until data loaded
  const geographies = useMemo(() => geoData, [geoData]);

  if (!geographies) return null; // or a loader if you want

  return (
    <Box
      sx={(t) => ({
        height: { xs: "auto", md: "100vh" },
        width: "100vw",
        backgroundColor: "#141414",
        padding: "60px 0px",
        overflow: "hidden",
      })}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 150,
          center: [10, 45],
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <Geographies geography={geographies}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties.name;
              const isHighlighted = highlighted.includes(name);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isHighlighted ? "#38b6b3" : "#e0e0e0"}
                  stroke="#000"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: isHighlighted ? "#2a9491" : "#bdbdbd" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* 📍 Static markers */}
        {Object.entries(officeLocations).map(
          ([country, { coords, address }]) => (
            <Marker key={country} coordinates={coords}>
              <foreignObject
                x={10}
                y={-30}
                width={160}
                height={80}
                style={{ pointerEvents: "none" }}
              >
                <div
                  style={{
                    background: "#ffffffef",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    fontSize: "9px",
                    color: "#000",
                    fontWeight: 500,
                    lineHeight: "1.4",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                  }}
                >
                  <strong>{country}</strong>
                  <br />
                  {address}
                </div>
              </foreignObject>
            </Marker>
          ),
        )}
      </ComposableMap>
    </Box>
  );
};

export default WorldMap;
