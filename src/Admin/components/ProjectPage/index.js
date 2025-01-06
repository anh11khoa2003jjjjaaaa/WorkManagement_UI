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
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Delete, Add, Close } from "@mui/icons-material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import CameraAlt from '@mui/icons-material/CameraAlt';

const ProjectPage = () => {
  const [userId, setUserId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [userData, setUserData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    statusId: "",
    managerId: "",
    departmentId: "",
    images: [], // Mảng khởi tạo rỗng để tránh lỗi undefined
    imageIdsToDelete: []
  });
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    statusId: "",
    managerId: "",
    departmentId: "",
    images: "",
  });

  const formatToVietnameseDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Bạn chưa đăng nhập!");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userIdFromToken = decodedToken.AccountID;

      if (!userIdFromToken) {
        toast.error("Xác thực người dùng thất bại!");
        return;
      }

      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/api/accounts/getById/${userIdFromToken}`)
        .then((accountResponse) => {
          const accountData = accountResponse.data;
          if (accountData) {
            axios
              .get(`${process.env.REACT_APP_API_BASE_URL}/api/User/get/${accountData.userId}`)
              .then((userResponse) => {
                setUserData(userResponse.data);
                setUserData(accountData.userId);
              })
              .catch((error) => {
                toast.error("Không thể tải dữ liệu người dùng.");
                console.error(error);
              });
          } else {
            toast.error("Tài khoản không hợp lệ hoặc đã hết hạn.");
          }
        })
        .catch((error) => {
          toast.error("Lỗi khi tải dữ liệu tài khoản.");
          console.error(error);
        });
    } catch (error) {
      toast.error("Lỗi khi giải mã token!");
      console.error(error);
    }

    const fetchStatusJob = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/StatusJob`);
        setStatuses(response.data);
        // setTotalCount(response.data.totalCount);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }

    const fetchDepartment = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Department`);
        setDepartments(response.data);
        // setTotalCount(response.data.totalCount);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    }

    // const fetchProjects = async (page, pageSize) => {
    //   try {
    //     const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/projects/getAll`, { params: { page: page + 1, pageSize }, });
    //     setProjects(response.data.items);
    //     setTotalCount(response.data.totalItems);
    //   } catch (error) {
    //     console.error("Error fetching projects:", error);
    //   }
    // };

    const fetchManagers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/User/leaders`);
        setManagers(response.data);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };

    fetchProjects(page, rowsPerPage);
    fetchDepartment();
    fetchStatusJob();
    fetchManagers();
  }, [page, rowsPerPage]);

  const handleSearchChange = (e) => setSearch(e.target.value);

  const handlePageChange = (event, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleModalOpen = () => setIsModalOpen(true);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({ name: "", description: "", startDate: "", endDate: "", statusId: "", managerId: "", departmentId: "", images: [] });
    setErrors({ name: "", description: "", startDate: "", endDate: "", statusId: "", managerId: "", departmentId: "", images: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleEdit = async (projectId) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/projects/${projectId}`);
        const project = response.data;

        let projectImg = [];
        try {
          const responseImg = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/images/getByProjectId/${projectId}`);
          projectImg = Array.isArray(responseImg.data) ? responseImg.data : []; // Nếu dữ liệu không phải mảng, trả về mảng rỗng
        } catch (error) {
          console.warn("Không tìm thấy hình ảnh, trả về mảng rỗng:", error);
          projectImg = []; // Trong trường hợp lỗi, trả về mảng rỗng
        }
        

        // Hàm định dạng ngày
        const formatDate = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        // Xử lý formData
        setIsEditing(true);
        setEditingId(project.id);
        setFormData({
            name: project.name || "",
            description: project.description || "",
            startDate: project.startDate ? formatDate(project.startDate) : "",
            endDate: project.endDate ? formatDate(project.endDate) : "",
            statusId: project.statusId || "",
            managerId: project.managerId || "",
            departmentId: project.departmentId || "",
            images: Array.isArray(projectImg) && projectImg.length > 0 
                ? projectImg.map((img) => ({ file: null, preview: img })) 
                : [], // Nếu không có hình ảnh, trả về mảng rỗng
        });
        handleModalOpen();
    } catch (error) {
        console.error("Error fetching project details:", error);
        toast.error("Không thể tải dữ liệu dự án.");
    }
};


  const handleDeleteOpen = (projectId) => {
    setDeletingId(projectId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteModalOpen(false);
    setDeletingId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/projects/delete/${deletingId}`);
      toast.success("Xóa dự án thành công!");
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/projects/getAllPage`);
      setProjects(response.data);
      handleDeleteClose();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Lỗi khi xóa dự án.");
      handleDeleteClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Tên dự án không được để trống";
    }
    if (!formData.description || formData.description.trim() === "") {
      newErrors.description = "Mô tả không được để trống";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu không được để trống";
    } else if (new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.startDate = "Ngày bắt đầu không thể sau ngày kết thúc";
    }
    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc không được để trống";
    }
    if (!formData.statusId) {
      newErrors.statusId = "Trạng thái không được để trống";
    }
    if (!formData.managerId) {
      newErrors.managerId = "Quản lý không được để trống";
    }
    if (!formData.departmentId) {
      newErrors.departmentId = "Phòng ban không được để trống";
    }
    // if (formData.images.length === 0) {
    //   newErrors.images = "Vui lòng chọn ít nhất 1 ảnh.";
    // }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (formData.images.length + files.length > 3) {
      toast.error("Bạn chỉ có thể chọn tối đa 3 ảnh.");
      return;
    }
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
    if (formData.images.length > 0) {
      setErrors((prev) => ({
        ...prev,
        images: "",
      }));
    }
  };


  const handleRemoveImage = async (index) => {
    // Nếu chỉ còn 1 hình ảnh, không cho phép xóa
    if (formData.images.length === 1) {
      toast.warning("Không thể xóa hình ảnh này, phải có tối thiểu 1 ảnh!");
      return;
    }

    const imageToRemove = formData.images[index];


    // Xóa ảnh khỏi giao diện ngay lập tức
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      images: updatedImages,
    }));

    if (imageToRemove.preview && imageToRemove.preview.id) {
      // Nếu ảnh đã lưu trên server, gọi API để xóa
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL}/api/images/delete/${imageToRemove.preview.id}`
        );

        if (response.status === 200) {
          console.log("Ảnh đã được xóa thành công!");
        } else {
          // Nếu API trả về lỗi, khôi phục ảnh và hiển thị thông báo
          console.error("Không thể xóa ảnh. Vui lòng thử lại!");
          setFormData((prev) => ({
            ...prev,
            images: [...updatedImages.slice(0, index), imageToRemove, ...updatedImages.slice(index)],
          }));
        }
      } catch (error) {
        console.error("Đã xảy ra lỗi:", error);

        // Khôi phục ảnh khi xảy ra lỗi
        setFormData((prev) => ({
          ...prev,
          images: [...updatedImages.slice(0, index), imageToRemove, ...updatedImages.slice(index)],
        }));
      }
    }
  };
  const fetchProjects = async (page, pageSize) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/projects/getAll`, { params: { page: page + 1, pageSize }, });
      setProjects(response.data.items);
      setTotalCount(response.data.totalItems);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleFormSubmit = async () => {
    // Kiểm tra form hợp lệ
    if (!validateForm()) {
      toast.error("Form không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    // Định dạng ngày tháng
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      if (dateStr.includes("-")) return dateStr; // Nếu đã đúng định dạng ISO (yyyy-MM-dd)
      const [day, month, year] = dateStr.split("/");
      return `${year}-${month}-${day}`;
    };

    try {
      // Tạo FormData
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name?.trim() || "");
      formDataToSend.append("description", formData.description?.trim() || "");
      formDataToSend.append("startDate", formatDate(formData.startDate));
      formDataToSend.append("endDate", formatDate(formData.endDate));
      formDataToSend.append("statusId", formData.statusId || null);
      formDataToSend.append("managerId", formData.managerId || null);
      formDataToSend.append("departmentId", formData.departmentId || null);

      // Thêm danh sách ảnh
      console.log("Danh sách ảnh được chọn:"); // Thêm log để kiểm tra danh sách ảnh
      formData.images.forEach((image) => {
        if (image.file) {
          console.log("Hình ảnh được thêm:", formData.images); // In từng hình ảnh
          formDataToSend.append("images", image.file);
        }
      });

      // Thêm danh sách ảnh cần xóa (nếu có)
      if (formData.imageIdsToDelete?.length > 0) {
        console.log("Danh sách ID hình ảnh cần xóa:", formData.imageIdsToDelete);
        formData.imageIdsToDelete.forEach((id) => {
          formDataToSend.append("imageIdsToDelete[]", id);
        });
      }

      // Xác định phương thức và URL
      const method = isEditing ? "put" : "post";
      const url = isEditing
        ? `${process.env.REACT_APP_API_BASE_URL}/api/projects/update/${editingId}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/projects/create`;

      // Gửi dữ liệu tới API
      await axios({
        method,
        url,
        data: formDataToSend,
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Hiển thị thông báo thành công và cập nhật danh sách dự án
      toast.success(`${isEditing ? "Cập nhật" : "Thêm"} dự án thành công!`);
      handleModalClose();

      // Lấy lại danh sách dự án sau khi lưu thành công
      fetchProjects(page, rowsPerPage);
    } catch (error) {
      console.error("Error saving project:", error);

      // Hiển thị thông báo lỗi
      const errorMessage = error.response?.data?.message || "Lưu dự án thất bại.";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };


  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", my: 2 }}>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: "50%", marginRight: 2 }}
        />
        <Button variant="contained" color="success" startIcon={<Add />} onClick={handleModalOpen}>
          Thêm dự án
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Thuộc phòng ban</strong></TableCell>
              <TableCell><strong>Tên dự án</strong></TableCell>
              <TableCell><strong>Mô tả</strong></TableCell>
              <TableCell><strong>Quản lý</strong></TableCell>
              <TableCell><strong>Thời gian bắt đầu</strong></TableCell>
              <TableCell><strong>Thời gian kết thúc</strong></TableCell>
              <TableCell><strong>Hành động</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
               <TableCell>{project.department ? project.department.description : "Không thuộc phòng ban nào"}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.description}</TableCell>
                <TableCell>
                  {project.managerId === userId ? userData.name : project.manager?.name || "Chưa có quản lý"}
                </TableCell>
                <TableCell>{formatToVietnameseDate(project.startDate)}</TableCell>
                <TableCell>{formatToVietnameseDate(project.endDate)}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton color="primary" onClick={() => handleEdit(project.id)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDeleteOpen(project.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Số dòng mỗi trang"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} của ${count}`
        }
      />
      <Dialog open={isModalOpen} onClose={handleModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? "Chỉnh sửa dự án" : "Thêm dự án"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Tên dự án"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => handleFormChange("description", e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Ngày bắt đầu"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.startDate}
            onChange={(e) => handleFormChange("startDate", e.target.value)}
            error={!!errors.startDate}
            helperText={errors.startDate}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Ngày kết thúc"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.endDate}
            onChange={(e) => handleFormChange("endDate", e.target.value)}
            error={!!errors.endDate}
            helperText={errors.endDate}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <Select
            fullWidth
            value={formData.statusId}
            onChange={(e) => handleFormChange("statusId", e.target.value)}
            error={!!errors.statusId}
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              -- Chọn trạng thái --
            </MenuItem>
            {statuses.map((status) => (
              <MenuItem key={status.id} value={status.id}>
                {status.description}
              </MenuItem>
            ))}
          </Select>
          {errors.statusId && <Typography color="error">{errors.statusId}</Typography>}
          <Select
            fullWidth
            value={formData.managerId}
            onChange={(e) => handleFormChange("managerId", e.target.value)}
            error={!!errors.managerId}
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              -- Chọn quản lý --
            </MenuItem>
            {managers.map((manager) => (
              <MenuItem key={manager.id} value={manager.id}>
                {manager.name}
              </MenuItem>
            ))}
          </Select>
          {errors.managerId && <Typography color="error">{errors.managerId}</Typography>}
          <Select
            fullWidth
            value={formData.departmentId}
            onChange={(e) => handleFormChange("departmentId", e.target.value)}
            error={!!errors.departmentId}
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              -- Chọn phòng ban --
            </MenuItem>
            {departments.map((department) => (
              <MenuItem key={department.id} value={department.id}>
                {department.description}
              </MenuItem>
            ))}
          </Select>
          {errors.departmentId && <Typography color="error">{errors.departmentId}</Typography>}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CameraAlt />}
                component="label"
                disabled={formData.images.length >= 3}
              >
                Chọn ảnh
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </Button>
              <Typography variant="body2">
                Đã chọn: {formData.images.length}/3 ảnh
              </Typography>
            </Box>
            {formData.images.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  mt: 2,
                }}
              >
                {formData.images.map((image, index) => (
                  <Box key={index} sx={{ position: "relative" }}>
                   <img
  src={
    image.file
      ? URL.createObjectURL(image.file) // Hiển thị ảnh được chọn từ file
      : image.preview?.filePath // Hiển thị ảnh từ API nếu tồn tại
      ? `${process.env.REACT_APP_API_BASE_URL}${image.preview.filePath}` // Hiển thị ảnh từ server
      : "/path/to/default-image.jpg" // Hình ảnh mặc định nếu không có
  }
  alt={`uploaded-${index}`}
  style={{ width: 100, height: 100, borderRadius: 4 }}
/>

                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        color: "red",
                      }}
                      size="small"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
            {errors.images && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {errors.images}
              </Typography>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleModalClose} startIcon={<Close />}>
            Hủy
          </Button>
          <Button variant="contained" color="primary" onClick={handleFormSubmit}>
            {isEditing ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onClose={handleDeleteClose}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn xóa không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleDeleteClose}>
            Hủy
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Container>
  );
};

export default ProjectPage;