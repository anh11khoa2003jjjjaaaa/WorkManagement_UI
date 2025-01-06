import React from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowBack } from '@mui/icons-material';

const ActionButtons = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', gap: 2, zIndex: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
        startIcon={<Home />}
        sx={{
          px: 3,
          py: 1,
          borderRadius: 2,
          textTransform: 'none',
          boxShadow: '0 4px 6px rgba(33, 150, 243, 0.3)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 8px rgba(33, 150, 243, 0.4)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        Về Trang chủ
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => navigate(-1)}
        startIcon={<ArrowBack />}
        sx={{
          px: 3,
          py: 1,
          borderRadius: 2,
          textTransform: 'none',
          '&:hover': {
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        Quay lại
      </Button>
    </Box>
  );
};

export default ActionButtons;