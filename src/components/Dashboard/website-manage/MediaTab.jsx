import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiClient } from '../../../api/client';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Copy,
  ExternalLink,
  FolderSync,
  ImagePlus,
  Images,
  Layers3,
  Upload,
} from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import {
  DashboardCard,
  DashboardMetricCard,
  DashboardTooltip,
  EmptyState,
} from '../shared';
import DashboardActionButton from '../shared/DashboardActionButton';
import DashboardGradientButton from '../shared/DashboardGradientButton';
import DashboardInput from '../shared/DashboardInput';

const IMAGE_FIELD_PATTERN = /(image|img|photo|picture|logo|icon|thumbnail|hero|cover|banner|background|favicon|gallery|media|avatar)/i;
const IMAGE_URL_PATTERN = /^data:image\/|^blob:|^https?:\/\/.+\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)(\?.*)?$|^\/.+\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)(\?.*)?$|^.+\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)(\?.*)?$/i;

const WEBSITE_IMAGE_FIELDS = [
  { key: 'logoUrl', label: 'Website Logo' },
  { key: 'faviconUrl', label: 'Favicon' },
  { key: 'thumbnailUrl', label: 'Website Thumbnail' },
  { key: 'heroBannerUrl', label: 'Hero Banner' },
];

function isImageUrl(value) {
  return typeof value === 'string' && IMAGE_URL_PATTERN.test(value.trim());
}

function toAbsoluteUrl(value) {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^(data:image\/|blob:|https?:\/\/)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) {
    return `${window.location.origin}${trimmed}`;
  }
  return trimmed;
}

function sanitizeFileName(url, fallback = 'Image') {
  try {
    const last = url.split('/').pop() || fallback;
    return decodeURIComponent(last.split('?')[0] || fallback);
  } catch {
    return fallback;
  }
}

function extractBlocksPayload(responseData) {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.data?.blocks)) return responseData.data.blocks;
  if (Array.isArray(responseData?.blocks)) return responseData.blocks;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
}

function extractWebsiteMediaPayload(responseData) {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.data?.media)) return responseData.data.media;
  if (Array.isArray(responseData?.media)) return responseData.media;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
}

function mapWebsiteMediaItem(item, fallbackName = 'Uploaded Asset') {
  const rawUrl =
    item?.url ||
    item?.imageUrl ||
    item?.fileUrl ||
    item?.path ||
    item?.src;

  const normalizedUrl = toAbsoluteUrl(rawUrl);
  if (!normalizedUrl) return null;

  return {
    id: String(item?.id || normalizedUrl),
    url: normalizedUrl,
    name:
      item?.name ||
      item?.fileName ||
      item?.originalName ||
      sanitizeFileName(normalizedUrl, fallbackName),
    sourceType: item?.sourceType || 'Uploaded Asset',
    pages: Array.isArray(item?.pages) ? item.pages : [],
    blocks: Array.isArray(item?.blocks) ? item.blocks : [],
  };
}

function createCollector() {
  const seen = new Map();

  const push = ({ url, name, sourceType, pageTitle, blockType }) => {
    const normalizedUrl = toAbsoluteUrl(url);
    if (!normalizedUrl || !isImageUrl(normalizedUrl)) return;

    const existing = seen.get(normalizedUrl);
    if (existing) {
      if (pageTitle) existing.pages.add(pageTitle);
      if (blockType) existing.blocks.add(blockType);
      return;
    }

    seen.set(normalizedUrl, {
      id: normalizedUrl,
      url: normalizedUrl,
      name: name || sanitizeFileName(normalizedUrl),
      sourceType,
      pages: new Set(pageTitle ? [pageTitle] : []),
      blocks: new Set(blockType ? [blockType] : []),
    });
  };

  const toItems = () =>
    Array.from(seen.values()).map((item) => ({
      ...item,
      pages: Array.from(item.pages),
      blocks: Array.from(item.blocks),
    }));

  return { push, toItems };
}

function walkForImages(value, context, collector, currentKey = '') {
  if (typeof value === 'string') {
    if (isImageUrl(value) || IMAGE_FIELD_PATTERN.test(currentKey)) {
      collector.push({
        url: value,
        name: context.name,
        sourceType: context.sourceType,
        pageTitle: context.pageTitle,
        blockType: context.blockType,
      });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => walkForImages(item, context, collector, currentKey));
    return;
  }

  if (!value || typeof value !== 'object') return;

  Object.entries(value).forEach(([key, nested]) => {
    walkForImages(nested, context, collector, key);
  });
}

function buildMediaItems(website, pages, pageBlocks) {
  const collector = createCollector();

  WEBSITE_IMAGE_FIELDS.forEach(({ key, label }) => {
    if (website?.[key]) {
      collector.push({
        url: website[key],
        name: label,
        sourceType: 'Website Asset',
      });
    }
  });

  pages.forEach((page) => {
    const blocks = pageBlocks.get(page.id) || [];
    blocks.forEach((block, index) => {
      walkForImages(
        block,
        {
          name: `${page.title || 'Page'} Asset ${index + 1}`,
          sourceType: 'Page Content',
          pageTitle: page.title || 'Untitled Page',
          blockType: block?.type || block?.blockType || 'CONTENT_BLOCK',
        },
        collector
      );
    });
  });

  return collector
    .toItems()
    .sort((a, b) => a.name.localeCompare(b.name));
}

function mergeMediaItems(primaryItems, secondaryItems) {
  const merged = new Map();

  [...primaryItems, ...secondaryItems].forEach((item) => {
    if (!item?.url) return;
    const key = item.url;
    if (!merged.has(key)) {
      merged.set(key, item);
      return;
    }

    const current = merged.get(key);
    merged.set(key, {
      ...current,
      ...item,
      pages: Array.from(new Set([...(current.pages || []), ...(item.pages || [])])),
      blocks: Array.from(new Set([...(current.blocks || []), ...(item.blocks || [])])),
    });
  });

  return Array.from(merged.values());
}

const MediaTab = memo(({ website, websiteId }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const fileInputRef = useRef(null);

  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const loadMedia = useCallback(async ({ silent = false } = {}) => {
    if (!websiteId) return;

    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const mediaResponse = await apiClient.get(`/websites/${websiteId}/media`);
      const pagesResponse = await apiClient.get(`/websites/${websiteId}/pages`);
      const pages = pagesResponse.data?.data || pagesResponse.data?.pages || [];

      const blockResponses = await Promise.all(
        pages.map(async (page) => {
          const response = await apiClient.get(`/pages/${page.id}/blocks`);
          return [page.id, extractBlocksPayload(response.data)];
        })
      );

      const pageBlocks = new Map(blockResponses);
      const discovered = buildMediaItems(website, pages, pageBlocks);
      const persistedMedia = extractWebsiteMediaPayload(mediaResponse.data)
        .map((item) => mapWebsiteMediaItem(item))
        .filter(Boolean);

      setMediaItems(mergeMediaItems(persistedMedia, discovered));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load website media.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [website, websiteId]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const filteredMedia = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return mediaItems;

    return mediaItems.filter((item) => {
      const haystack = [
        item.name,
        item.url,
        item.sourceType,
        item.pages.join(' '),
        item.blocks.join(' '),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [mediaItems, search]);

  const metrics = useMemo(() => {
    const pageCount = new Set(mediaItems.flatMap((item) => item.pages)).size;
    const websiteAssetCount = mediaItems.filter((item) => item.sourceType === 'Website Asset').length;
    return {
      total: mediaItems.length,
      pagesUsingMedia: pageCount,
      websiteAssets: websiteAssetCount,
    };
  }, [mediaItems]);

  const handleCopy = useCallback(async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      window.setTimeout(() => {
        setCopiedUrl((current) => (current === url ? '' : current));
      }, 1600);
    } catch {
      setUploadError('Could not copy image URL.');
    }
  }, [websiteId]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUploadChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post(`/websites/${websiteId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedItem =
        mapWebsiteMediaItem(response.data?.data, file.name) ||
        mapWebsiteMediaItem(response.data, file.name);

      if (!uploadedItem) {
        throw new Error('Upload response missing image URL.');
      }

      setMediaItems((prev) => {
        if (prev.some((item) => item.url === uploadedItem.url)) return prev;
        return [uploadedItem, ...prev];
      });
    } catch (err) {
      setUploadError(err?.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  }, []);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={96} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {uploadError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleUploadChange}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <DashboardMetricCard
            title="Total Media"
            value={metrics.total}
            icon={Images}
            iconColor={colors.primary}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DashboardMetricCard
            title="Pages Using Media"
            value={metrics.pagesUsingMedia}
            icon={Layers3}
            iconColor={colors.primary}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DashboardMetricCard
            title="Website Assets"
            value={metrics.websiteAssets}
            icon={ImagePlus}
            iconColor={colors.primary}
          />
        </Grid>
      </Grid>

      <DashboardCard icon={Images} title="Media Library" sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Images currently used across this website appear here automatically. New uploads are
              available immediately in the dashboard.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <DashboardActionButton
              startIcon={
                refreshing ? <CircularProgress size={14} color="inherit" /> : <FolderSync size={16} />
              }
              onClick={() => loadMedia({ silent: true })}
              disabled={refreshing || uploading}
              variant="outlined"
            >
              Refresh
            </DashboardActionButton>
            <DashboardGradientButton
              startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <Upload size={16} />}
              onClick={handleUploadClick}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </DashboardGradientButton>
          </Stack>
        </Stack>

        <DashboardInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by file name, page, block type, or URL"
          size="small"
          fullWidth
          inputProps={{ 'aria-label': 'Search media library' }}
          sx={{ mb: 2 }}
        />

        {filteredMedia.length === 0 ? (
          <EmptyState
            icon={<Images size={48} />}
            title={mediaItems.length === 0 ? 'No media found yet' : 'No matching media found'}
            subtitle={
              mediaItems.length === 0
                ? 'Add images to your pages or upload a new one to start building this website media library.'
                : 'Try a different search term or refresh the website media list.'
            }
            action={
              <DashboardGradientButton startIcon={<Upload size={16} />} onClick={handleUploadClick}>
                Upload First Image
              </DashboardGradientButton>
            }
          />
        ) : (
          <Grid container spacing={2}>
            {filteredMedia.map((item) => (
              <Grid item xs={12} sm={6} lg={4} key={item.id}>
                <Box
                  sx={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: colors.cardBg,
                    boxShadow: colors.shadowSm,
                  }}
                >
                  <Box
                    sx={{
                      aspectRatio: '16 / 10',
                      bgcolor: alpha(colors.primary, 0.08),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src={item.url}
                      alt={item.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                      <Chip size="small" label={item.sourceType} />
                      {item.pages.length > 0 && (
                        <Chip size="small" variant="outlined" label={`${item.pages.length} page${item.pages.length > 1 ? 's' : ''}`} />
                      )}
                    </Stack>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: 0.75,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                        mb: 1.25,
                        wordBreak: 'break-all',
                        minHeight: 34,
                      }}
                    >
                      {item.url}
                    </Typography>

                    {item.pages.length > 0 && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                        Used on: {item.pages.join(', ')}
                      </Typography>
                    )}

                    <Stack direction="row" spacing={1}>
                      <DashboardTooltip title={copiedUrl === item.url ? 'Copied' : 'Copy URL'}>
                        <DashboardActionButton
                          startIcon={<Copy size={14} />}
                          onClick={() => handleCopy(item.url)}
                          variant="text"
                          size="small"
                        >
                          {copiedUrl === item.url ? 'Copied' : 'Copy'}
                        </DashboardActionButton>
                      </DashboardTooltip>
                      <DashboardActionButton
                        component="a"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<ExternalLink size={14} />}
                        variant="text"
                        size="small"
                      >
                        Open
                      </DashboardActionButton>
                    </Stack>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </DashboardCard>
    </Box>
  );
});

export default MediaTab;
