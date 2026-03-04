import { Avatar, Box, ButtonBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

const MiniSideNav = ({ profile, sections, activeItem, onChange }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const resolvedSections = sections || [];

  const handleSelect = (id) => {
    if (onChange) {
      onChange(id);
    }
  };

  return (
    <Box
      sx={{
        width: { xs: '100%', lg: 240 },
        position: { lg: 'sticky' },
        top: { lg: 0 },
        alignSelf: 'flex-start',
      }}
    >
      {profile && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar
            src={profile.avatarSrc}
            alt={profile.name || 'User'}
            imgProps={{ referrerPolicy: 'no-referrer' }}
            sx={{
              width: 46,
              height: 46,
              border: `2px solid ${alpha(colors.text, 0.2)}`,
              boxShadow: `0 6px 16px ${alpha(colors.darker, 0.35)}`,
            }}
          />
          <Box>
            <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1rem' }}>
              {profile.name || 'Account'}
            </Typography>
            {profile.email && (
              <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                {profile.email}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {resolvedSections.map((section) => (
          <Box key={section.title}>
            <Typography
              sx={{
                color: colors.textSecondary,
                fontSize: '0.79rem',
                fontFamily: 'Questrial, sans-serif',
                mb: 1.4,
              }}
            >
              {section.title}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              {section.items.map((item) => {
                const isActive = item.id === activeItem;
                const ItemIcon = item.icon;

                return (
                  <ButtonBase
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    disableRipple
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      gap: 1.5,
                      px: 1.6,
                      py: 0.9,
                      borderRadius: '10px',
                      background: isActive ? alpha(colors.text, 0.15) : 'transparent',
                      color: isActive ? colors.text : colors.textSecondary,
                      fontWeight: isActive ? 600 : 500,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: colors.text,
                        background: isActive ? alpha(colors.text, 0.24) : alpha(colors.text, 0.09),
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
                      {ItemIcon ? <ItemIcon size={18} strokeWidth={1.8} /> : null}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 'inherit',
                        color: 'inherit',
                        fontFamily: 'Questrial, sans-serif',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MiniSideNav;
