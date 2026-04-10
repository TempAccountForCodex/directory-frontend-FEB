/**
 * BlogFeedStaticRenderer — Step 17.5
 *
 * Pure presentational component that renders static placeholder blog posts
 * for template previews when no dynamic data is available.
 * No API calls — only props-driven rendering.
 */

import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

/* ===================== Types ===================== */

export interface StaticPost {
  title: string;
  excerpt?: string;
  image?: string;
  category?: string;
  date?: string;
  readTime?: string;
  slug?: string;
}

export interface BlogFeedStaticRendererProps {
  posts: StaticPost[];
  columns?: '2' | '3' | '4';
  showCategory?: boolean;
  showDate?: boolean;
  showReadTime?: boolean;
  showExcerpt?: boolean;
  heading?: string;
  subheading?: string;
  primaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
}

/* ===================== Component ===================== */

const BlogFeedStaticRenderer: React.FC<BlogFeedStaticRendererProps> = ({
  posts,
  columns = '3',
  showCategory = true,
  showDate = true,
  showReadTime = true,
  showExcerpt = true,
  heading,
  subheading,
  primaryColor = '#378C92',
  headingColor = '#252525',
  bodyColor = '#6A6F78',
}) => {
  const mdCols = useMemo(() => {
    const map: Record<string, number> = { '2': 6, '3': 4, '4': 3 };
    return map[columns] || 4;
  }, [columns]);

  if (!posts || posts.length === 0) return null;

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        {(heading || subheading) && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {heading && (
              <Typography
                variant="h3"
                component="h2"
                sx={{ color: headingColor, fontWeight: 700, mb: 1 }}
              >
                {heading}
              </Typography>
            )}
            {subheading && (
              <Typography variant="body1" sx={{ color: bodyColor }}>
                {subheading}
              </Typography>
            )}
          </Box>
        )}

        <Grid container spacing={3}>
          {posts.map((post, index) => (
            <Grid item xs={12} sm={6} md={mdCols} key={post.slug || index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                elevation={1}
              >
                {post.image && (
                  <CardMedia
                    component="img"
                    height={200}
                    image={post.image}
                    alt={post.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {showCategory && post.category && (
                    <Chip
                      label={post.category}
                      size="small"
                      sx={{
                        alignSelf: 'flex-start',
                        mb: 1,
                        bgcolor: primaryColor,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  )}

                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      color: headingColor,
                      fontWeight: 600,
                      mb: 1,
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.title}
                  </Typography>

                  {showExcerpt && post.excerpt && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: bodyColor,
                        mb: 2,
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {post.excerpt}
                    </Typography>
                  )}

                  {(showDate || showReadTime) && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mt: 'auto',
                        pt: 1,
                      }}
                    >
                      {showDate && post.date && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ fontSize: 14, color: bodyColor }} />
                          <Typography variant="caption" sx={{ color: bodyColor }}>
                            {post.date}
                          </Typography>
                        </Box>
                      )}
                      {showReadTime && post.readTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: bodyColor }} />
                          <Typography variant="caption" sx={{ color: bodyColor }}>
                            {post.readTime}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default React.memo(BlogFeedStaticRenderer);
