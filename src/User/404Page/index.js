import React from 'react';
import { Box, Typography } from '@mui/material';
import FloatingCircles from '../404Page/FloatingCircles';
import AnimatedNumber from '../404Page/AnimatedNumber';
import ActionButtons from '../404Page/ActionButtons';

const NotFound404 = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        px: 3
      }}
    >
      <FloatingCircles />
      
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '600px'
        }}
      >
        <AnimatedNumber />
        
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1a237e',
            mb: 2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Trang không tồn tại!
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: '#546e7a',
            mb: 4,
            fontSize: '1.1rem',
            maxWidth: '80%',
            lineHeight: 1.6
          }}
        >
          Trang bạn đang tìm kiếm có thể đã bị xóa hoặc không khả dụng.
          Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </Typography>

        <ActionButtons />
      </Box>
    </Box>
  );
};

export default NotFound404;