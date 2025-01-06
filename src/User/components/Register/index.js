import React, { useState } from "react";
import { TextField, Button, Box, Typography, CircularProgress, Link } from "@mui/material";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    birthday: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear the error when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  // Validate each field
  const validateField = (name, value) => {
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,12}$/;

    let error = "";
    switch (name) {
      case "username":
        if (!value) error = "Tên đăng nhập không được để trống.";
        break;
      case "password":
        if (!value) error = "Mật khẩu không được để trống.";
        else if (value.length < 8 || value.length > 32) error = "Mật khẩu phải từ 8 đến 32 ký tự.";
        break;
      case "confirmPassword":
        if (!value) error = "Xác nhận mật khẩu không được để trống.";
        else if (value !== formData.password) error = "Mật khẩu xác nhận không khớp.";
        break;
      case "name":
        if (!value) error = "Họ tên không được để trống.";
        else if (!nameRegex.test(value)) error = "Họ tên chỉ được chứa chữ cái và khoảng trắng.";
        break;
      case "birthday":
        if (!value) error = "Ngày sinh không được để trống.";
        else {
          const age = new Date().getFullYear() - new Date(value).getFullYear();
          if (age < 18) error = "Bạn phải đủ 18 tuổi.";
        }
        break;
      case "email":
        if (!value) error = "Email không được để trống.";
        else if (!emailRegex.test(value)) error = "Email không hợp lệ.";
        break;
      case "phone":
        if (!value) error = "Số điện thoại không được để trống.";
        else if (!phoneRegex.test(value)) error = "Số điện thoại phải là số từ 10 đến 12 chữ số.";
        break;
      default:
        break;
    }
    return error;
  };

  const isFormValid = () => {
    const currentErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        currentErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(currentErrors);
    return isValid;
  };

  const handleRegister = async (event) => {
    event.preventDefault();
  
    if (!isFormValid()) return;
  
    setLoading(true);
  
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/accounts/register`, formData);
  
      toast.success("Đăng ký thành công!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      if (error.response) {
        if (error.response.data === "Username already exists.") {
            setErrors((prevErrors) => ({
              ...prevErrors,
              username: "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.",
            }));
          } else if (error.response.data === "Email already exists.") {
            setErrors((prevErrors) => ({
              ...prevErrors,
              email: "Email đã tồn tại. Vui lòng sử dụng email khác.",
            }));
          } else {
            toast.error("Đăng ký thất bại. Vui lòng thử lại!");
          }
      } else {
        console.error("Unknown error:", error);
      }
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
          Đăng ký
        </Typography>
        <Box component="form" onSubmit={handleRegister} sx={{ width: "100%", mt: 3 }}>
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
            label="Mật khẩu"
            name="password"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
            error={!!errors.password}
            helperText={errors.password}
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
          <TextField
            label="Họ tên"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Ngày sinh"
            name="birthday"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.birthday}
            onChange={handleInputChange}
            error={!!errors.birthday}
            helperText={errors.birthday}
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
          <TextField
            label="Số điện thoại"
            name="phone"
            fullWidth
            value={formData.phone}
            onChange={handleInputChange}
            error={!!errors.phone}
            helperText={errors.phone}
            sx={{ mb: 2 }}
          />
          {errors.serverError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errors.serverError}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, mb: 1, padding: "10px", fontSize: "16px" }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng ký"}
          </Button>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Đã có tài khoản?{" "}
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

export default Register;