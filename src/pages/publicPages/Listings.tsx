import React, { Suspense, lazy, useState, useRef } from "react";
import {
  Grid,
  Box,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
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

const brandTeal = "#378C92";

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
  const [notifyOpen, setNotifyOpen] = useState<boolean>(false);
  const [notifyEmail, setNotifyEmail] = useState<string>("");
  const [notifyError, setNotifyError] = useState<string>("");
  const [notifySuccessOpen, setNotifySuccessOpen] = useState<boolean>(false);

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

  const handleNotifySubmit = () => {
    const email = notifyEmail.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
      setNotifyError("Enter a valid email address.");
      return;
    }

    const storageKey = "directoryComingSoonNotifyList";
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const nextEntry = {
      email,
      category: propertyType || category[0] || accNTaxService[0] || "",
      createdAt: new Date().toISOString(),
    };
    const nextList = Array.isArray(existing)
      ? [
          ...existing.filter((entry) => entry?.email !== email),
          nextEntry,
        ]
      : [nextEntry];

    localStorage.setItem(storageKey, JSON.stringify(nextList));
    setNotifyEmail("");
    setNotifyError("");
    setNotifyOpen(false);
    setNotifySuccessOpen(true);
  };

  const emptyState = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: { xs: 460, md: 500 },
        mx: { md: "10px" },
        mr: { md: "25px" },
        px: 2,
        py: { xs: 9, md: 10 },
        border: "1px dashed #dbe5ef",
        borderRadius: "16px",
        bgcolor: "rgba(248, 250, 252, 0.5)",
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          bgcolor: "common.white",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
          border: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
        }}
      >
        <BusinessCenterOutlinedIcon
          sx={{ color: brandTeal, fontSize: 42, strokeWidth: 1.2 }}
        />
      </Box>
      <Typography
        variant="h2"
        sx={{
          color: "#0f172a",
          fontSize: { xs: "28px", md: "32px" },
          lineHeight: 1.2,
          fontWeight: 300,
          letterSpacing: 0,
          mb: 1.5,
        }}
      >
        Coming Soon
      </Typography>
      <Typography
        sx={{
          color: "#64748b",
          maxWidth: 520,
          mx: "auto",
          mb: 4,
          fontSize: { xs: "16px", md: "18px" },
          lineHeight: 1.5,
          fontWeight: 300,
        }}
      >
        We're currently curating the best marketing and advertising partners.
        Check back shortly to explore our new listings.
      </Typography>
      <Button
        variant="outlined"
        onClick={() => setNotifyOpen(true)}
        sx={{
          color: brandTeal,
          borderColor: brandTeal,
          bgcolor: "common.white",
          borderRadius: "6px",
          px: 4,
          height: 46,
          minWidth: 160,
          fontSize: "15px",
          fontWeight: 600,
          textTransform: "none",
          "&:hover": {
            borderColor: brandTeal,
            bgcolor: "rgba(55, 140, 146, 0.06)",
          },
        }}
      >
        Notify Me
      </Button>
    </Box>
  );

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
                    mt: 1,
                    ml:4,
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
                  paddingTop: "0px",
                }}
                sx={{
                  order: { xs: 1, md: 2 },
                  pl: { md: "24px !important" },
                }}
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
                ) : error && listings.length === 0 ? (
                  emptyState
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
                  emptyState
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
      <Dialog
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ color: "#0f172a", fontWeight: 500 }}>
          Get notified
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#64748b", mb: 2, fontSize: "14px" }}>
            Leave your email and we'll let you know when new listings are
            available.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Email address"
            type="email"
            value={notifyEmail}
            error={Boolean(notifyError)}
            helperText={notifyError}
            onChange={(event) => {
              setNotifyEmail(event.target.value);
              setNotifyError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleNotifySubmit();
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setNotifyOpen(false)}
            sx={{ color: "#64748b", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleNotifySubmit}
            sx={{
              bgcolor: brandTeal,
              textTransform: "none",
              "&:hover": { bgcolor: "#2d7479" },
            }}
          >
            Notify Me
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={notifySuccessOpen}
        autoHideDuration={3500}
        onClose={() => setNotifySuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setNotifySuccessOpen(false)}
          sx={{ width: "100%" }}
        >
          You're on the notification list.
        </Alert>
      </Snackbar>
    </>
  );
};

export default Listings;
