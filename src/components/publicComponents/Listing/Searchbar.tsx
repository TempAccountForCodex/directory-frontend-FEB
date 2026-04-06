import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import TuneIcon from "@mui/icons-material/Tune";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  type SelectChangeEvent,
  useTheme,
} from "@mui/material";
import ButtonPrimary from "../../UI/ButtonPrimary";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { type Place } from "../../../types/place";

/* ---------------- Types ---------------- */
interface Option {
  value: string;
  label: string;
}

interface DashboardListingSearchProps {
  searchKeyword: string;
  setSearchKeyword: React.Dispatch<React.SetStateAction<string>>;

  propertyType?: string;
  setPropertyType: React.Dispatch<React.SetStateAction<string | undefined>>;

  filteredData: Place[];
  setFilteredData: React.Dispatch<React.SetStateAction<Place[]>>;

  data: Place[];
  setCategory: React.Dispatch<React.SetStateAction<string[]>>;
  category: string[];

  region: string;
  setRegion: React.Dispatch<React.SetStateAction<string>>;

  city: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;

  priceRange: string;
  setPriceRange: React.Dispatch<React.SetStateAction<string>>;

  categoryArray: Option[];

  area: string;
  setArea: React.Dispatch<React.SetStateAction<string>>;

  accNTaxService: string[];
  setAccNTaxService: React.Dispatch<React.SetStateAction<string[]>>;

  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;

  error: boolean;
  setError: React.Dispatch<React.SetStateAction<boolean>>;

  items: Place[];
  setItems: React.Dispatch<React.SetStateAction<Place[]>>;

  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  paramCategory?: string;
  clearFilter: () => void;
}

const DashboardListingSearch: React.FC<DashboardListingSearchProps> = ({
  searchKeyword,
  setSearchKeyword,
  propertyType,
  setPropertyType,
  filteredData,
  setFilteredData,
  data,
  category,
  setCategory,
  region,
  setRegion,
  city,
  setCity,
  priceRange,
  setPriceRange,
  categoryArray,
  area,
  setArea,
  accNTaxService,
  setAccNTaxService,
  loading,
  setLoading,
  error,
  setError,
  items,
  setItems,
  setTotalPages,
  paramCategory,
  clearFilter,
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string;

  const [isAdvancedSearchVisible, setIsAdvancedSearchVisible] =
    useState<boolean>(false);
  const [cityOptions, setCityOptions] = useState<Option[]>([]);
  const [regionOptions, setRegionOptions] = useState<Option[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [priceRangeOptions, setPriceRangeOptions] = useState<Option[]>([]);
  const [areaOptions, setAreaOptions] = useState<Option[]>([]);
  const [accountingAndTaxService, setAccountingAndTaxService] =
    useState<string>("");
  const [isFilterApplied, setIsFilterApplied] = useState<boolean>(false);

  /* ---------------- Populate Dropdowns ---------------- */
  useEffect(() => {
    const categories = [
      ...new Set(data.map((item) => item.category).filter(Boolean)),
    ] as string[];
    setCategoryOptions(
      categories.map((category) => ({
        value: category,
        label: category,
      })),
    );

    const priceRanges = [
      ...new Set(data.map((item) => item.priceRange).filter(Boolean)),
    ] as string[];
    setPriceRangeOptions(
      priceRanges
        .filter(Boolean)
        .map((range) => ({ value: range!, label: `${range}` })),
    );

    const areas = [...new Set(data.map((item) => item.area).filter(Boolean))];
    setAreaOptions(areas.map((area) => ({ value: area!, label: area! })));

    const regions = [
      ...new Set(data.map((item) => item.region).filter(Boolean)),
    ];
    setRegionOptions(
      regions.map((region) => ({ value: region!, label: region! })),
    );
  }, [data]);

  useEffect(() => {
    if (region) {
      const filteredCities = data
        .filter((item) => item.region === region)
        .map((item) => item.city)
        .filter(Boolean) as string[];
      const uniqueCities = [...new Set(filteredCities)];
      setCityOptions(
        uniqueCities.map((city) => ({ value: city, label: city })),
      );
    } else {
      setCityOptions([]);
    }
  }, [data, region]);

  /* ---------------- Handlers ---------------- */
  const toggleAdvancedSearch = () => {
    setIsAdvancedSearchVisible((prev) => !prev);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
    checkIfFilterApplied(
      event.target.value,
      category as any,
      priceRange,
      area,
      region,
      city,
      accountingAndTaxService,
    );
    if (event.target.value === "") {
      handleButtonClick();
    }
  };

  const handleButtonClick = async () => {
    setLoading(true);
    try {
      const searchParams: Record<string, any> = {};
      if (category) searchParams.category = category;
      if (searchKeyword) searchParams.title = searchKeyword;
      if (priceRange) searchParams.priceRange = priceRange;
      if (city) searchParams.city = city;
      if (area) searchParams.area = area;
      if (region) searchParams.region = region;

      const response = await axios.get(`${backendUrl}/api/places`, {
        params: { search: JSON.stringify(searchParams) },
      });
      setItems(response.data.places);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategory(event.target.value as any);
    checkIfFilterApplied(
      searchKeyword,
      event.target.value,
      priceRange,
      area,
      region,
      city,
      accountingAndTaxService,
    );
  };

  const handlePriceChange = (event: SelectChangeEvent<string>) => {
    setPriceRange(event.target.value);
    checkIfFilterApplied(
      searchKeyword,
      category as any,
      event.target.value,
      area,
      region,
      city,
      accountingAndTaxService,
    );
  };

  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    setRegion(event.target.value);
    checkIfFilterApplied(
      searchKeyword,
      category as any,
      priceRange,
      area,
      event.target.value,
      city,
      accountingAndTaxService,
    );
  };

  const handleCityChange = (event: SelectChangeEvent<string>) => {
    setCity(event.target.value);
    checkIfFilterApplied(
      searchKeyword,
      category as any,
      priceRange,
      area,
      region,
      event.target.value,
      accountingAndTaxService,
    );
  };

  const handleAreaChange = (event: SelectChangeEvent<string>) => {
    setArea(event.target.value);
    checkIfFilterApplied(
      searchKeyword,
      category as any,
      priceRange,
      event.target.value,
      region,
      city,
      accountingAndTaxService,
    );
  };

  const handleServiceChange = (event: SelectChangeEvent<string>) => {
    setAccountingAndTaxService(event.target.value);
    checkIfFilterApplied(
      searchKeyword,
      category as any,
      priceRange,
      area,
      region,
      city,
      event.target.value,
    );
  };

  const checkIfFilterApplied = (
    searchKeyword?: string,
    category?: string,
    priceRange?: string,
    area?: string,
    region?: string,
    city?: string,
    accountingAndTaxService?: string,
  ) => {
    setIsFilterApplied(
      Boolean(
        searchKeyword ||
        category ||
        priceRange ||
        area ||
        region ||
        city ||
        accountingAndTaxService,
      ),
    );
  };

  // const clearFilter = () => {
  //   setSearchKeyword("");
  //   setCategory("");
  //   setPriceRange("");
  //   setArea("");
  //   setAccountingAndTaxService("");
  //   setRegion("");
  //   setCity("");
  //   setItems(data);
  //   setIsFilterApplied(false);
  // };

  const theme = useTheme();

  /* ---------------- UI ---------------- */
  return (
    <>
      {/* ===== Container Wrapper ===== */}
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          padding: { sm: "0px", md: "0px 10px" },
          width: "100%",
        }}
      >
        <Box my={4} width={"100%"} p={0}>
          <Grid container spacing={2} width={"100%"}>
            <Grid
              item
              xs={12}
              md={12}
              p={0}
              width={"100%"}
              component="div"
              {...({} as any)}
            >
              {/* ===== Search Box Card ===== */}
              <Paper
                elevation={3}
                sx={{
                  boxShadow:
                    " rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
                  width: "100%",
                  p: 2,
                }}
              >
                <Grid
                  container
                  spacing={2}
                  sx={{
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  {/* ===== Left Section (Advance Filter + Clear Filter) ===== */}
                  <Grid item xs={12} sm={3} component="div" {...({} as any)}>
                    <Grid container spacing={0}>
                      {/* --- Advance Filter Button --- */}
                      <Grid
                        item
                        xs={12}
                        sm={6.6}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          gap: 1,
                          paddingLeft: { xs: "4px", lg: "20px" },
                          maxWidth: 130,
                          alignItems: "center",
                        }}
                        style={{
                          marginTop: "auto",
                          marginBottom: "auto",
                          cursor: "pointer",
                          paddingTop: "20px",
                        }}
                        onClick={toggleAdvancedSearch}
                        component="div"
                        {...({} as any)}
                      >
                        <TuneIcon sx={{ pt: "5px" }} />
                        <Typography
                          sx={{
                            fontSize: { xs: "13px", lg: "0.9rem" },
                            paddingLeft: { xs: "0px", lg: "10px" },
                            pt: "5px",
                          }}
                        >
                          Advance Filter
                        </Typography>
                      </Grid>

                      {/* --- Clear Filter Button (Conditional) --- */}
                      {isFilterApplied && (
                        <Grid
                          item
                          xs={12}
                          sm={5.4}
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            gap: 1,
                            paddingLeft: { xs: "4px", lg: "20px" },
                            maxWidth: 130,
                            alignItems: "center",
                          }}
                          style={{
                            marginTop: "auto",
                            marginBottom: "auto",
                            cursor: "pointer",
                            paddingTop: "20px",
                          }}
                          onClick={clearFilter}
                          component="div"
                          {...({} as any)}
                        >
                          <SearchOffIcon sx={{ pt: "5px" }} />
                          <Typography
                            sx={{
                              fontSize: { xs: "13px", lg: "0.9rem" },
                              paddingLeft: { xs: "0px", lg: "10px" },
                              pt: "5px",
                            }}
                          >
                            Clear Filter
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>

                  {/* ===== Services Dropdown ===== */}
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ flex: 1 }}
                    component="div"
                    {...({} as any)}
                  >
                    <Typography
                      sx={{ fontSize: "13px", pb: "10px", pl: "2px" }}
                    >
                      Services
                    </Typography>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel
                        sx={{
                          "&.Mui-focused": {
                            color: "primary.focus",
                          },
                        }}
                      >
                        Services
                      </InputLabel>
                      <Select
                        label="Services"
                        value={category}
                        onChange={handleCategoryChange as any}
                        sx={{ flex: 1 }}
                      >
                        {categoryArray.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* ===== Keyword Search Field ===== */}
                  <Grid
                    item
                    xs={9}
                    sm={4}
                    component="div"
                    sx={{ flex: 1 }}
                    {...({} as any)}
                  >
                    <Typography sx={{ fontSize: "13px", pl: "2px" }}>
                      Keyword
                    </Typography>
                    <FormControl fullWidth>
                      <TextField
                        label="Search Keyword"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        style={{ marginBottom: "0px", marginTop: "10px" }}
                        value={searchKeyword}
                        onChange={handleInputChange}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleButtonClick();
                          }
                        }}
                        sx={{
                          "& label.Mui-focused": {
                            color: "primary.focus",
                          },
                        }}
                      />
                    </FormControl>
                  </Grid>

                  {/* ===== Search Button ===== */}
                  <Grid
                    item
                    xs={2}
                    sm={1}
                    sx={{
                      mt: "30px",
                      display: { xs: "flex", sm: "flex", md: "block" },
                    }}
                    component="div"
                    {...({} as any)}
                  >
                    <ButtonPrimary
                      onClick={handleButtonClick}
                      sx={{
                        background: (theme.palette.primary as any).focus,
                        color: theme.palette.common.white,
                        height: "53px",
                        px: 1,
                        borderRadius: "5px",
                        textTransform: "capitalize",
                        fontSize: "12px",
                        float: "right",
                        width: "43px",
                        "&:hover": {
                          background: (theme.palette.primary as any).focus,
                          color: theme.palette.common.white,
                          opacity: 0.9,
                        },
                        ml: { md: "auto", sm: 0, xs: 0 },
                      }}
                    >
                      {loading ? (
                        <CircularProgress
                          size={24}
                          sx={{ color: theme.palette.common.white }}
                        />
                      ) : (
                        <SearchIcon />
                      )}
                    </ButtonPrimary>
                  </Grid>
                </Grid>

                {/* ===== Advanced Search Section (Conditional) ===== */}
                {isAdvancedSearchVisible && (
                  <Box id="advanceSearch">
                    <Grid
                      container
                      spacing={2}
                      style={{
                        marginTop: "20px",
                        display: "flex",
                      }}
                    >
                      {/* --- Price Range Dropdown --- */}
                      <Grid
                        item
                        xs={12}
                        sm={3}
                        sx={{ flex: 1 }}
                        component="div"
                        {...({} as any)}
                      >
                        <Typography
                          sx={{ fontSize: "13px", pb: "10px", pl: "2px" }}
                        >
                          Price Range
                        </Typography>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel
                            sx={{
                              "&.Mui-focused": {
                                color: "primary.focus",
                              },
                            }}
                          >
                            Price Range
                          </InputLabel>
                          <Select
                            value={priceRange}
                            onChange={handlePriceChange}
                            label="Price Range"
                          >
                            {priceRangeOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* --- Region Dropdown --- */}
                      <Grid
                        item
                        xs={12}
                        sm={3}
                        sx={{ flex: 1 }}
                        component="div"
                        {...({} as any)}
                      >
                        <Typography
                          sx={{ fontSize: "13px", pb: "10px", pl: "2px" }}
                        >
                          Region
                        </Typography>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel
                            sx={{
                              "&.Mui-focused": {
                                color: "primary.focus",
                              },
                            }}
                          >
                            Region
                          </InputLabel>
                          <Select
                            value={region}
                            onChange={handleRegionChange}
                            label="Region"
                          >
                            {["Canada", "United Kingdom", "United States"].map(
                              (option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ),
                            )}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* --- Area Dropdown --- */}
                      <Grid
                        item
                        xs={12}
                        sm={3}
                        sx={{ flex: 1 }}
                        component="div"
                        {...({} as any)}
                      >
                        <Typography
                          sx={{ fontSize: "13px", pb: "10px", pl: "2px" }}
                        >
                          Area
                        </Typography>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel
                            sx={{
                              "&.Mui-focused": {
                                color: "primary.focus",
                              },
                            }}
                          >
                            Area
                          </InputLabel>
                          <Select
                            value={area}
                            onChange={handleAreaChange}
                            label="Area"
                          >
                            {areaOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* --- City Dropdown --- */}
                      <Grid
                        item
                        xs={12}
                        sm={3}
                        sx={{ flex: 1 }}
                        component="div"
                        {...({} as any)}
                      >
                        <Typography
                          sx={{ fontSize: "13px", pb: "10px", pl: "2px" }}
                        >
                          City
                        </Typography>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel
                            sx={{
                              "&.Mui-focused": {
                                color: "primary.focus",
                              },
                            }}
                          >
                            City
                          </InputLabel>
                          <Select
                            value={city}
                            onChange={handleCityChange}
                            label="City"
                            disabled={region === "" ? true : false}
                          >
                            {cityOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default DashboardListingSearch;
