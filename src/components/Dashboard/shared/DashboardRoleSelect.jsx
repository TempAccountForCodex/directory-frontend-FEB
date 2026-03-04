import { MenuItem } from '@mui/material';
import DashboardSelect from './DashboardSelect';
import { ROLES, ROLE_LABELS } from '../../../constants/roles';

const DashboardRoleSelect = ({
  value,
  onChange,
  name = 'role',
  label = 'Role',
  required = false,
  disabled = false,
  fullWidth = true,
  includeSuperAdmin = false,
  containerSx,
  sx,
}) => {
  return (
    <DashboardSelect
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      containerSx={containerSx}
      sx={sx}
    >
      {includeSuperAdmin && <MenuItem value={ROLES.SUPER_ADMIN}>{ROLE_LABELS[ROLES.SUPER_ADMIN]}</MenuItem>}
      <MenuItem value={ROLES.ADMIN}>{ROLE_LABELS[ROLES.ADMIN]}</MenuItem>
      <MenuItem value={ROLES.CONTENT_CREATOR}>{ROLE_LABELS[ROLES.CONTENT_CREATOR]}</MenuItem>
      <MenuItem value={ROLES.USER}>{ROLE_LABELS[ROLES.USER]}</MenuItem>
    </DashboardSelect>
  );
};

export default DashboardRoleSelect;
