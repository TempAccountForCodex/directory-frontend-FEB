import React from "react";
import {
  Typography,
  Box,
  Pagination,
  useTheme,
} from "@mui/material";
import PropertyItemCard from "../Listing/PropertyCardItem";
import type { Place } from "../../../types/place";

/* ---------------- Types ---------------- */
interface PropertyCardProps {
  handleDeleteItem: (id: string) => void;
  items: any[];
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  totalPages: number;
  setItems: React.Dispatch<React.SetStateAction<Place[]>>;
  totalPlaces: number | null;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  handleDeleteItem,
  items,
  setCurrentPage,
  currentPage,
  totalPages,
}) => {
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setCurrentPage(value);
  };
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: { xs: 4, md: 5 },
          justifyContent: items.length === 0 ? "center" : "flex-start",
          alignItems: "stretch",
          width: "100%",
          minWidth: 0,
          pt: { xs: 4, md: 0 },
          pb: { xs: 8, md: 12 },
          pl: { xs: 0, sm: "10px" },
          pr: { xs: 0, sm: "25px" },
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

        }}
      >
        {items.length === 0 ? (
          <Typography
            variant="h6"
            sx={{ mt: 4, color: theme.palette.text.secondary }}
          >
            No Result Found
          </Typography>
        ) : (
          items.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                minWidth: 0,
                width: "100%",
              }}
            >
              <PropertyItemCard
                item={item}
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                handleDeleteItem={(id: string | number) =>
                  handleDeleteItem(id as string)
                }
              />
            </Box>
          ))
        )}
      </Box>

      {totalPages >= 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "60px",
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            shape="rounded"
          />
        </Box>
      )}
    </>
  );
};

export default PropertyCard;
