import React from 'react';
import { Box } from '@mui/material';

const FloatingCircles = () => {
  return (
    <>
      {[...Array(15)].map((_, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: `${Math.random() * 60 + 20}px`,
            height: `${Math.random() * 60 + 20}px`,
            borderRadius: '50%',
            background: `linear-gradient(135deg, 
              rgba(33, 150, 243, ${Math.random() * 0.4 + 0.1}), 
              rgba(233, 30, 99, ${Math.random() * 0.4 + 0.1}))`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float${index} ${Math.random() * 6 + 4}s ease-in-out infinite`,
            '@keyframes float${index}': {
              '0%': { transform: 'translate(0, 0) rotate(0deg)' },
              '50%': { 
                transform: `translate(
                  ${Math.random() * 40 - 20}px, 
                  ${Math.random() * 40 - 20}px) rotate(${Math.random() * 180}deg)` 
              },
              '100%': { transform: 'translate(0, 0) rotate(0deg)' }
            },
            zIndex: 0
          }}
        />
      ))}
    </>
  );
};

export default FloatingCircles;