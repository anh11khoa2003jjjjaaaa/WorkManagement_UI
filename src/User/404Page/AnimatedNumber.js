import React from 'react';
import { Box, Typography } from '@mui/material';

const AnimatedNumber = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '280px',
        height: '280px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mb: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #2196f3, #e91e63)',
          animation: 'spin 8s linear infinite',
          filter: 'blur(15px)',
          opacity: 0.8
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '95%',
          height: '95%',
          borderRadius: '50%',
          background: '#fff',
          zIndex: 1
        },
        '@keyframes spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontWeight: 900,
          background: 'linear-gradient(45deg, #2196f3, #e91e63)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          zIndex: 2,
          fontSize: '5rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        404
      </Typography>
    </Box>
  );
};

export default AnimatedNumber;