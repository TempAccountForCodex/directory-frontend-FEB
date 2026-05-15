import React, { Suspense, lazy, useState, useRef } from "react";
import {
  Grid,
  Box,
  Typography,
  Paper,
  Container,
  CircularProgress,
} from "@mui/material";
import { useListings } from "../../context/ListingsContext";
import { useLocation } from "react-router-dom";

import Hero from "../../components/publicComponents/Listing/Hero";

import { ListingsData } from "./../../utils/data/Listings";

const PropertyCard = lazy(
  () => import("../../components/publicComponents/Listing/PropertyCard"),
);
const Searchbar = lazy(
  () => import("../../components/publicComponents/Listing/Searchbar"),
);
const SideFilter = lazy(
  () => import("../../components/publicComponents/Listing/SideFilter"),
);

/* ---------------- Types ---------------- */
interface LocationState {
  categoryData?: string;
  searchInput?: string;
}

const Listings: React.FC<{ isDashboard?: boolean }> = ({
  isDashboard = false,
}) => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const paramCategory = state?.categoryData;

  const { listings, loading, error } = useListings();

  /* ---------------- Local UI State ---------------- */
  const [searchKeyword, setSearchKeyword] = useState<string>(
    state?.searchInput ?? "",
  );
  const [propertyType, setPropertyType] = useState<string | undefined>(
    state?.categoryData,
  );
  const [filteredData, setFilteredData] = useState<typeof listings>([]);
  const [category, setCategory] = useState<string[]>([]);
  const [city, setCity] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [accNTaxService, setAccNTaxService] = useState<string[]>([]);
  const [area, setArea] = useState<string>("");
  const [region, setRegion] = useState<string>("");

  // Pagination (client-side, if you want it)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  /* ---------------- Derived Data ---------------- */
  const categoryArray = listings.map((data) => ({
    label: data.category,
    value: data.category,
  }));
  const uniqueArray = Array.from(
    new Map(categoryArray.map((c) => [c.value, c])).values(),
  );

  const clearFilter = () => {
    setSearchKeyword("");
    setCategory([]);
    setPriceRange("");
    setArea("");
    setRegion("");
    setCity("");
    setAccNTaxService([]);
    setFilteredData(listings);
  };

  // Client-side pagination
  const gridRef = useRef<HTMLHeadingElement | null>(null);

  return (
    <>
      <Hero {...ListingsData} />

      {/* <StyledHeader /> */}

      <Box id="connections"></Box>
      <Box
        component="section"
        pl={{ xs: 2, sm: 4, md: 0 }}
        pt={{ xs: 6, sm: 6, md: 6.5 }}
        bgcolor={isDashboard ? "primary.main" : "common.white"}
        sx={{
          contentVisibility: "auto",
          containIntrinsicSize: "1px 2400px",
        }}
      >
        <Suspense
          fallback={
            <Box sx={{ minHeight: "60vh", backgroundColor: "common.white" }} />
          }
        >
          <Container style={{ paddingLeft: "0px" }}>
            {!isDashboard && (
              <>
                <Typography
                  variant="h5"
                  color="primary.hero"
                  sx={{
                    fontSize: { xs: "32px", sm: "32px" },
                    lineHeight: { xs: "42px", sm: "42px" },
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                  ref={gridRef}
                >
                  Explore Our Directory
                </Typography>
                <Typography
                  variant="h6"
                  color="primary.hero"
                  sx={{
                    fontSize: "16px",
                    lineHeight: "22px",
                    textAlign: "center",
                    fontWeight: 400,
                    mt: 1.2,
                    px: { xs: 1, sm: 0 },
                  }}
                >
                  Check out our comprehensive directory to find a wide range of
                  valuable resources and information.
                </Typography>
              </>
            )}
            <Grid
              container
              spacing={3}
              mt={2}
              m={0}
              pb={6}
              pt={isDashboard ? "-20px" : 3}
            >
              {/* Sidebar */}
              <Grid
                item
                xs={12}
                md={3}
                sx={{
                  position: { xs: "relative", md: "sticky" },
                  top: { xs: 0, md: "150px" },
                  alignSelf: "flex-start",
                  order: { xs: 2, md: 1 },
                }}
                style={{
                  paddingLeft: "0px",
                }}
                component="div"
                {...({} as any)}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: { sm: "30px", md: "10px", lg: "22px" },
                    mt: 4,
                    borderRadius: "6px",
                    boxShadow:
                      "rgba(0, 0, 0, 0.05) 0px 6px 24px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
                  }}
                >
                  <SideFilter
                    setAccNTaxService={setAccNTaxService}
                    accNTaxService={accNTaxService}
                    setItems={setFilteredData}
                    items={filteredData.length ? filteredData : listings}
                    area={[]}
                    setArea={function (
                      value: React.SetStateAction<string[]>,
                    ): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </Paper>
              </Grid>

              <Grid
                item
                xs={12}
                md={9}
                style={{
                  paddingLeft: "0px",
                  paddingTop: "0px",
                }}
                sx={{ order: { xs: 1, md: 2 } }}
                component="div"
                {...({} as any)}
              >
                <Searchbar
                  searchKeyword={searchKeyword}
                  setSearchKeyword={setSearchKeyword}
                  propertyType={propertyType}
                  setPropertyType={setPropertyType}
                  filteredData={filteredData as any}
                  setFilteredData={
                    setFilteredData as React.Dispatch<
                      React.SetStateAction<any[]>
                    >
                  }
                  data={listings as any}
                  category={category}
                  setCategory={setCategory}
                  setCity={setCity}
                  city={city}
                  items={listings as any}
                  setItems={
                    setFilteredData as React.Dispatch<
                      React.SetStateAction<any[]>
                    >
                  }
                  priceRange={priceRange}
                  categoryArray={uniqueArray}
                  setPriceRange={setPriceRange}
                  accNTaxService={accNTaxService}
                  setAccNTaxService={setAccNTaxService}
                  area={area}
                  setArea={setArea}
                  loading={loading}
                  setLoading={() => {}}
                  error={!!error}
                  setError={() => {}}
                  setRegion={setRegion}
                  region={region}
                  paramCategory={paramCategory}
                  clearFilter={clearFilter}
                  setTotalPages={() => {}}
                />

                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "60vh",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "60vh",
                    }}
                  >
                    <Typography fontSize={"16px"} color="error">
                      {error}
                    </Typography>
                  </Box>
                ) : listings.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "60vh",
                    }}
                  >
                    <Typography fontSize={"25px"} color="black">
                      No listings found.
                    </Typography>
                  </Box>
                ) : (
                  <PropertyCard
                    items={(filteredData.length > 0
                      ? filteredData
                      : listings
                    ).slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage,
                    )}
                    handleDeleteItem={() => {}}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    setItems={
                      setFilteredData as React.Dispatch<
                        React.SetStateAction<any[]>
                      >
                    }
                    totalPages={Math.ceil(
                      (filteredData.length > 0
                        ? filteredData.length
                        : listings.length) / itemsPerPage,
                    )}
                    totalPlaces={
                      filteredData.length > 0
                        ? filteredData.length
                        : listings.length
                    }
                  />
                )}
              </Grid>
            </Grid>
          </Container>
        </Suspense>
      </Box>
    </>
  );
};

export default Listings;
