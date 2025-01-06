import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

import Navbar from '../Navbar'; // Import Navbar

const theme = createTheme({
  palette: {
    background: {
      default: '#f4f4f4',
    },
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    error: {
      main: '#f44336',
    },
  },
});

const DefaultLayout = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <CssBaseline />
        <Navbar /> {/* Gọi Navbar ở đây */}
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: 'background.default',
              p: 3,
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DefaultLayout;
