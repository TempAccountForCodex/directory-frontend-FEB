import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Alert,
  Skeleton,
  Grid,
  Typography,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Globe, Search, Share2 } from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { DashboardCard } from '../shared';
import DashboardActionButton from '../shared/DashboardActionButton';
import DashboardGradientButton from '../shared/DashboardGradientButton';
import DashboardInput from '../shared/DashboardInput';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const META_TITLE_RECOMMENDED = { min: 50, max: 60 };
const META_DESC_RECOMMENDED = { min: 150, max: 160 };

const getCharCountColor = (len, range) => {
  if (len === 0) return 'text.secondary';
  if (len < range.min) return 'warning.main';
  if (len > range.max) return 'error.main';
  return 'success.main';
};

const IndexingBanner = ({ status, seoSettings }) => {
  const isIndexable = status === 'PUBLISHED' && (!seoSettings?.robotsMeta || seoSettings.robotsMeta !== 'noindex');
  const isLimited = status === 'PUBLISHED' && seoSettings?.robotsMeta === 'noindex';
  const isNotIndexable = status !== 'PUBLISHED';

  if (isIndexable) {
    return (
      <Alert severity="success" icon={<Globe size={18} />} sx={{ mb: 3, borderRadius: 2 }}>
        Your website is indexable. Search engines can discover and crawl your pages.
      </Alert>
    );
  }
  if (isLimited) {
    return (
      <Alert severity="warning" icon={<Globe size={18} />} sx={{ mb: 3, borderRadius: 2 }}>
        Indexing is limited. Your robots meta tag is set to noindex.
      </Alert>
    );
  }
  return (
    <Alert severity="error" icon={<Globe size={18} />} sx={{ mb: 3, borderRadius: 2 }}>
      Your website is not indexable because it is not published. Publish to enable search engine indexing.
    </Alert>
  );
};

const SocialPreviewCard = ({ platform, title, description, url }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const platformColors = {
    Facebook: '#1877f2',
    Twitter: '#1da1f2',
    LinkedIn: '#0a66c2',
  };

  return (
    <Box
      sx={{
        border: `1px solid ${colors.border}`,
        borderRadius: 2,
        overflow: 'hidden',
        background: colors.bgCard,
      }}
    >
      <Box
        sx={{
          bgcolor: platformColors[platform],
          color: 'common.white',
          px: 2,
          py: 0.75,
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      >
        {platform}
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
        >
          {url || 'yourwebsite.techietribe.app'}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            color: 'text.primary',
            fontWeight: 700,
            mb: 0.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title || 'Your Page Title'}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {description || 'Your page description will appear here in social previews.'}
        </Typography>
      </Box>
    </Box>
  );
};


const SeoTab = memo(({ website, websiteId, onSaved }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // Backend stores SEO fields as flat fields on the website model (expanded in 10.37).
  const initialSeo = {
    metaTitle: website?.metaTitle || '',
    metaDescription: website?.metaDescription || '',
    robotsTxt: website?.robotsTxt || 'User-agent: *\nAllow: /',
    sitemapEnabled: website?.sitemapEnabled ?? true,
    ogImage: website?.ogImage || '',
    robotsMeta: website?.robotsMeta || 'index, follow',
  };

  const [form, setForm] = useState(initialSeo);
  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchPages = useCallback(async () => {
    if (!websiteId) return;
    try {
      setPagesLoading(true);
      const res = await axios.get(`${API_URL}/websites/${websiteId}/pages`);
      // Backend returns { success, data: [...pages] }
      setPages(res.data?.data || res.data?.pages || []);
    } catch {
      setPages([]);
    } finally {
      setPagesLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Sync form if website changes — read from flat fields
  useEffect(() => {
    if (website) {
      setForm((prev) => ({
        ...prev,
        metaTitle: website.metaTitle || prev.metaTitle,
        metaDescription: website.metaDescription || prev.metaDescription,
        robotsTxt: website.robotsTxt ?? prev.robotsTxt,
        sitemapEnabled: website.sitemapEnabled ?? prev.sitemapEnabled,
        ogImage: website.ogImage ?? prev.ogImage,
        robotsMeta: website.robotsMeta ?? prev.robotsMeta,
      }));
    }
  }, [website?.id, website?.metaTitle, website?.metaDescription]);

  const handleField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const robotsTxtWarning = useMemo(() => {
    return form.robotsTxt && form.robotsTxt.includes('Disallow: /');
  }, [form.robotsTxt]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      const res = await axios.put(`${API_URL}/websites/${websiteId}`, {
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        ogImage: form.ogImage || null,
        robotsMeta: form.robotsMeta,
        robotsTxt: form.robotsTxt,
        sitemapEnabled: form.sitemapEnabled,
      });
      if (onSaved) onSaved(res.data?.data || res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to save SEO settings.');
    } finally {
      setSaving(false);
    }
  };

  const titleLen = form.metaTitle.length;
  const descLen = form.metaDescription.length;

  return (
    <Box>
      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          SEO settings saved successfully.
        </Alert>
      )}

      {/* Indexing status banner */}
      <IndexingBanner status={website?.status} seoSettings={form} />

      {/* Global SEO section */}
      <DashboardCard icon={Search} title="Global SEO" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Meta title */}
          <Box>
            <DashboardInput
              label="Meta Title"
              value={form.metaTitle}
              onChange={(e) => handleField('metaTitle', e.target.value)}
              fullWidth
              inputProps={{ maxLength: 120, 'aria-label': 'Meta title' }}
            />
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 0.5,
                color: getCharCountColor(titleLen, META_TITLE_RECOMMENDED),
              }}
            >
              {titleLen} characters
              {titleLen > 0 && titleLen < META_TITLE_RECOMMENDED.min && ' (too short, aim for 50–60)'}
              {titleLen > META_TITLE_RECOMMENDED.max && ' (too long, aim for 50–60)'}
              {titleLen >= META_TITLE_RECOMMENDED.min && titleLen <= META_TITLE_RECOMMENDED.max && ' (ideal length)'}
            </Typography>
          </Box>

          {/* Meta description */}
          <Box>
            <DashboardInput
              label="Meta Description"
              value={form.metaDescription}
              onChange={(e) => handleField('metaDescription', e.target.value)}
              fullWidth
              multiline
              rows={3}
              inputProps={{ maxLength: 320, 'aria-label': 'Meta description' }}
            />
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 0.5,
                color: getCharCountColor(descLen, META_DESC_RECOMMENDED),
              }}
            >
              {descLen} characters
              {descLen > 0 && descLen < META_DESC_RECOMMENDED.min && ' (too short, aim for 150–160)'}
              {descLen > META_DESC_RECOMMENDED.max && ' (too long, aim for 150–160)'}
              {descLen >= META_DESC_RECOMMENDED.min && descLen <= META_DESC_RECOMMENDED.max && ' (ideal length)'}
            </Typography>
          </Box>

          {/* Canonical URL (read-only) */}
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Canonical URL
            </Typography>
            <Box
              component="code"
              sx={{
                display: 'block',
                p: 1.5,
                borderRadius: 1,
                bgcolor: alpha(colors.text, 0.05),
                border: `1px solid ${colors.border}`,
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                color: 'text.primary',
              }}
            >
              https://{website?.subdomain || website?.slug}.techietribe.app
            </Box>
          </Box>

          {/* Robots.txt */}
          <Box>
            <DashboardInput
              label="robots.txt"
              value={form.robotsTxt}
              onChange={(e) => handleField('robotsTxt', e.target.value)}
              fullWidth
              multiline
              rows={4}
              inputProps={{
                style: { fontFamily: 'monospace', fontSize: '0.85rem' },
                'aria-label': 'robots.txt content',
              }}
            />
            {robotsTxtWarning && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Warning: "Disallow: /" blocks all search engine crawlers from your site.
              </Alert>
            )}
          </Box>

          {/* Sitemap toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              Enable Sitemap
            </Typography>
            <Switch
              checked={!!form.sitemapEnabled}
              onChange={(e) => handleField('sitemapEnabled', e.target.checked)}
              inputProps={{ 'aria-label': 'Enable sitemap' }}
            />
          </Box>
        </Box>
      </DashboardCard>

      {/* Social preview section */}
      <DashboardCard icon={Share2} title="Social Preview" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <DashboardInput
            label="OG Image URL"
            value={form.ogImage}
            onChange={(e) => handleField('ogImage', e.target.value)}
            fullWidth
            inputProps={{ 'aria-label': 'OG image URL for social sharing' }}
            helperText="Image URL shown when your site is shared on social media"
          />
        </Box>

        <Grid container spacing={2}>
          {['Facebook', 'Twitter', 'LinkedIn'].map((platform) => (
            <Grid item xs={12} sm={12} md={4} key={platform}>
              <SocialPreviewCard
                platform={platform}
                title={form.metaTitle}
                description={form.metaDescription}
                url={`${website?.subdomain || website?.slug}.techietribe.app`}
              />
            </Grid>
          ))}
        </Grid>
      </DashboardCard>

      {/* Per-page SEO overrides */}
      <DashboardCard icon={Globe} title="Per-Page SEO" sx={{ mb: 3 }}>
        {pagesLoading ? (
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
        ) : (
          <TableContainer component={Paper} sx={{ overflowX: 'auto', borderRadius: 2 }}>
            <Table size="small" aria-label="Per-page SEO table">
              <TableHead>
                <TableRow>
                  <TableCell>Page</TableCell>
                  <TableCell>Custom Title</TableCell>
                  <TableCell>Custom Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" sx={{ py: 2, color: 'text.secondary' }}>
                        No pages found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pages.map((page) => (
                    <TableRow key={page.id} hover>
                      <TableCell>
                        <Typography variant="body2">{page.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: page.seoTitle ? 'text.primary' : 'text.disabled',
                            fontStyle: page.seoTitle ? 'normal' : 'italic',
                          }}
                        >
                          {page.seoTitle || 'Inheriting global'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: page.seoDescription ? 'text.primary' : 'text.disabled',
                            fontStyle: page.seoDescription ? 'normal' : 'italic',
                          }}
                        >
                          {page.seoDescription
                            ? page.seoDescription.substring(0, 60) +
                              (page.seoDescription.length > 60 ? '...' : '')
                            : 'Inheriting global'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DashboardCard>

      {/* Save */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <DashboardGradientButton
          onClick={handleSave}
          disabled={saving}
          aria-label="Save SEO settings"
        >
          {saving ? 'Saving...' : 'Save SEO Settings'}
        </DashboardGradientButton>
      </Box>
    </Box>
  );
});

SeoTab.displayName = 'SeoTab';

export default SeoTab;
