import DashboardInput from './DashboardInput';

const InsightPreviewField = ({
  value = '',
  onChange,
  name = 'content',
  label = 'Short Preview (Content)',
  minChars = 10,
  maxChars = 1000,
  rows = 2,
  error = false,
  errorText,
  helperText,
  ...props
}) => {
  const count = value?.length ?? 0;
  const defaultHelper = `Brief description shown on cards (${minChars}-${maxChars} characters) - Current: ${count}`;
  const resolvedHelper = error ? errorText || defaultHelper : helperText || defaultHelper;

  return (
    <DashboardInput
      fullWidth
      label={label}
      labelPlacement="floating"
      name={name}
      value={value}
      onChange={onChange}
      multiline
      rows={rows}
      error={error}
      helperText={resolvedHelper}
      {...props}
    />
  );
};

export default InsightPreviewField;
