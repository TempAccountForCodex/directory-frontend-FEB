import React from "react";
import { Box, Grid } from "@mui/material";
import { data } from "../Listing/data.ts";
import TitleHeading from "../../UI/TitleHeading";
import PropertyItemCard from "../Listing/PropertyCardItem";

/* ---------------- Types ---------------- */
interface ListingItem {
  category: string | string[];
  slug: string;
  [key: string]: any;
}

interface RealtedBusinessCardProps {
  listingforCategory: ListingItem;
  listing: ListingItem;
}

const RealtedBusinessCard: React.FC<RealtedBusinessCardProps> = ({
  listingforCategory,
  listing,
}) => {
  const matchedCategories = data.filter((item) => {
    // Ensure both item.category and listingforCategory.category are defined
    if (
      typeof item.category === "undefined" ||
      typeof listingforCategory.category === "undefined"
    ) {
      return false;
    }

    if (!Array.isArray(listingforCategory.category)) {
      return (
        item.category === listingforCategory.category &&
        item.slug !== listing.slug
      );
    } else {
      return (
        (listingforCategory.category as string[]).some((category) =>
          Array.isArray(item.category)
            ? item.category.includes(category)
            : item.category === category,
        ) && item.slug !== listing.slug
      );
    }
  });

  if (matchedCategories.length === 0) {
    return <Box component="section"></Box>;
  }

  return (
    <Box component="section">
      <TitleHeading text="Related Businesses" pt={4} mb={3} />

      <Grid container spacing={2}>
        {matchedCategories.slice(0, 2).map((item, index) => (
          <PropertyItemCard
            key={index}
            item={item}
            handleDeleteItem={function (id: string | number): void {
              throw new Error("Function not implemented.");
            }}
            totalPages={0}
            currentPage={0}
            setCurrentPage={function (
              value: React.SetStateAction<number>,
            ): void {
              throw new Error("Function not implemented.");
            }}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default RealtedBusinessCard;
