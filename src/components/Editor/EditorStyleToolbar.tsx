import React from 'react';
import {
  ButtonBase,
  Box,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Popover,
  Select,
  Slider,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  Strikethrough,
  Pipette,
  Type,
  Underline,
} from 'lucide-react';

export type EditorTextStyle = {
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  href?: string;
};

export type EditableSelection = {
  blockId: string;
  fieldPath: string;
  label: string;
  editType?: 'single' | 'multi';
};

type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'align-left'
  | 'align-center'
  | 'align-right';

type Props = {
  selection: EditableSelection | null;
  value: EditorTextStyle;
  disabled?: boolean;
  onStyleChange: (patch: Partial<EditorTextStyle>) => void;
  containerSx?: SxProps<Theme>;
};

const FONT_OPTIONS = [
  { value: '"Inter", "Segoe UI", sans-serif', label: 'Inter' },
  { value: '"Poppins", "Inter", sans-serif', label: 'Poppins' },
  { value: '"DM Sans", "Inter", sans-serif', label: 'DM Sans' },
  { value: '"Montserrat", "Inter", sans-serif', label: 'Montserrat' },
  { value: '"Plus Jakarta Sans", "Inter", sans-serif', label: 'Jakarta' },
  { value: '"Manrope", "Inter", sans-serif', label: 'Manrope' },
  { value: '"Playfair Display", "Times New Roman", serif', label: 'Playfair' },
  { value: '"Lora", Georgia, serif', label: 'Lora' },
  { value: '"Merriweather", Georgia, serif', label: 'Merriweather' },
  { value: '"Space Mono", monospace', label: 'Mono' },
];

const SIZE_OPTIONS = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];

const BRAND_COLOR_SWATCHES = [
  '#f8fafc',
  '#e5e7eb',
  '#9ca3af',
  '#4b5563',
  '#020617',
  '#5b7cfa',
  '#ff6b1a',
  '#0f1f63',
  '#f8d95b',
  'transparent',
];

const hasDecoration = (value: string | undefined, token: string) =>
  (value || '').split(/\s+/).includes(token);

const toggleDecoration = (value: string | undefined, token: string) => {
  const next = new Set((value || '').split(/\s+/).filter(Boolean));

  if (next.has(token)) {
    next.delete(token);
  } else {
    next.add(token);
  }

  return Array.from(next).join(' ') || 'none';
};

const actionButtonSx = (active: boolean, disabled: boolean | undefined): SxProps<Theme> => ({
  width: 34,
  height: 34,
  borderRadius: 2,
  border: '1px solid rgba(15,23,42,0.08)',
  backgroundColor: active ? 'rgba(17,24,39,0.08)' : '#fff',
  color: active ? '#111827' : '#475569',
  '&:hover': disabled
    ? {}
    : {
        backgroundColor: active ? 'rgba(17,24,39,0.12)' : 'rgba(15,23,42,0.04)',
      },
});

const normalizeHex = (value: string | undefined) => {
  if (!value) return '#111827';
  if (value === 'transparent') return 'transparent';
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ? value : '#111827';
};

const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex);

  if (normalized === 'transparent') {
    return { r: 255, g: 255, b: 255 };
  }

  const safe =
    normalized.length === 4
      ? `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
      : normalized.slice(0, 7);

  return {
    r: parseInt(safe.slice(1, 3), 16),
    g: parseInt(safe.slice(3, 5), 16),
    b: parseInt(safe.slice(5, 7), 16),
  };
};

const normalizeUrl = (url: string) => {
  const trimmed = url.trim();

  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const EditorStyleToolbar: React.FC<Props> = ({
  selection,
  value,
  disabled = false,
  onStyleChange,
  containerSx,
}) => {
  const resolvedValue = value || {};
  const effectiveDisabled = disabled || !selection;

  const [colorAnchorEl, setColorAnchorEl] = React.useState<HTMLElement | null>(null);
  const [colorTab, setColorTab] = React.useState<'brand' | 'custom'>('brand');

  const [linkAnchorEl, setLinkAnchorEl] = React.useState<HTMLElement | null>(null);
  const [linkValue, setLinkValue] = React.useState('');

  const resolvedColor = normalizeHex(resolvedValue.color);
  const rgb = hexToRgb(resolvedColor);

  const colorPickerOpen = Boolean(colorAnchorEl);
  const linkPopoverOpen = Boolean(linkAnchorEl);

  const handleAction = (action: ToolbarAction) => {
    if (effectiveDisabled) return;

    switch (action) {
      case 'bold':
        onStyleChange({
          fontWeight: String(resolvedValue.fontWeight || '400') === '700' ? '400' : '700',
        });
        return;

      case 'italic':
        onStyleChange({
          fontStyle: resolvedValue.fontStyle === 'italic' ? 'normal' : 'italic',
        });
        return;

      case 'underline':
        onStyleChange({
          textDecoration: toggleDecoration(resolvedValue.textDecoration, 'underline'),
        });
        return;

      case 'strikethrough':
        onStyleChange({
          textDecoration: toggleDecoration(resolvedValue.textDecoration, 'line-through'),
        });
        return;

      case 'align-left':
        onStyleChange({ textAlign: 'left' });
        return;

      case 'align-center':
        onStyleChange({ textAlign: 'center' });
        return;

      case 'align-right':
        onStyleChange({ textAlign: 'right' });
        return;

      default:
        return;
    }
  };

  const handleColorButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    if (effectiveDisabled) return;
    setColorAnchorEl(event.currentTarget);
  };

  const handleColorClose = () => {
    setColorAnchorEl(null);
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', nextValue: string) => {
    const numeric = Math.max(0, Math.min(255, Number(nextValue) || 0));
    const nextRgb = { ...rgb, [channel]: numeric };

    const nextHex = `#${nextRgb.r.toString(16).padStart(2, '0')}${nextRgb.g
      .toString(16)
      .padStart(2, '0')}${nextRgb.b.toString(16).padStart(2, '0')}`;

    onStyleChange({ color: nextHex });
  };

  const handleLinkButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    if (effectiveDisabled) return;

    setLinkValue(resolvedValue.href || '');
    setLinkAnchorEl(event.currentTarget);
  };

  const handleLinkClose = () => {
    setLinkAnchorEl(null);
  };

  const handleApplyLink = () => {
    const nextUrl = normalizeUrl(linkValue);

    onStyleChange({
      href: nextUrl || undefined,
    });

    setLinkAnchorEl(null);
  };

  const handleRemoveLink = () => {
    onStyleChange({
      href: undefined,
    });

    setLinkValue('');
    setLinkAnchorEl(null);
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
          {selection ? `Editing: ${selection.label}` : 'Select text on canvas'}
        </Typography>
      </Box>

      <Divider flexItem orientation="vertical" />

      <FormControl size="small" sx={{ minWidth: 152, flexShrink: 0 }}>
        <Select
          value={resolvedValue.fontFamily || FONT_OPTIONS[0].value}
          disabled={effectiveDisabled}
          onChange={(event) => onStyleChange({ fontFamily: event.target.value })}
          displayEmpty
          sx={{ height: 36, borderRadius: 2, backgroundColor: '#fff' }}
        >
          {FONT_OPTIONS.map((font) => (
            <MenuItem key={font.value} value={font.value}>
              {font.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 84, flexShrink: 0 }}>
        <Select
          value={resolvedValue.fontSize || '16px'}
          disabled={effectiveDisabled}
          onChange={(event) => onStyleChange({ fontSize: event.target.value })}
          sx={{ height: 36, borderRadius: 2, backgroundColor: '#fff' }}
        >
          {SIZE_OPTIONS.map((size) => (
            <MenuItem key={size} value={size}>
              {size.replace('px', '')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ButtonBase
        disabled={effectiveDisabled}
        onClick={handleColorButtonClick}
        sx={{
          height: 36,
          px: 1,
          gap: 0.8,
          borderRadius: 2,
          border: '1px solid rgba(15,23,42,0.08)',
          backgroundColor: '#fff',
          flexShrink: 0,
        }}
      >
        <Type size={14} />
        <Box
          sx={{
            width: 28,
            height: 14,
            borderRadius: 999,
            border: '1px solid rgba(15,23,42,0.14)',
            background:
              resolvedColor === 'transparent'
                ? 'linear-gradient(135deg, transparent 46%, #ef4444 47%, #ef4444 53%, transparent 54%), #ffffff'
                : resolvedColor,
          }}
        />
      </ButtonBase>

      <Popover
        open={colorPickerOpen}
        anchorEl={colorAnchorEl}
        onClose={handleColorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 292,
            p: 1.5,
            borderRadius: 3,
            border: '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0 24px 60px rgba(15,23,42,0.14)',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
            Text color
          </Typography>

          <Box
            sx={{
              px: 1,
              py: 0.35,
              borderRadius: 999,
              bgcolor: 'rgba(15,23,42,0.05)',
              fontSize: '0.72rem',
              color: '#475569',
              fontFamily: 'monospace',
            }}
          >
            {resolvedColor === 'transparent' ? 'NONE' : resolvedColor.toUpperCase()}
          </Box>
        </Box>

        <Tabs
          value={colorTab}
          onChange={(_, nextValue) => setColorTab(nextValue)}
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
          <Tab value="brand" label="Brand" />
          <Tab value="custom" label="Custom" />
        </Tabs>

        {colorTab === 'brand' ? (
          <Box>
            <Typography sx={{ mb: 1, fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
              Quick palette
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                gap: 1,
              }}
            >
              {BRAND_COLOR_SWATCHES.map((swatch) => {
                const isActive = resolvedColor === swatch;

                return (
                  <ButtonBase
                    key={swatch}
                    onClick={() => onStyleChange({ color: swatch })}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      border: isActive
                        ? '2px solid rgba(15,23,42,0.9)'
                        : '1px solid rgba(15,23,42,0.12)',
                      background:
                        swatch === 'transparent'
                          ? 'linear-gradient(135deg, transparent 46%, #ef4444 47%, #ef4444 53%, transparent 54%), #ffffff'
                          : swatch,
                      boxShadow: isActive ? '0 0 0 3px rgba(59,130,246,0.16)' : 'none',
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                position: 'relative',
                height: 136,
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '1px solid rgba(15,23,42,0.08)',
                background: `linear-gradient(180deg, #ffffff 0%, ${
                  resolvedColor === 'transparent' ? '#111827' : resolvedColor
                } 100%)`,
                mb: 1.2,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, #000000 0%, transparent 100%)',
                  mixBlendMode: 'multiply',
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  left: `${(rgb.r / 255) * 100}%`,
                  top: `${100 - (rgb.b / 255) * 100}%`,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 1px rgba(15,23,42,0.35)',
                  transform: 'translate(-50%, -50%)',
                }}
              />

              <input
                type="color"
                value={resolvedColor === 'transparent' ? '#111827' : resolvedColor.slice(0, 7)}
                onChange={(event) => onStyleChange({ color: event.target.value })}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
              <Pipette size={14} color="#475569" />

              <Slider
                value={Math.round((rgb.r / 255) * 100)}
                onChange={(_, nextValue) => {
                  const value = Array.isArray(nextValue) ? nextValue[0] : nextValue;
                  handleRgbChange('r', String(Math.round(value * 2.55)));
                }}
                sx={{
                  color: resolvedColor === 'transparent' ? '#111827' : resolvedColor,
                  '& .MuiSlider-rail': {
                    opacity: 1,
                    background:
                      'linear-gradient(90deg, #ff0040 0%, #5b7cfa 30%, #00c853 65%, #ffb300 85%, #ff5a00 100%)',
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
              {(['r', 'g', 'b'] as const).map((channel) => (
                <TextField
                  key={channel}
                  size="small"
                  value={rgb[channel]}
                  onChange={(event) => handleRgbChange(channel, event.target.value)}
                  inputProps={{
                    inputMode: 'numeric',
                    min: 0,
                    max: 255,
                    style: { textAlign: 'center' },
                  }}
                  label={channel.toUpperCase()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#fff',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Popover>

      <Divider flexItem orientation="vertical" />

      <Tooltip title="Bold">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction('bold')}
            sx={actionButtonSx(String(resolvedValue.fontWeight || '400') === '700', effectiveDisabled)}
          >
            <Bold size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Italic">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction('italic')}
            sx={actionButtonSx(resolvedValue.fontStyle === 'italic', effectiveDisabled)}
          >
            <Italic size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Underline">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction('underline')}
            sx={actionButtonSx(hasDecoration(resolvedValue.textDecoration, 'underline'), effectiveDisabled)}
          >
            <Underline size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Strikethrough">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction('strikethrough')}
            sx={actionButtonSx(
              hasDecoration(resolvedValue.textDecoration, 'line-through'),
              effectiveDisabled
            )}
          >
            <Strikethrough size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Divider flexItem orientation="vertical" />

      <Tooltip title="Align left">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction('align-left')}
            sx={actionButtonSx((resolvedValue.textAlign || 'left') === 'left', effectiveDisabled)}
          >
            <AlignLeft size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Align center">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction('align-center')}
            sx={actionButtonSx(resolvedValue.textAlign === 'center', effectiveDisabled)}
          >
            <AlignCenter size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Align right">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction('align-right')}
            sx={actionButtonSx(resolvedValue.textAlign === 'right', effectiveDisabled)}
          >
            <AlignRight size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Divider flexItem orientation="vertical" />

      <Tooltip title={resolvedValue.href ? 'Edit link' : 'Add link'}>
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={handleLinkButtonClick}
            sx={actionButtonSx(Boolean(resolvedValue.href), effectiveDisabled)}
          >
            <Link2 size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Popover
        open={linkPopoverOpen}
        anchorEl={linkAnchorEl}
        onClose={handleLinkClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 320,
            p: 1.5,
            borderRadius: 3,
            border: '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0 24px 60px rgba(15,23,42,0.14)',
            background: '#ffffff',
          },
        }}
      >
        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#111827', mb: 1 }}>
          {resolvedValue.href ? 'Edit link' : 'Add link'}
        </Typography>

        <TextField
          fullWidth
          size="small"
          label="URL"
          placeholder="https://example.com"
          value={linkValue}
          onChange={(event) => setLinkValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleApplyLink();
            }
          }}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: '#fff',
            },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <ButtonBase
            onClick={handleRemoveLink}
            disabled={!resolvedValue.href && !linkValue}
            sx={{
              px: 1.5,
              py: 0.8,
              borderRadius: 2,
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#ef4444',
              backgroundColor: 'rgba(239,68,68,0.08)',
              opacity: !resolvedValue.href && !linkValue ? 0.5 : 1,
            }}
          >
            Remove
          </ButtonBase>

          <ButtonBase
            onClick={handleApplyLink}
            sx={{
              px: 1.5,
              py: 0.8,
              borderRadius: 2,
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#ffffff',
              backgroundColor: '#111827',
            }}
          >
            Apply link
          </ButtonBase>
        </Box>
      </Popover>
    </Box>
  );
};

export default EditorStyleToolbar;