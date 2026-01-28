import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  School,
  Palette,
  Analytics,
  Business,
} from '@mui/icons-material';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Merriweather',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'system-ui',
      'serif',
    ].join(','),
    h2: {
      fontFamily: 'Merriweather, serif',
      fontWeight: 600,
      fontSize: '2.5rem',
      color: '#001f3f',
    },
    h3: {
      fontFamily: 'Merriweather, serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#001f3f',
    },
    h4: {
      fontFamily: 'Merriweather, serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#001f3f',
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.7,
      color: '#333',
    },
    body2: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#555',
    },
  },
});

const AboutUs: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Hero Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 6,
            backgroundColor: '#f8fafc',
            color: 'text.primary',
            borderRadius: 0,
            border: 'none',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            borderBottom: '1px solid rgba(0,0,0,0.06)'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center', 
            minHeight: '500px',
            maxWidth: '1400px',
            mx: 'auto',
            width: '100%',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Left Content */}
            <Box sx={{ 
              flex: 1, 
              p: { xs: 3, md: 4 },
              pr: { xs: 3, md: 6 },
              zIndex: 2,
              position: 'relative',
              maxWidth: '1000px'
            }}>
              <Typography
                variant="h6"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: '#001f3f',
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  lineHeight: 1.3
                }}
              >
                What is <Box component="span" sx={{ color: 'primary.main' }}>Bizgrid</Box>?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: '#333',
                  mb: 3,
                  fontWeight: 400
                }}
              >
                Bizgrid is transforming corporate intelligence through an innovative, comprehensive company directory platform. What began as a passion project has evolved into a powerful tool for professionals across industries.
              </Typography>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
                mb: 4
              }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ width: '8px', height: '8px', bgcolor: 'primary.main', borderRadius: '50%', mr: 1.5 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#001f3f', fontSize: '0.9375rem' }}>Comprehensive Database</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#555', pl: 3.5, fontSize: '0.875rem' }}>
                    Thousands of public and private companies with detailed insights and analytics.
                  </Typography>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ width: '8px', height: '8px', bgcolor: 'primary.main', borderRadius: '50%', mr: 1.5 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#001f3f', fontSize: '0.9375rem' }}>Global Coverage</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#555', pl: 3.5, fontSize: '0.875rem' }}>
                    Bridging the gap between raw data and meaningful industry insights worldwide.
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Right Image */}
            <Box sx={{ 
              flex: 1, 
              position: 'relative',
              minHeight: { xs: '300px', md: '500px' },
              width: '100%',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 50%)',
                zIndex: 1,
                display: { xs: 'block', md: 'none' }
              }
            }}>
              <Box
                component="img"
                src="/Landscape Image.avif"
                alt="Bizgrid Landscape"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
                onError={(e) => {
                  // Fallback if image doesn't load
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Gradient overlay for better text readability */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 30%)',
                  zIndex: 1,
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Community Section */}
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            mb: 4,
            color: '#001f3f',
            fontSize: { xs: '1.5rem', md: '1.75rem' },
            lineHeight: 1.3
          }}
        >
          Our Community
        </Typography>

        <Grid container spacing={3}>
          {/* Students Card */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <School
                    sx={{
                      fontSize: 32,
                      color: '#1976d2',
                      mr: 2,
                    }}
                  />
                  <Typography variant="body1" component="h3" sx={{ 
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    color: '#333',
                    fontWeight: 700
                  }}>
                    For Students
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ 
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: '#555',
                  mb: 3,
                  fontWeight: 400
                }}>
                  A gateway to discovery. Find your next career move by exploring companies tailored to your specific industry and location.
                </Typography>
                <Box
                  sx={{
                    width: 60,
                    height: 4,
                    backgroundColor: '#1976d2',
                    borderRadius: 2,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Designers Card */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Palette
                    sx={{
                      fontSize: 32,
                      color: '#dc004e',
                      mr: 2,
                    }}
                  />
                  <Typography variant="body1" component="h3" sx={{ 
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    color: '#333',
                    fontWeight: 700
                  }}>
                    For Designers
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ 
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: '#555',
                  mb: 3,
                  fontWeight: 400
                }}>
                  A visual playground. Use our extensive database to analyze the design landscape, track branding trends, and find inspiration for your next project.
                </Typography>
                <Box
                  sx={{
                    width: 60,
                    height: 4,
                    backgroundColor: '#dc004e',
                    borderRadius: 2,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Analysts Card */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Analytics
                    sx={{
                      fontSize: 32,
                      color: '#2e7d32',
                      mr: 2,
                    }}
                  />
                  <Typography variant="body1" component="h3" sx={{ 
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    color: '#333',
                    fontWeight: 700
                  }}>
                    For Analysts
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ 
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: '#555',
                  mb: 3,
                  fontWeight: 400
                }}>
                  A strategic edge. Use our comprehensive database to analyze competitor landscapes, track industry trends, and gain insights for your strategy.
                </Typography>
                <Box
                  sx={{
                    width: 60,
                    height: 4,
                    backgroundColor: '#2e7d32',
                    borderRadius: 2,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default AboutUs;
