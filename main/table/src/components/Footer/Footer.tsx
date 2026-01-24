import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';
import { Email } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#001f3f',
        color: '#ffffff',
        py: 3,
        mt: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Connect with us section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              Connect with us
            </Typography>
            <Link
              href="mailto:bizgrid.io@gmail.com"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: '#ffffff',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  color: '#90caf9',
                },
              }}
            >
              <Email fontSize="small" />
              <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                bizgrid.io@gmail.com
              </Typography>
            </Link>
          </Box>

          {/* Slogan */}
          <Typography
            variant="body1"
            sx={{
              fontSize: '1rem',
              fontStyle: 'italic',
              opacity: 0.9,
              textAlign: { xs: 'center', sm: 'right' },
            }}
          >
            Exploring the world through brands
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
