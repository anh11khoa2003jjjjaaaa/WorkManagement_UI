import React, { useState } from "react";
import { TextField, Button, Box, Typography, CircularProgress, Link } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/accounts/login`, { username, password });
console.log(process.env.REACT_APP_API_BASE_URL);
      const { token } = response.data;
      localStorage.setItem("authToken", token);

      if (token) {
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
        toast.success("Đăng nhập thành công!");
       

        setTimeout(() => {
          if (userRole === "Leader") {
            window.location.href = "/admin/dashboard";
            console.log("token:",token);
          } else if (userRole === "Employee") {
            window.location.href = "/user/department";
            console.log("token:",token);
          }
        }, 3000);
      } else {
        window.location.href = "/login";
      }

    } catch (error) {
      toast.error("Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.");
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
        <Typography component="h1" color="primary" variant="h4" textAlign="center" sx={{ fontWeight: "bold", mb: 2, mt: 2 }}>
          Đăng nhập
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ width: "100%", mt: 3 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Link
            component={RouterLink} 
            to="/forgot-password" 
            variant="body2" 
            sx={{ textDecoration: "none", display: "block", textAlign: "right", mb: 2 }}
          >
            Quên mật khẩu?
          </Link>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, mb: 1, padding: "10px", fontSize: "16px" }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng nhập"}
          </Button>

          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Bạn chưa có tài khoản?{" "}
            <Link component={RouterLink} to="/register" variant="body2" sx={{ textDecoration: "none" }}>
              Đăng ký
            </Link>
          </Typography>
        </Box>
      </Box>
      <ToastContainer />
    </Box>
  );
};

export default LoginPage;