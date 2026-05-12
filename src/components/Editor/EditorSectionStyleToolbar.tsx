import React from 'react';
import {
  Box,
  ButtonBase,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Popover,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { Image as ImageIcon, LayoutPanelTop, Palette, PaintBucket, Upload, X } from 'lucide-react';
import { apiClient } from '../../api/client';

export type EditorSectionStyle = {
  backgroundType?: 'none' | 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  backgroundImageUrl?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  paddingTop?: string;
  paddingBottom?: string;
  marginTop?: string;
  marginBottom?: string;
};

export type SectionSelection = {
  blockId: string;
  label: string;
};

type Props = {
  selection: SectionSelection | null;
  value: EditorSectionStyle;
  disabled?: boolean;
  onStyleChange: (patch: Partial<EditorSectionStyle>) => void;
  containerSx?: SxProps<Theme>;
};

const SPACING_OPTIONS = ['0px', '16px', '24px', '32px', '48px', '64px', '96px'];
const BRAND_COLOR_SWATCHES = [
  '#ffffff',
  '#f8fafc',
  '#e5e7eb',
  '#dbeafe',
  '#111827',
  '#5b7cfa',
  '#ff6b1a',
  '#0f766e',
  '#f8d95b',
  'transparent',
];

const getSwatchBackground = (swatch: string) =>
  swatch === 'transparent'
    ? 'linear-gradient(135deg, transparent 46%, #ef4444 47%, #ef4444 53%, transparent 54%), #ffffff'
    : swatch;

const EditorSectionStyleToolbar: React.FC<Props> = ({
  selection,
  value,
  disabled = false,
  onStyleChange,
  containerSx,
}) => {
  const effectiveDisabled = disabled || !selection;
  const resolvedValue = value || {};
  const [backgroundAnchorEl, setBackgroundAnchorEl] = React.useState<HTMLElement | null>(null);
  const [backgroundTab, setBackgroundTab] = React.useState<'color' | 'image'>('color');
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const isBackgroundPopoverOpen = Boolean(backgroundAnchorEl);

  const handleOpenBackgroundPopover = (event: React.MouseEvent<HTMLElement>) => {
    if (effectiveDisabled) return;
    setBackgroundAnchorEl(event.currentTarget);
  };

  const handleCloseBackgroundPopover = () => {
    setBackgroundAnchorEl(null);
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await apiClient.post('/upload/image', formData);
      onStyleChange({
        backgroundType: 'image',
        backgroundImageUrl: response.data.url,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      });
      setBackgroundTab('image');
    } catch {
      // Keep the current style unchanged on upload failure.
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: { xs: 1, sm: 1.5 },
        py: 1,
        borderRadius: 3,
        border: '1px solid rgba(15,23,42,0.08)',
        backgroundColor: 'rgba(255,255,255,0.94)',
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(148,163,184,0.4)',
          borderRadius: 999,
        },
        ...containerSx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: effectiveDisabled ? '#94a3b8' : '#334155',
            whiteSpace: 'nowrap',
          }}
        >
          {selection ? `Editing Section: ${selection.label}` : 'Select a section on canvas'}
        </Typography>
      </Box>

      <Divider flexItem orientation="vertical" />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <ButtonBase
          disabled={effectiveDisabled}
          onClick={handleOpenBackgroundPopover}
          sx={{
            height: 36,
            px: 1.25,
            gap: 0.8,
            borderRadius: 2,
            border: '1px solid rgba(15,23,42,0.08)',
            backgroundColor: '#fff',
            flexShrink: 0,
          }}
        >
          <PaintBucket size={15} color={effectiveDisabled ? '#94a3b8' : '#475569'} />
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>
            Replace Background
          </Typography>
        </ButtonBase>
      </Box>

      <Popover
        open={isBackgroundPopoverOpen}
        anchorEl={backgroundAnchorEl}
        onClose={handleCloseBackgroundPopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 272,
            p: 1.5,
            borderRadius: 3,
            border: '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0 24px 60px rgba(15,23,42,0.14)',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
          <IconButton
            size="small"
            onClick={() => setBackgroundTab('color')}
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              border: backgroundTab === 'color' ? '2px solid #9db4ff' : '1px solid rgba(15,23,42,0.08)',
              backgroundColor: '#fff',
            }}
          >
            <Palette size={15} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setBackgroundTab('image')}
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              border: backgroundTab === 'image' ? '2px solid #9db4ff' : '1px solid rgba(15,23,42,0.08)',
              backgroundColor: '#fff',
            }}
          >
            <ImageIcon size={15} />
          </IconButton>
        </Box>

        <Tabs
          value={backgroundTab}
          onChange={(_, nextValue) => setBackgroundTab(nextValue)}
          sx={{
            minHeight: 40,
            mb: 1.2,
            p: 0.4,
            borderRadius: 2.5,
            bgcolor: 'rgba(15,23,42,0.05)',
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              minHeight: 32,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              color: '#475569',
            },
            '& .Mui-selected': {
              bgcolor: '#ffffff',
              color: '#111827 !important',
              boxShadow: '0 2px 8px rgba(15,23,42,0.08)',
            },
          }}
        >
          <Tab value="color" label="Brand" />
          <Tab value="image" label="Image" />
        </Tabs>

        {backgroundTab === 'color' ? (
          <Box>
            <Typography sx={{ mb: 1, fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
              Color palette
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 1 }}>
              {BRAND_COLOR_SWATCHES.map((swatch) => {
                const isActive = (resolvedValue.backgroundColor || 'transparent') === swatch;
                return (
                  <ButtonBase
                    key={swatch}
                    disabled={effectiveDisabled}
                    onClick={() => onStyleChange({
                backgroundType: swatch === 'transparent' ? 'none' : 'solid',
                backgroundColor: swatch,
                backgroundImageUrl: '',
              })}
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      border: isActive
                        ? '2px solid rgba(15,23,42,0.9)'
                        : '1px solid rgba(15,23,42,0.12)',
                      background: getSwatchBackground(swatch),
                      boxShadow: isActive ? '0 0 0 3px rgba(59,130,246,0.16)' : 'none',
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        ) : (
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                void handleImageUpload(event.target.files?.[0] || null);
              }}
            />

            {resolvedValue.backgroundImageUrl ? (
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  border: '1px solid rgba(15,23,42,0.08)',
                  height: 120,
                  backgroundImage: `url(${resolvedValue.backgroundImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  mb: 1.2,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => onStyleChange({
                    backgroundType:
                      resolvedValue.backgroundColor && resolvedValue.backgroundColor !== 'transparent'
                        ? 'solid'
                        : 'none',
                    backgroundImageUrl: '',
                  })}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255,255,255,0.9)',
                  }}
                >
                  <X size={14} />
                </IconButton>
              </Box>
            ) : (
              <ButtonBase
                disabled={effectiveDisabled || isUploading}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  width: '100%',
                  height: 120,
                  borderRadius: 2.5,
                  border: '1px dashed rgba(15,23,42,0.35)',
                  bgcolor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  mb: 1.2,
                }}
              >
                {isUploading ? <CircularProgress size={24} /> : <Upload size={22} />}
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Upload image
                </Typography>
              </ButtonBase>
            )}

            {resolvedValue.backgroundImageUrl && (
              <ButtonBase
                disabled={effectiveDisabled || isUploading}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  width: '100%',
                  height: 42,
                  borderRadius: 2,
                  border: '1px solid rgba(15,23,42,0.08)',
                  backgroundColor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                }}
              >
                {isUploading ? <CircularProgress size={18} /> : <Upload size={16} />}
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Replace image
                </Typography>
              </ButtonBase>
            )}
          </Box>
        )}
      </Popover>

      <Divider flexItem orientation="vertical" />

      {[
        ['paddingTop', 'Padding Top'],
        ['paddingBottom', 'Padding Bottom'],
        ['marginTop', 'Margin Top'],
        ['marginBottom', 'Margin Bottom'],
      ].map(([styleKey, label]) => (
        <FormControl key={styleKey} size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
          <Select
            value={resolvedValue[styleKey as keyof EditorSectionStyle] || '0px'}
            disabled={effectiveDisabled}
            onChange={(event) => onStyleChange({ [styleKey]: event.target.value })}
            displayEmpty
            sx={{ height: 36, borderRadius: 2, backgroundColor: '#fff' }}
            startAdornment={
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.75 }}>
                <LayoutPanelTop size={14} color="#64748b" />
              </Box>
            }
          >
            {SPACING_OPTIONS.map((spacing) => (
              <MenuItem key={spacing} value={spacing}>
                {label}: {spacing}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}

      <Divider flexItem orientation="vertical" />

      <TextField
        size="small"
        disabled={effectiveDisabled}
        label="Custom BG"
        value={resolvedValue.backgroundColor || ''}
        onChange={(event) => onStyleChange({
          backgroundType: event.target.value ? 'solid' : 'none',
          backgroundColor: event.target.value,
          backgroundImageUrl: '',
        })}
        placeholder="#000000"
        sx={{
          width: 124,
          color: 'black',
          flexShrink: 0,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#fff',
          },
        }}
      />
    </Box>
  );
};

export default EditorSectionStyleToolbar;
