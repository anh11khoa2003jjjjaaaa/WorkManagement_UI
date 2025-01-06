import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Container,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminPositionPage = () => {
  const [positions, setPositions] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Position`);
        setPositions(response.data);
      } catch (error) {
        console.error("Error fetching positions:", error);
        toast.error("Không thể tải dữ liệu vị trí.");
      }
    };

    fetchPositions();
  }, []);

  const handleSearchChange = (e) => setSearch(e.target.value);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      description: "",
    });
    setErrors({
      name: "",
      description: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleEdit = async (positionId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Position/${positionId}`);
      const position = response.data;
      setIsEditing(true);
      setEditingId(position.id);
      setFormData({
        name: position.name || "",
        description: position.description || "",
      });
      handleModalOpen();
    } catch (error) {
      console.error("Error fetching position details:", error);
      toast.error("Không thể tải dữ liệu vị trí.");
    }
  };

  const handleDeleteOpen = (positionId) => {
    setDeletingId(positionId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteModalOpen(false);
    setDeletingId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/Position/${deletingId}`);
      toast.success("Xóa vị trí thành công!");
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Position`);
      setPositions(response.data);
      handleDeleteClose();
    } catch (error) {
      console.error("Error deleting position:", error);
      toast.error("Lỗi khi xóa vị trí.");
      handleDeleteClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = "Tên vị trí không được để trống";
    }
    if (!formData.description) {
      newErrors.description = "Mô tả vị trí không được để trống";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = {
        name: formData.name,
        description: formData.description,
      };
      const formDataToSendUpate = {
        id: editingId,
        name: formData.name,
        description: formData.description,
      };

      if (isEditing) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/Position/${editingId}`, formDataToSendUpate);
        toast.success("Cập nhật vị trí thành công!");
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/Position`, formDataToSend);
        toast.success("Thêm vị trí thành công!");
      }

      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Position`);
      setPositions(response.data);
      handleModalClose();
    } catch (error) {
      console.error("Error saving position:", error);
      toast.error("Lỗi khi lưu thông tin vị trí.");
    }
  };

  const filteredPositions = positions.filter((position) =>
    position.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <Box
        sx={{
          mt: 2,
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: "50%", marginRight: 2 }}
        />
        <Button
          variant="contained"
          color="success"
          startIcon={<Add />}
          onClick={handleModalOpen}
        >
          Thêm vị trí
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Tên vị trí</strong></TableCell>
              <TableCell><strong>Mô tả</strong></TableCell>
              <TableCell><strong>Hành động</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPositions.length > 0 ? (
              filteredPositions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell>{position.name}</TableCell>
                  <TableCell>{position.description}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 1 }}>
                      <IconButton color="primary" onClick={() => handleEdit(position.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleDeleteOpen(position.id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Không có vị trí nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isModalOpen} onClose={handleModalClose}>
        <DialogTitle>{isEditing ? "Cập nhật vị trí" : "Thêm vị trí"}</DialogTitle>
        <DialogContent>
          <Box>
            <TextField
              label="Tên vị trí"
              value={formData.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              fullWidth
              margin="dense"
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Mô tả vị trí"
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              fullWidth
              margin="dense"
              multiline
              error={!!errors.description}
              helperText={errors.description}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleFormSubmit}>
            {isEditing ? "Cập nhật" : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onClose={handleDeleteClose}>
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa vị trí này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Hủy</Button>
          <Button variant="contained" color="secondary" onClick={handleDeleteConfirm}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Container>
  );
};

export default AdminPositionPage;
