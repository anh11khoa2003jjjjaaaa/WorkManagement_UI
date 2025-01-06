import React, { useState } from "react";
import { TextField, Button, Box, Typography, CircularProgress, Link } from "@mui/material";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    otpCode: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const isFormValid = () => {
    const currentErrors = {};
    let isValid = true;

    if (!formData.username) {
      currentErrors.username = "Tên đăng nhập không được để trống.";
      isValid = false;
    }
    if (!formData.email) {
      currentErrors.email = "Email không được để trống.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      currentErrors.email = "Email không hợp lệ.";
      isValid = false;
    }
    if (step === 2) {
      if (!formData.otpCode) {
        currentErrors.otpCode = "Mã OTP không được để trống.";
        isValid = false;
      }
      if (!formData.newPassword) {
        currentErrors.newPassword = "Mật khẩu mới không được để trống.";
        isValid = false;
      } else if (formData.newPassword.length < 8 || formData.newPassword.length > 32) {
        currentErrors.newPassword = "Mật khẩu phải từ 8 đến 32 ký tự.";
        isValid = false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        currentErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
        isValid = false;
      }
    }

    setErrors(currentErrors);
    return isValid;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/accounts/forgot-password`, {
        username: formData.username,
        email: formData.email,
      });
      toast.success("Mã OTP đã được gửi đến email của bạn!");
      setStep(2);
    } catch (error) {
      toast.error("Không thể gửi OTP. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/accounts/reset-password`, {
        username: formData.username,
        otpCode: formData.otpCode,
        newPassword: formData.newPassword,
      });
      toast.success("Mật khẩu đã được thay đổi thành công!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      toast.error("Không thể đổi mật khẩu. Vui lòng kiểm tra lại mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: 3,
        }}
      >
        <Typography
          component="h1"
          color="primary"
          variant="h4"
          textAlign="center"
          sx={{ fontWeight: "bold", mb: 2, mt: 2 }}
        >
          {step === 1 ? "Quên mật khẩu" : "Đổi mật khẩu"}
        </Typography>
        <Box
          component="form"
          onSubmit={step === 1 ? handleSendOtp : handleResetPassword}
          sx={{ width: "100%", mt: 3 }}
        >
          {step === 1 && (
            <>
              <TextField
                label="Tên đăng nhập"
                name="username"
                fullWidth
                value={formData.username}
                onChange={handleInputChange}
                error={!!errors.username}
                helperText={errors.username}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Email"
                name="email"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2, mb: 1, padding: "10px", fontSize: "16px" }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Gửi OTP"}
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <TextField
                label="Mã OTP"
                name="otpCode"
                fullWidth
                value={formData.otpCode}
                onChange={handleInputChange}
                error={!!errors.otpCode}
                helperText={errors.otpCode}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Mật khẩu mới"
                name="newPassword"
                type="password"
                fullWidth
                value={formData.newPassword}
                onChange={handleInputChange}
                error={!!errors.newPassword}
                helperText={errors.newPassword}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type="password"
                fullWidth
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2, mb: 1, padding: "10px", fontSize: "16px" }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Đổi mật khẩu"}
              </Button>
            </>
          )}
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Nhớ mật khẩu?{" "}
            <Link
              component={RouterLink}
              to="/login"
              variant="body2"
              color="primary"
              sx={{ textDecoration: "none" }}
            >
              Đăng nhập
            </Link>
          </Typography>
        </Box>
      </Box>
      <ToastContainer />
    </Box>
  );
};

export default ForgotPassword;
