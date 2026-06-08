import React, { useMemo, useState, type KeyboardEvent } from "react";
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  type SelectChangeEvent,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import theme from "../../../styles/theme";
import { useListings } from "../../../context/ListingsContext";

interface Match {
  title: string;
  slug: string;
  location: string;
}

const HomeSearch: React.FC = () => {
  const navigate = useNavigate();
  const { listings } = useListings();

  const [selectedOption, setSelectedOption] = useState<string>("Categories");
  const [searchInput, setSearchInput] = useState<string>("");
  const [matchingTitles, setMatchingTitles] = useState<Match[]>([]);
  const [selectRegion, setSelectedRegion] = useState<string>("Regions");
  const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();
  const isPlaceholder = (value: string) =>
    ["categories", "regions"].includes(normalize(value));

  const options = useMemo(() => {
    const categories = Array.from(
      new Set(
        listings
          .map((item) => item.businessCategory || item.category)
          .filter(Boolean),
      ),
    ) as string[];

    return ["Categories", ...categories];
  }, [listings]);

  const regionOptions = useMemo(() => {
    const regions = Array.from(
      new Set(listings.map((item) => item.region).filter(Boolean)),
    ) as string[];

    return ["Regions", ...regions];
  }, [listings]);

  const handleOptionSelect = (event: SelectChangeEvent<string>) => {
    setSelectedOption(event.target.value);
  };

  const handleRegionOptionSelect = (event: SelectChangeEvent<string>) => {
    setSelectedRegion(event.target.value);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    const inputValue = event.currentTarget.value;
    setSearchInput(inputValue);
    const normalizedInput = normalize(inputValue);
    const matches = listings.filter(
      (item) =>
        normalizedInput.length > 0 &&
        [
          item.businessName,
          item.title,
          item.intro,
          item.shortDescription,
          item.category,
          item.businessCategory,
          item.city,
          item.region,
        ].some((field) => normalize(field).includes(normalizedInput)),
    );
    setMatchingTitles(
      matches.map((match) => ({
        title: match.title,
        slug: match.slug,
        location: match.city || match.region || "",
      })),
    );
  };

  const getInputData = () => {
    const categoryData = isPlaceholder(selectedOption) ? "" : selectedOption;
    const regionCategory = isPlaceholder(selectRegion) ? "" : selectRegion;
    const query = new URLSearchParams();

    if (searchInput.trim()) query.set("search", searchInput.trim());
    if (regionCategory) query.set("region", regionCategory);
    if (categoryData) query.set("category", categoryData);

    navigate(`/listings${query.toString() ? `?${query.toString()}` : ""}`, {
      state: {
        searchInput: searchInput.trim(),
        categoryData,
        regionCategory,
        scrollToResults: true,
      },
    });
  };

  return (
    <Box width="100%" sx={{ background: "transparent" }}>
      {/* Outer Box */}
      {/* Responsive Layout */}
      {/* Responsive Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: { xs: "100%", md: "100^" },
          // mx: "auto",
          mt: { xs: 0, md: 2 },
        }}
      >
        {/* --- Larger Screens (md and up) --- */}
        <Box sx={{ display: "grid", gap: 0 }}>
          <Box
            sx={{
              display: { xs: "none", md: "flex", justifyContent: "flex-start" },
              flexDirection: "row",
              gap: 1,
            }}
          >
            {/* Search Input */}
            <Box flex={2}>
              <Box
                component="input"
                placeholder="What are you looking for?"
                aria-label="Search businesses"
                value={searchInput}
                onKeyUp={handleKeyUp}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") getInputData();
                }}
                sx={{
                  width: "100%",
                  height: "56px",
                  borderRadius: "8px",
                  outline: "none",
                  paddingLeft: "16px",
                  border: `1.5px solid ${alpha(theme.palette.text.main, 0.3)}`,
                  backgroundColor: alpha(theme.palette.text.main, 0.05),
                  backdropFilter: "blur(10px)",
                  color: theme.palette.text.secondary,
                  fontSize: { xs: "11px", md: "16px" },
                }}
              />
            </Box>

            {/* Region Select */}
            <Box flex={1}>
              <FormControl fullWidth>
                <Select
                  value={selectRegion}
                  inputProps={{ "aria-label": "Select region" }}
                  onChange={handleRegionOptionSelect}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: alpha(theme.palette.text.main, 0.05),
                        backdropFilter: "blur(10px)",
                        borderRadius: "8px",
                        border: `1.5px solid ${alpha(theme.palette.text.main, 0.3)}`,
                        color: theme.palette.text.secondary,
                      },
                    },
                    MenuListProps: {
                      sx: {
                        "& .MuiMenuItem-root": {
                          color: theme.palette.text.secondary,
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.text.main,
                              0.15,
                            ),
                          },
                        },
                      },
                    },
                  }}
                  sx={{
                    width: "100%",
                    height: "56px",
                    borderRadius: "8px",
                    border: `1.5px solid ${alpha(theme.palette.text.main, 0.3)}`,
                    backgroundColor: alpha(theme.palette.text.main, 0.05),
                    backdropFilter: "blur(10px)",
                    color: theme.palette.text.secondary,
                    fontSize: { xs: "11px", md: "16px" },
                    "& .MuiSelect-icon": {
                      color: theme.palette.text.main,
                    },
                  }}
                >
                  {regionOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box flex={1}>
              <FormControl
                fullWidth
                sx={{
                  display: "flex",
                  justifyContent: "start",
                  alignItems: "center",
                }}
              >
                <Select
                  value={selectedOption}
                  inputProps={{ "aria-label": "Select category" }}
                  onChange={handleOptionSelect}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: alpha(theme.palette.text.main, 0.05),
                        backdropFilter: "blur(10px)",
                        borderRadius: "8px",
                        border: `1.5px solid ${alpha(theme.palette.text.main, 0.3)}`,
                        color: theme.palette.text.secondary,
                      },
                    },
                    MenuListProps: {
                      sx: {
                        "& .MuiMenuItem-root": {
                          color: theme.palette.text.secondary,
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.text.main,
                              0.15,
                            ),
                          },
                        },
                      },
                    },
                  }}
                  sx={{
                    width: "100%",
                    height: "56px",
                    borderRadius: "8px",
                    border: `1.5px solid ${alpha(theme.palette.text.main, 0.3)}`,
                    backgroundColor: alpha(theme.palette.text.main, 0.05),
                    backdropFilter: "blur(10px)",
                    color: theme.palette.text.secondary,
                    fontSize: { xs: "11px", md: "16px" },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    "& .MuiSelect-icon": {
                      color: theme.palette.text.main,
                    },
                  }}
                >
                  {options.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Search Button */}
            <Box flex={0.5}>
              <Button
                variant="contained"
                onClick={getInputData}
                aria-label="Search listings"
                sx={{
                  background: theme.palette.primary.focus,
                  color: theme.palette.primary.main,
                  width: "100%",
                  height: "56px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  "&:hover": {
                    background: theme.palette.primary.focus,
                    opacity: 0.9,
                  },
                  "& .MuiSelect-icon": {
                    color: theme.palette.text.main,
                  },
                }}
              >
                <SearchIcon />
              </Button>
            </Box>

            {/* Category Select */}
          </Box>
        </Box>

        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {/* Row 1 - Full Search Input */}
          <Box>
            <Box
              component="input"
              placeholder="What are you looking for?"
              value={searchInput}
              onKeyUp={handleKeyUp}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") getInputData();
              }}
              sx={{
                width: "100%",
                height: "40px",
                borderRadius: "8px",
                outline: "none",
                paddingLeft: "16px",
                border: `1.5px solid ${alpha(theme.palette.text.main, 0.3)}`,
                backgroundColor: alpha(theme.palette.text.main, 0.05),
                backdropFilter: "blur(10px)",
                color: theme.palette.text.secondary,
                fontSize: "11px",
              }}
            />
          </Box>

          {/* Row 2 - Region + Button */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <FormControl fullWidth>
              <Select
                value={selectRegion}
                inputProps={{ "aria-label": "Select region" }}
                onChange={handleRegionOptionSelect}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: alpha(theme.palette.text.main, 0.05),
                      backdropFilter: "blur(10px)",
                      borderRadius: "8px",
                      border: `1.5px solid ${alpha(theme.palette.text.main, 0.3)}`,
                      color: theme.palette.text.secondary,
                    },
                  },
                  MenuListProps: {
                    sx: {
                      "& .MuiMenuItem-root": {
                        color: theme.palette.text.secondary,
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.text.main, 0.15),
                        },
                      },
                    },
                  },
                }}
                sx={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "8px",
                  border: `1.5px solid ${alpha(theme.palette.text.main, 0.3)}`,
                  backgroundColor: alpha(theme.palette.text.main, 0.05),
                  backdropFilter: "blur(10px)",
                  color: theme.palette.text.secondary,
                  fontSize: "11px",
                  "& .MuiSelect-icon": {
                    color: theme.palette.text.main,
                  },
                }}
              >
                {regionOptions.map((option, i) => (
                  <MenuItem key={i} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={getInputData}
              sx={{
                background: theme.palette.primary.focus,
                color: theme.palette.primary.main,
                width: "50%",
                height: "40px",
                borderRadius: "8px",
                fontSize: "11px",
                "&:hover": {
                  background: theme.palette.primary.focus,
                  opacity: 0.9,
                },
              }}
            >
              <SearchIcon sx={{ mr: 0.5, fontSize: 18 }} /> Search
            </Button>
          </Box>

          {/* Row 3 - Category Select */}
          <Box>
            <FormControl fullWidth>
              <Select
                value={selectedOption}
                inputProps={{ "aria-label": "Select category" }}
                onChange={handleOptionSelect}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: alpha(theme.palette.text.main, 0.05),
                      backdropFilter: "blur(10px)",
                      borderRadius: "8px",
                      border: `1.5px solid ${alpha(theme.palette.text.main, 0.3)}`,
                      color: theme.palette.text.secondary,
                    },
                  },
                  MenuListProps: {
                    sx: {
                      "& .MuiMenuItem-root": {
                        color: theme.palette.text.secondary,
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.text.main, 0.15),
                        },
                      },
                    },
                  },
                }}
                sx={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "8px",
                  border: `1.5px solid ${alpha(theme.palette.text.main, 0.3)}`,
                  backgroundColor: alpha(theme.palette.text.main, 0.05),
                  backdropFilter: "blur(10px)",
                  color: theme.palette.text.secondary,
                  fontSize: "11px",
                  "& .MuiSelect-icon": {
                    color: theme.palette.text.main,
                  },
                }}
              >
                {options.map((option, i) => (
                  <MenuItem key={i} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HomeSearch;
