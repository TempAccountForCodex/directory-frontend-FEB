import React from "react";
import { Grid, Typography, Box, Pagination, useTheme } from "@mui/material";
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
      <Grid
        container
        spacing={2.1}
        xs={12}
        sm={6}
        md={4}
        sx={{
          display: "flex",
          justifyContent: items.length === 0 ? "center" : "flex-start",
          alignItems: "stretch",
          flexWrap: "wrap",
          flexDirection: "row",
          width: "100%",
        }}
        pt={{ xs: 4, md: 0 }}
        pb={{ xs: 8, md: 12 }}
        // pr={{ xs: 2, sm: "23px" }}
        px={{ xs: 0, sm: "10px" }}
        component="div"
        {...({} as any)}
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
            <Grid
              key={index}
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              sx={{
                display: "flex",
                maxWidth: "32.1%",
              }}
              component="div"
              {...({} as any)}
            >
              {" "}
              <PropertyItemCard
                item={item}
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                handleDeleteItem={(id: string | number) =>
                  handleDeleteItem(id as string)
                }
              />
            </Grid>
          ))
        )}
      </Grid>

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
