import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  Select,
  MenuItem,
  Collapse,
  Button,
  ButtonBase,
  Slider,
  useTheme,
  type SelectChangeEvent,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { type Place } from "../../../types/place";

interface Option {
  value: string;
  label: string;
}

export interface SideFilterProps {
  searchKeyword: string;
  setSearchKeyword: React.Dispatch<React.SetStateAction<string>>;
  propertyType?: string;
  setPropertyType: React.Dispatch<React.SetStateAction<string | undefined>>;
  category: string[];
  setCategory: React.Dispatch<React.SetStateAction<string[]>>;
  categoryArray: Option[];
  accNTaxService: string[];
  setAccNTaxService: React.Dispatch<React.SetStateAction<string[]>>;
  region: string;
  setRegion: React.Dispatch<React.SetStateAction<string>>;
  city: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;
  priceRange: string;
  setPriceRange: React.Dispatch<React.SetStateAction<string>>;
  area: string;
  setArea: React.Dispatch<React.SetStateAction<string>>;
  data: Place[];
  setItems: React.Dispatch<React.SetStateAction<any[]>>;
  setFilteredData: React.Dispatch<React.SetStateAction<any[]>>;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  paramCategory?: string;
  clearFilter: () => void;
  showUserFilters?: boolean;
  showOnlyMine?: boolean;
  setShowOnlyMine?: React.Dispatch<React.SetStateAction<boolean>>;
  showOnlyFavorites?: boolean;
  setShowOnlyFavorites?: React.Dispatch<React.SetStateAction<boolean>>;
  sortMode?: "default" | "az" | "za";
  setSortMode?: React.Dispatch<React.SetStateAction<"default" | "az" | "za">>;
}

const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();

const emptyOptions: Option[] = [];
const emptyPlaces: Place[] = [];
const emptyStrings: string[] = [];
const noop = () => undefined;

const SideFilter: React.FC<SideFilterProps> = ({
  searchKeyword = "", setSearchKeyword = noop,
  propertyType, setPropertyType = noop,
  category = emptyStrings, setCategory = noop, categoryArray = emptyOptions,
  accNTaxService = emptyStrings, setAccNTaxService = noop,
  region = "", setRegion = noop, city = "", setCity = noop,
  priceRange = "", setPriceRange = noop, area = "", setArea = noop,
  data = emptyPlaces, setItems = noop, setFilteredData = noop, setTotalPages = noop,
  loading, paramCategory, clearFilter,
  showUserFilters = false,
  showOnlyMine = false,
  setShowOnlyMine = noop,
  showOnlyFavorites = false,
  setShowOnlyFavorites = noop,
  sortMode = "default",
  setSortMode = noop,
}) => {
  const theme = useTheme();
  const teal    = ((theme.palette.primary as any).focus || theme.palette.primary.main || "#378C92") as string;
  const font    = theme.typography.fontFamily;
  const pageBg  = (theme.palette.bg as any)?.muted ?? "#F0F1EA";   // cream off-white
  const textMain = theme.palette.text.primary;                      // #252525 charcoal
  const textSub  = (theme.palette.text as any).gray ?? "#6A6F78";  // muted grey
  const border   = alpha(textMain, 0.1);
  const white    = theme.palette.common.white;

  const selectSx = {
    width: "100%",
    borderRadius: "10px",
    background: white,
    color: textMain,
    fontSize: "13px",
    fontFamily: font,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: border, borderRadius: "10px" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: alpha(teal, 0.45) },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: teal,
      boxShadow: `0 0 0 3px ${alpha(teal, 0.12)}`,
    },
    "& .MuiSelect-icon": { color: textSub },
    "& .MuiSelect-select": { py: "9px", px: "12px" },
    "&.Mui-disabled": { opacity: 0.38 },
  } as const;

  const menuProps = {
    PaperProps: {
      sx: {
        background: white,
        color: textMain,
        border: `1px solid ${border}`,
        borderRadius: "12px",
        boxShadow: `0 8px 24px ${alpha(textMain, 0.1)}`,
        mt: 0.5,
        "& .MuiMenuItem-root": {
          fontSize: "13px", fontFamily: font,
          color: textSub,
          "&:hover": { background: alpha(teal, 0.08), color: textMain },
          "&.Mui-selected": {
            background: alpha(teal, 0.12), color: teal, fontWeight: 600,
            "&:hover": { background: alpha(teal, 0.16) },
          },
        },
      },
    },
  };

  /* ── state ─────────────────────────────────────────────────── */
  const [cityOptions,       setCityOptions]       = useState<Option[]>([]);
  const [regionOptions,     setRegionOptions]     = useState<Option[]>([]);
  const [priceRangeOptions, setPriceRangeOptions] = useState<Option[]>([]);
  const [areaOptions,       setAreaOptions]       = useState<Option[]>([]);
  const [expanded, setExpanded] = useState({
    search: true,
    view: true,
    filters: true,
  });

  const selectedCategory = Array.isArray(category) ? category[0] || "" : "";
  const getCategory = (item: Place) => item.businessCategory || item.category || "";

  const priceSliderOptions = useMemo(
    () => [{ value: "", label: "Any" }, ...priceRangeOptions],
    [priceRangeOptions],
  );
  const selectedPriceIndex = useMemo(() => {
    const i = priceSliderOptions.findIndex(o => o.value === priceRange);
    return i >= 0 ? i : 0;
  }, [priceRange, priceSliderOptions]);
  const priceSliderMarks = useMemo(
    () => priceSliderOptions.map((_, i) => ({ value: i })),
    [priceSliderOptions],
  );
  const getPriceLabel = (v: number) => priceSliderOptions[v]?.label || "Any";

  useEffect(() => {
    const uniq = <T,>(arr: (T | undefined)[]) => [...new Set(arr.filter(Boolean))] as T[];
    setPriceRangeOptions(uniq(data.map(i => i.priceRange)).map(r => ({ value: r, label: r })));
    setAreaOptions(uniq(data.map(i => i.area)).map(a => ({ value: a, label: a })));
    setRegionOptions(uniq(data.map(i => i.region)).map(r => ({ value: r, label: r })));
  }, [data]);

  useEffect(() => {
    if (region) {
      const cities = [...new Set(
        data.filter(i => i.region === region).map(i => i.city).filter(Boolean) as string[],
      )];
      setCityOptions(cities.map(c => ({ value: c, label: c })));
    } else {
      setCityOptions([]);
    }
  }, [data, region]);

  useEffect(() => {
    if (paramCategory) { setCategory([paramCategory]); setPropertyType(paramCategory); }
  }, [paramCategory, setCategory, setPropertyType]);

  const applyFilters = () => {
    const keyword = normalize(searchKeyword);
    const catVal  = normalize(selectedCategory || propertyType);
    const svcCats = accNTaxService.map(normalize);

    const filtered = data.filter(item => {
      const itemCat = normalize(getCategory(item));
      const fields  = [
        item.businessName, item.title, item.category, item.businessCategory,
        item.shortDescription, item.description, item.desc, item.intro,
        item.city, item.region, item.country, item.address, item.area,
        Array.isArray(item.tags) ? item.tags.join(" ") : item.tags,
      ];
      if (keyword && !fields.some(f => normalize(f).includes(keyword))) return false;
      if (catVal && itemCat !== catVal) return false;
      if (svcCats.length > 0 && !svcCats.includes(itemCat)) return false;
      if (priceRange && normalize(item.priceRange || item.priceLevel) !== normalize(priceRange)) return false;
      if (area   && normalize(item.area)   !== normalize(area))   return false;
      if (region && normalize(item.region) !== normalize(region)) return false;
      if (city   && normalize(item.city)   !== normalize(city))   return false;
      return true;
    });
    setFilteredData(filtered);
    setItems(filtered);
    setTotalPages(Math.ceil(filtered.length / 12));
  };

  const handleServiceChange  = (e: SelectChangeEvent<string>) => { const v = e.target.value; setCategory(v ? [v] : []); setPropertyType(v || undefined); };
  const handleRegionChange   = (e: SelectChangeEvent<string>) => { setRegion(e.target.value); setCity(""); };
  const toggle = (s: keyof typeof expanded) => setExpanded(p => ({ ...p, [s]: !p[s] }));

  /* ── section header ─────────────────────────────────────────── */
  const SectionHeader = ({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) => (
    <Box onClick={onToggle} sx={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      cursor: "pointer", userSelect: "none",
      "& .sh-text": { color: textSub, transition: "color 0.18s", fontFamily: font },
      "& .sh-icon": { color: alpha(textSub, 0.6), transition: "color 0.18s" },
      "&:hover .sh-text": { color: teal },
      "&:hover .sh-icon": { color: teal },
    }}>
      <Typography className="sh-text" sx={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </Typography>
      {open
        ? <ExpandLessIcon className="sh-icon" sx={{ fontSize: 18 }} />
        : <ExpandMoreIcon className="sh-icon" sx={{ fontSize: 18 }} />}
    </Box>
  );

  const FilterToggle = ({
    active,
    label,
    onClick,
  }: {
    active: boolean;
    label: string;
    onClick: () => void;
  }) => (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: "100%",
        justifyContent: "flex-start",
        px: 1.75,
        py: 1,
        borderRadius: "8px",
        background: active ? alpha(teal, 0.1) : "transparent",
        color: active ? teal : textSub,
        border: `1px solid ${active ? alpha(teal, 0.3) : "transparent"}`,
        fontWeight: active ? 600 : 400,
        fontSize: "13px",
        fontFamily: font,
        textAlign: "left",
        transition: "all 0.18s ease",
        "&:hover": {
          background: active ? alpha(teal, 0.14) : alpha(teal, 0.06),
          color: teal,
        },
      }}
    >
      {label}
    </ButtonBase>
  );

  const divider = <Box sx={{ height: "1px", background: border }} />;

  /* ── render ─────────────────────────────────────────────────── */
  return (
    /* Outer frosted shell — matches WhyWeBuiltThis Paper */
    <Box sx={{
      width: "100%",
      p: "8px",
      borderRadius: "20px",
      background: "rgba(255,255,255,0.4)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.8)",
      boxShadow: "0 50px 100px -20px rgba(0,0,0,0.15)",
      fontFamily: font,
    }}>
    {/* Inner solid white card — matches WhyWeBuiltThis inner Box */}
    <Box sx={{
      borderRadius: "18px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      background: white,
    }}>

      {/* Header */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 2.5, py: 1.75,
        borderBottom: `1px solid ${border}`,
      }}>
        <Typography sx={{ color: textMain, fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em", fontFamily: font }}>
          Filter Directory
        </Typography>
        <IconButton onClick={clearFilter} size="small" title="Reset filters" sx={{
          color: textSub,
          "&:hover": { color: teal, background: alpha(teal, 0.08) },
        }}>
          <RefreshIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Box>

      {/* Scrollable body */}
      <Box sx={{
        flex: 1, overflowY: "auto", px: 2.5, py: 2.5,
        display: "flex", flexDirection: "column", gap: 2.25,
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-thumb": { background: alpha(textMain, 0.15), borderRadius: "4px" },
      }}>

        {/* Search */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <SectionHeader label="Search" open={expanded.search} onToggle={() => toggle("search")} />
          <Collapse in={expanded.search}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, pt: 0.5 }}>
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1,
                background: white,
                border: `1px solid ${border}`,
                borderRadius: "10px", px: 1.5, py: 0.75,
                transition: "all 0.2s",
                "&:focus-within": {
                  borderColor: teal,
                  boxShadow: `0 0 0 3px ${alpha(teal, 0.12)}`,
                },
              }}>
                <SearchIcon sx={{ fontSize: 15, color: textSub, flexShrink: 0 }} />
                <InputBase
                  placeholder="Keywords…"
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") applyFilters(); }}
                  sx={{
                    flex: 1, fontSize: "13px", fontFamily: font, color: textMain,
                    "& input::placeholder": { color: textSub, opacity: 1 },
                  }}
                />
              </Box>
              <Select value={selectedCategory} onChange={handleServiceChange} displayEmpty variant="outlined" sx={selectSx} MenuProps={menuProps}>
                <MenuItem value=""><span style={{ color: textSub, fontFamily: font }}>All Categories</span></MenuItem>
                {categoryArray.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </Select>
            </Box>
          </Collapse>
        </Box>

        {divider}

        {/* View controls */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <SectionHeader label="View" open={expanded.view} onToggle={() => toggle("view")} />
          <Collapse in={expanded.view}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, pt: 0.5 }}>
              <Select
                value={sortMode}
                onChange={(event) =>
                  setSortMode(event.target.value as "default" | "az" | "za")
                }
                displayEmpty
                variant="outlined"
                sx={selectSx}
                MenuProps={menuProps}
              >
                <MenuItem value="default">Default order</MenuItem>
                <MenuItem value="az">A-Z</MenuItem>
                <MenuItem value="za">Z-A</MenuItem>
              </Select>

              {showUserFilters && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <FilterToggle
                    active={showOnlyMine}
                    label="My listings"
                    onClick={() => setShowOnlyMine((value) => !value)}
                  />
                  <FilterToggle
                    active={showOnlyFavorites}
                    label="My favourites"
                    onClick={() => setShowOnlyFavorites((value) => !value)}
                  />
                </Box>
              )}
            </Box>
          </Collapse>
        </Box>

        {divider}

        {/* Filters */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <SectionHeader label="Filters" open={expanded.filters} onToggle={() => toggle("filters")} />
          <Collapse in={expanded.filters}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0.5 }}>

              {/* Price slider */}
              <Box sx={{
                borderRadius: "10px",
                background: white,
                border: `1px solid ${border}`,
                px: 2, pt: 1.75, pb: 1.5,
              }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: textSub, fontFamily: font, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Price Range
                  </Typography>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: teal, fontFamily: font }}>
                    {getPriceLabel(selectedPriceIndex)}
                  </Typography>
                </Box>
                <Slider
                  value={selectedPriceIndex}
                  min={0} max={Math.max(priceSliderOptions.length - 1, 0)} step={1}
                  marks={priceSliderMarks}
                  disabled={priceRangeOptions.length === 0}
                  valueLabelDisplay="auto"
                  valueLabelFormat={getPriceLabel}
                  onChange={(_e, v) => { const i = Array.isArray(v) ? v[0] : v; setPriceRange(priceSliderOptions[i]?.value || ""); }}
                  sx={{
                    color: teal, height: 4, px: 0,
                    "& .MuiSlider-rail": { opacity: 1, background: alpha(textMain, 0.12) },
                    "& .MuiSlider-track": { border: "none" },
                    "& .MuiSlider-thumb": {
                      width: 16, height: 16, background: white,
                      border: `2.5px solid ${teal}`,
                      boxShadow: `0 1px 4px ${alpha(textMain, 0.18)}`,
                      "&:hover, &.Mui-focusVisible": { boxShadow: `0 0 0 6px ${alpha(teal, 0.15)}` },
                    },
                    "& .MuiSlider-mark": { width: 4, height: 4, borderRadius: "50%", background: alpha(textMain, 0.2) },
                    "& .MuiSlider-markActive": { background: teal },
                    "& .MuiSlider-markLabel": { display: "none" },
                    "& .MuiSlider-valueLabel": { background: textMain, color: white, borderRadius: "7px", fontSize: "11px", fontFamily: font },
                    "&.Mui-disabled": { color: alpha(textMain, 0.2) },
                  }}
                />
                <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${priceSliderOptions.length}, 1fr)`, mt: 0.25 }}>
                  {priceSliderOptions.map((opt, i) => (
                    <Typography key={`${opt.value || "any"}-${i}`} sx={{
                      fontSize: "11px", fontFamily: font,
                      color: selectedPriceIndex === i ? teal : textSub,
                      fontWeight: selectedPriceIndex === i ? 700 : 400,
                      textAlign: i === 0 ? "left" : i === priceSliderOptions.length - 1 ? "right" : "center",
                    }}>
                      {opt.label}
                    </Typography>
                  ))}
                </Box>
              </Box>

              <Select value={region} onChange={handleRegionChange} displayEmpty variant="outlined" sx={selectSx} MenuProps={menuProps}>
                <MenuItem value=""><span style={{ color: textSub }}>All Regions</span></MenuItem>
                {(regionOptions.length > 0 ? regionOptions : [
                  { value: "Canada", label: "Canada" },
                  { value: "United Kingdom", label: "United Kingdom" },
                  { value: "United States", label: "United States" },
                ]).map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </Select>

              <Select value={area} onChange={(e: SelectChangeEvent<string>) => setArea(e.target.value)} displayEmpty variant="outlined" sx={selectSx} MenuProps={menuProps}>
                <MenuItem value=""><span style={{ color: textSub }}>All Areas</span></MenuItem>
                {areaOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </Select>

              <Select value={city} onChange={(e: SelectChangeEvent<string>) => setCity(e.target.value)} disabled={!region} displayEmpty variant="outlined" sx={selectSx} MenuProps={menuProps}>
                <MenuItem value=""><span style={{ color: textSub }}>All Cities</span></MenuItem>
                {cityOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </Select>
            </Box>
          </Collapse>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${border}` }}>
        <Button fullWidth onClick={applyFilters} sx={{
          borderRadius: "10px", py: 1.25, fontSize: "13px", fontWeight: 600,
          fontFamily: font, color: white, textTransform: "none",
          background: teal,
          boxShadow: `0 2px 8px ${alpha(teal, 0.35)}`,
          "&:hover": {
            background: alpha(teal, 0.88),
            boxShadow: `0 4px 14px ${alpha(teal, 0.45)}`,
          },
        }}>
          {loading ? "Searching…" : "Apply Filters"}
        </Button>
      </Box>
    </Box>
    </Box>
  );
};

export default SideFilter;
