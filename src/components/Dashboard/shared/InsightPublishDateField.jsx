import DashboardDateField from './DashboardDateField';

const InsightPublishDateField = ({
  value = '',
  onChange,
  name = 'publishDate',
  label = 'Publish Date',
  helperText = 'Select when this insight should be published',
  required = false,
  error = false,
  ...props
}) => {
  return (
    <DashboardDateField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      helperText={helperText}
      required={required}
      error={error}
      {...props}
    />
  );
};

export default InsightPublishDateField;
