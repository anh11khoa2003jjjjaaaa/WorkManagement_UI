import React, { useState } from "react";
import axios from "axios";
import { Box, TextField, Button, Grid, Paper, Typography } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";

const ChangePassPage = () => {
  const [passwordData, setPasswordData] = useState({
    OldPassword: "", // Changed from currenPassword to OldPassword
    NewPassword: "", // Changed from passWordNew to NewPassword
    ConfirmNewPassword: "", // Changed from confirmPassWord to ConfirmNewPassword
  });

  const [errors, setErrors] = useState({});

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded.AccountID || null;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

  const validateForm = () => {
    const { OldPassword, NewPassword, ConfirmNewPassword } = passwordData;
    const newErrors = {};

    if (!OldPassword.trim()) {
      newErrors.OldPassword = "Mật khẩu cũ không được để trống.";
    }

    if (!NewPassword.trim()) {
      newErrors.NewPassword = "Mật khẩu mới không được để trống.";
    } else if (NewPassword.length < 6) {
      newErrors.NewPassword = "Mật khẩu mới phải ít nhất 6 ký tự.";
    }

    if (NewPassword !== ConfirmNewPassword) {
      newErrors.ConfirmNewPassword = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    const userId = getUserIdFromToken();
    if (!userId) {
      toast.error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!");
      return;
    }

    try {
      console.log("Sending password data:", passwordData);
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/accounts/changePassword/${userId}`,
        passwordData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success("Mật khẩu đã được cập nhật thành công!");
      setPasswordData({
        OldPassword: "",
        NewPassword: "",
        ConfirmNewPassword: "",
      });
    } catch (error) {
      console.error("Change password error:", error.response);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi thay đổi mật khẩu!";
      toast.error(errorMessage);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, m: "auto", mt: 5 }}>
      <Typography sx={{ fontSize: '23px', textAlign: 'center', paddingBottom: '30px' }}><strong>Đổi mật khẩu</strong></Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Mật khẩu cũ"
            type="password"
            name="OldPassword" // Updated name
            value={passwordData.OldPassword} // Updated value
            onChange={handleInputChange}
            error={!!errors.OldPassword} // Updated error check
            helperText={errors.OldPassword} // Updated helper text
            sx={{ mb: 2 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Mật khẩu mới"
            type="password"
            name="NewPassword" // Updated name
            value={passwordData.NewPassword} // Updated value
            onChange={handleInputChange}
            error={!!errors.NewPassword} // Updated error check
            helperText={errors.NewPassword} // Updated helper text
            sx={{ mb: 2 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Xác nhận mật khẩu mới"
            type="password"
            name="ConfirmNewPassword" // Updated name
            value={passwordData.ConfirmNewPassword} // Updated value
            onChange={handleInputChange}
            error={!!errors.ConfirmNewPassword} // Updated error check
            helperText={errors.ConfirmNewPassword} // Updated helper text
            sx={{ mb: 2 }}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              onClick={handleChangePassword}
              variant="contained"
              color="primary"
            >
              Thay đổi mật khẩu
            </Button>
          </Box>
        </Grid>
      </Grid>
      <ToastContainer />
    </Paper>
  );
};

export default ChangePassPage;
