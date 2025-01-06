import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const AdminNotificationPage = () => {
  const [recipientType, setRecipientType] = useState(""); // Loại người nhận
  const [recipient, setRecipient] = useState(""); // Người nhận cụ thể
  const [title, setTitle] = useState(""); // Tiêu đề thông báo
  const [content, setContent] = useState(""); // Nội dung thông báo
  const [users, setUsers] = useState([]); // Danh sách người dùng
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleSnackbarClose = () => setSnackbar({ open: false, message: "", severity: "success" });

  // Fetch danh sách người dùng
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/User`);
      setUsers(response.data);
    } catch (error) {
      console.error("Không thể tải danh sách người dùng:", error);
      // setSnackbar({ open: true, message: "Không thể tải danh sách người dùng.", severity: "error" });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
     toast.warning("Tiêu đề và nội dung không được để trống!")
      return;
    }

    const params = {
      userId: recipientType === "individual" ? recipient : null,
      title,
      content,
      isGlobal: recipientType === "all",
    };

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/notification/send`, null, { params });
      toast.success("Gửi thông báo thành công!");
      resetForm();
    } catch (error) {
      console.error("Lỗi khi gửi thông báo:", error);
      
      toast.error("Đã xãy ra lỗi khi gửi thông báo!");
    }
  };

  const resetForm = () => {
    setRecipientType("");
    setRecipient("");
    setTitle("");
    setContent("");
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, margin: "0 auto", backgroundColor: "#f9f9f9", borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Gửi Thông Báo
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Chọn loại người nhận */}
        <FormControl fullWidth sx={{ mb: 2 }} required>
          <Select
            value={recipientType}
            onChange={(e) => setRecipientType(e.target.value)}
            displayEmpty
            renderValue={
              recipientType !== "" ? undefined : () => "Chọn loại người nhận"
            }
          >
            <MenuItem value="individual">Cá Nhân</MenuItem>
            <MenuItem value="all">Toàn Bộ Nhân Viên</MenuItem>
          </Select>
        </FormControl>


        {/* Chọn người nhận nếu là cá nhân */}
        {recipientType === "individual" && (
          <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel>Chọn Người Nhận</InputLabel>
            <Select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            >
              {users.length > 0 ? (
                users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Không có người dùng nào</MenuItem>
              )}
            </Select>
          </FormControl>
        )}

        {/* Tiêu đề */}
        <TextField
          fullWidth
          label="Tiêu Đề Thông Báo"
          placeholder="Nhập tiêu đề thông báo"
          value={title}
          margin="dense"
          multiline
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
          required
        />

        {/* Nội dung */}
        <TextField
          fullWidth
          label="Nội Dung Thông Báo"
          placeholder="Nhập nội dung chi tiết của thông báo"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={4}
          sx={{ mb: 3 }}
          required
        />

        {/* Nút Gửi */}
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Gửi Thông Báo
        </Button>
      </form>

      {/* Thông báo Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <ToastContainer />
    </Box>
    
  );
  
};

export default AdminNotificationPage;
