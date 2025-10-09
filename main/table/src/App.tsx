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
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'system-ui',
      'sans-serif',
    ].join(','),
    fontSize: 14,
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
