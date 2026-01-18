import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import CompanyDirectory from './components/CompanyDirectory';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
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
    htmlFontSize: 16,
    fontSize: 14,
    h1: {
      fontFamily: 'Merriweather, serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      [createTheme().breakpoints.down('md')]: {
        fontSize: '2rem',
      },
      [createTheme().breakpoints.down('sm')]: {
        fontSize: '1.75rem',
      },
    },
    h2: {
      fontFamily: 'Merriweather, serif',
      fontWeight: 600,
      fontSize: '2rem',
      [createTheme().breakpoints.down('md')]: {
        fontSize: '1.75rem',
      },
      [createTheme().breakpoints.down('sm')]: {
        fontSize: '1.5rem',
      },
    },
    h3: {
      fontFamily: 'Merriweather, serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      [createTheme().breakpoints.down('md')]: {
        fontSize: '1.5rem',
      },
      [createTheme().breakpoints.down('sm')]: {
        fontSize: '1.25rem',
      },
    },
    h4: {
      fontFamily: 'Merriweather, serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      [createTheme().breakpoints.down('md')]: {
        fontSize: '1.25rem',
      },
      [createTheme().breakpoints.down('sm')]: {
        fontSize: '1.1rem',
      },
    },
    h5: {
      fontFamily: 'Merriweather, serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      [createTheme().breakpoints.down('md')]: {
        fontSize: '1.1rem',
      },
      [createTheme().breakpoints.down('sm')]: {
        fontSize: '1rem',
      },
    },
    h6: {
      fontFamily: 'Merriweather, serif',
      fontWeight: 600,
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '4px 12px',
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          borderRight: '1px solid #e0e0e0',
          '&:last-child': {
            borderRight: 'none',
          },
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#001f3f',
          color: '#ffffff',
          padding: '6px 12px',
          whiteSpace: 'nowrap',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
          '&:last-child': {
            borderRight: 'none',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3, width: '98%', margin: '0 auto' }}>
        <CompanyDirectory />
      </Box>
    </ThemeProvider>
  );
}

export default App;
