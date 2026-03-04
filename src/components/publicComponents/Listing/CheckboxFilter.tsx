import React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTheme } from "@mui/material";

/* ---------------- Types ---------------- */
interface CheckboxFilterProps {
  label: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
}

const CheckboxFilter: React.FC<CheckboxFilterProps> = ({
  label,
  checked,
  onChange,
  name,
}) => {
  const theme = useTheme();
  return (
    <FormControlLabel
      sx={{
        color: (theme.palette.primary as any).hero,
        display: "block",
      }}
      control={
        <Checkbox
          size="small"
          checked={checked}
          onChange={onChange}
          name={name}
        />
      }
      label={<span style={{ fontSize: "13px" }}>{label}</span>} // Adjust the fontSize as needed
    />
  );
};

export default CheckboxFilter;
