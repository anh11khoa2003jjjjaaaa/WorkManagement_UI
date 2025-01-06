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
  TablePagination,
  TextField,
  Container,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DepartmentPage = () => {
  const [departments, setDepartments] = useState([]);
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
    const fetchDepartments = async () => {
      try {

        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Department`);

        setDepartments(response.data);

      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
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

  const handleEdit = async (departmentId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/Department/${departmentId}`
      );
      const department = response.data;
      setIsEditing(true);
      setEditingId(department.id);
      setFormData({
        name: department.name || "",
        description: department.description || "",
      });
      handleModalOpen();
    } catch (error) {
      console.error("Error fetching department details:", error);
      toast.error("Không thể tải dữ liệu phòng ban.");
    }
  };

  const handleDeleteOpen = (departmentId) => {
    setDeletingId(departmentId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteModalOpen(false);
    setDeletingId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/Department/${deletingId}`
      );
      toast.success("Xóa phòng ban thành công!");
      const departmentsResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Department`);
      //   const departmentsResponse = await axios.get(
      //     `${process.env.REACT_APP_API_BASE_URL}/api/departments/getAll`,
      //     {
      //       params: {
      //         pageNumber: page + 1,
      //         pageSize: rowsPerPage,
      //       },
      //     }
      //   );
      setDepartments(departmentsResponse.data);

      handleDeleteClose();
    } catch (error) {
      console.error("Error deleting department:", error);
      //   toast.error("Lỗi khi xóa phòng ban.");
      handleDeleteClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = "Tên phòng ban không được để trống";
    }
    if (!formData.description) {
      newErrors.description = "Mô tả phòng ban không được để trống";
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

      if (isEditing) {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/Department/${editingId}`,
          formDataToSend
        );
        toast.success("Cập nhật phòng ban thành công!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/Department`,
          formDataToSend
        );
        toast.success("Thêm phòng ban thành công!");
      }


      const departmentsResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Department`);
      setDepartments(departmentsResponse.data);

      handleModalClose();
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error("Lỗi khi lưu thông tin phòng ban.");
    }
  };

  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(search.toLowerCase())
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
          Thêm phòng ban
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Tên phòng ban</strong>
              </TableCell>
              <TableCell>
                <strong>Mô tả</strong>
              </TableCell>
              <TableCell>
                <strong>Hành động</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>{department.name}</TableCell>
                  <TableCell>{department.description}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(department.id)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleDeleteOpen(department.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Không có phòng ban nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>



      <Dialog open={isModalOpen} onClose={handleModalClose}>
        <DialogTitle>{isEditing ? "Cập nhật phòng ban" : "Thêm phòng ban"}</DialogTitle>
        <DialogContent>
          <Box>
            <TextField
              label="Tên phòng ban"
              value={formData.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              fullWidth
              margin="dense"
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Mô tả phòng ban"
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleFormSubmit}
          >
            {isEditing ? "Cập nhật" : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onClose={handleDeleteClose}>
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa phòng ban này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Hủy</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDeleteConfirm}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Container>
  );
};

export default DepartmentPage;
