import DashboardInput from './DashboardInput';

const DashboardDateField = ({
  value = '',
  onChange,
  name,
  label,
  helperText,
  required = false,
  error = false,
  size,
  containerSx,
  sx,
  labelPlacement = 'floating',
  ...props
}) => {
  return (
    <DashboardInput
      fullWidth
      type="date"
      label={label}
      labelPlacement={labelPlacement}
      name={name}
      value={value}
      onChange={onChange}
      helperText={helperText}
      required={required}
      error={error}
      size={size}
      containerSx={containerSx}
      sx={sx}
      InputLabelProps={{ shrink: true }}
      {...props}
    />
  );
};

export default DashboardDateField;
