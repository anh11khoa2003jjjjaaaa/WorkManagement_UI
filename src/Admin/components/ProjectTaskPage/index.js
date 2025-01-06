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
import { Edit, Delete, Add, Close, PictureAsPdf } from "@mui/icons-material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import CameraAlt from '@mui/icons-material/CameraAlt';
import jsPDF from "jspdf";

import html2canvas from "html2canvas";
const ProjectTaskPage = () => {
  // const[projectTk,setProjectTK]=useState(null);
  const [iD, setID] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [userData, setUserData] = useState([]);
  const [projectsTask, setProjectsTask] = useState([]);
  const [projects, setProjects] = useState([]);
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
    statusId: "",
    projectId: "",
    images: [],
    imageIdsToDelete: []
  });
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    statusId: "",
    projectId: "",
    images: "",
  });



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
        console.error("Lỗi khi tải trạng thái công việc:", error);
      }
    }



    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/projects/getAllPage`);
        setProjects(response.data);
        // setTotalCount(response.data.totalCount);
      } catch (error) {
        console.error("Không thể tải công việc:", error);
      }
    };


    const fetchProjectsTask = async (page, pageSize) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/paged`, {
          params: { page: page + 1, pageSize }, // API nhận page 1-based index
        });

        setProjectsTask(response.data.items);
     
        // Lưu danh sách công việc
        setTotalCount(response.data.totalItems); // Cập nhật tổng số công việc
      } catch (error) {
        console.log(iD);
        console.error("Không thể tải công việc:", error);
      }
    };

    // const fetchProjectsTaskID = async () => {
    //   try {
    //     const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/${iD}`)

    //     setProjectTK(response.data); // Lưu danh sách công việc
    //     // Cập nhật tổng số công việc
    //   } catch (error) {
    //     console.error("Không thể tải công việc:", error);
    //   }
    // };

    const handlePageChange = (event, newPage) => {
      setPage(newPage); // Cập nhật trang
    };

    const handleRowsPerPageChange = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10)); // Cập nhật số hàng trên mỗi trang
      setPage(0); // Reset về trang đầu khi thay đổi số hàng
    };

    // fetchProjectsTaskID();
    fetchProjectsTask(page, rowsPerPage);
    // fetchProjectsTask();
    fetchProjects();
    fetchStatusJob();

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
    setFormData({ name: "", description: "", statusId: "", projectId: "", images: [] });
    setErrors({ name: "", description: "", statusId: "", projectId: "", images: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleEdit = async (projectTaskId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/${projectTaskId}`);
      const projectTask = response.data;

      let projectTaskImg = [];
        try {
          const responseImg = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/images/getByTaskId/${projectTaskId}`);
          projectTaskImg = Array.isArray(responseImg.data) ? responseImg.data : []; // Nếu dữ liệu không phải mảng, trả về mảng rỗng
        } catch (error) {
          console.warn("Không tìm thấy hình ảnh, trả về mảng rỗng:", error);
          projectTaskImg = []; // Trong trường hợp lỗi, trả về mảng rỗng
        }

      setIsEditing(true);
      setEditingId(projectTask.id);
      setFormData({
        name: projectTask.name || "",
        description: projectTask.description || "",
        statusId: projectTask.statusId || "",
        projectId: projectTask.projectId || "",
        images: projectTaskImg.map((img) => ({ file: null, preview: img })),
      });
      handleModalOpen();
    } catch (error) {
      console.error("Error fetching project details:", error);
      toast.error("Không thể tải dữ liệu công việc.");
    }
  };

  const handleDeleteOpen = (projectTaskId) => {
    setDeletingId(projectTaskId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteModalOpen(false);
    setDeletingId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/${deletingId}`);
      toast.success("Xóa dự án thành công!");
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask`);
      setProjectsTask(response.data);
      handleDeleteClose();
    } catch (error) {
      console.error("Lỗi khi xóa công việc:", error);
      toast.error("Lỗi khi xóa công việc.");
      handleDeleteClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Không để trống công việc";
    }
    if (!formData.description || formData.description.trim() === "") {
      newErrors.description = "Mô tả không được để trống";
    }

    if (!formData.statusId) {
      newErrors.statusId = "Trạng thái không được để trống";
    }
    if (!formData.projectId) {
      newErrors.projectId = "Không được để trống dự án";
    }
    if (formData.images.length === 0) {
      newErrors.images = "Vui lòng chọn ít nhất 1 ảnh.";
    }
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


  const handleFormSubmit = async () => {
    // Kiểm tra form hợp lệ
    if (!validateForm()) {
      toast.error("Form không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }
    try {
      // Tạo FormData
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name?.trim() || "");
      formDataToSend.append("description", formData.description?.trim() || "");
      formDataToSend.append("statusId", formData.statusId || null);
      formDataToSend.append("projectId", formData.projectId || null);

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
        ? `${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/${editingId}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask`;

      // Gửi dữ liệu tới API
      await axios({
        method,
        url,
        data: formDataToSend,
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Hiển thị thông báo thành công và cập nhật danh sách dự án
      toast.success(`${isEditing ? "Cập nhật" : "Thêm"} công việc thành công!`);
      handleModalClose();

      // Lấy lại danh sách dự án sau khi lưu thành công
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask`);
      setProjectsTask(response.data);
    } catch (error) {
      console.error("Lỗi khi lưu công việc:", error);

      // Hiển thị thông báo lỗi
      const errorMessage = error.response?.data?.message || "Lưu công việc thất bại.";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };
 
  const filteredProjectsTask = projectsTask.filter((projectTask) =>
    projectTask.name.toLowerCase().includes(search.toLowerCase())
  );

  const fetchImagesByTaskId = async (taskId) => {
    try {
      // const response = await axios.get(`https://localhost:7093/api/images/getByTaskId/${taskId}`);
      // return response.data; // Giả sử API trả về mảng URL ảnh
      let projectImg = [];
        try {
          const responseImg = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/images/getByTaskId/${taskId}`);
          projectImg = Array.isArray(responseImg.data) ? responseImg.data : []; // Nếu dữ liệu không phải mảng, trả về mảng rỗng
        } catch (error) {
          console.warn("Không tìm thấy hình ảnh, trả về mảng rỗng:", error);
          projectImg = []; // Trong trường hợp lỗi, trả về mảng rỗng
        }
    } catch (error) {
      console.error("Lỗi khi lấy hình ảnh:", error);
      return [];
    }
  };

 
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Đảm bảo rằng CORS được thiết lập
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(error);
    });
};

const handleExportPDF = async (projectTask) => {
    try {
        const images = await fetchImagesByTaskId(projectTask.id);
        const imagePromises = images.map((img) => loadImage(`https://localhost:7093${img.filePath}`));
        const loadedImages = await Promise.all(imagePromises);

        const contentHTML = `
            <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #fff;">
                <h2 style="text-align: center; margin-bottom: 20px;">${projectTask.name}</h2>
                <p><strong>Mô tả:</strong> ${projectTask.description}</p>
                <p><strong>Thuộc dự án:</strong> ${projectTask.project?.name || "Chưa rõ"}</p>
                <p><strong>Trạng thái:</strong> ${projectTask.status?.description || "Chưa rõ"}</p>
                <div>
                    ${loadedImages
                        .map(
                            (image, index) =>
                                `<img 
                                    src="${image.src}" 
                                    alt="Hình ảnh ${index + 1}" 
                                    style="width: 100%; max-height: 400px; margin: 10px 0; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;"
                                />`
                        )
                        .join("")}
                </div>
            </div>
        `;

        const pdf = new jsPDF("p", "mm", "a4");
        pdf.html(contentHTML, {
            callback: function (doc) {
                doc.save(`${projectTask.name}.pdf`);
            },
            x: 10,
            y: 10,
            autoPaging: true,
            useCORS: true,
        });
    } catch (error) {
        console.error("Lỗi khi xuất PDF:", error);
    }
};
  
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
          Thêm công việc
        </Button>
      </Box>

      <TableContainer component={Paper}>
        {/* <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Công việc</strong></TableCell>
              <TableCell><strong>Mô tả</strong></TableCell>
              <TableCell><strong>Thuộc dự án</strong></TableCell>
              <TableCell><strong>Trạng thái</strong></TableCell>
              <TableCell><strong>Hành động</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjectsTask.map((projectTask) => (
              <TableRow key={projectTask.id}>

                <TableCell>{projectTask.name}</TableCell>
                <TableCell>{projectTask.description}</TableCell>
                <TableCell>{projectTask.project.name}</TableCell>
                <TableCell>{projectTask.status.description}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton color="primary" onClick={() => handleEdit(projectTask.id)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDeleteOpen(projectTask.id)}>
                      <Delete />
                    </IconButton>
                    <IconButton color="default" onClick={() => handleExportPDF(projectTask)}>
                  <PictureAsPdf />
                </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table> */}
       <Table>
  <TableHead>
    <TableRow>
      <TableCell><strong>Công việc</strong></TableCell>
      <TableCell><strong>Mô tả</strong></TableCell>
      <TableCell><strong>Thuộc dự án</strong></TableCell>
      <TableCell><strong>Trạng thái</strong></TableCell>
      <TableCell><strong>Hành động</strong></TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {filteredProjectsTask.map((projectTask) => (
      <TableRow key={projectTask.id}>
        {/* Các cột hiển thị công việc */}
        <TableCell>{projectTask.name}</TableCell>
        <TableCell>{projectTask.description}</TableCell>
        <TableCell>{projectTask.project?.name || "Chưa rõ"}</TableCell>
        <TableCell>{projectTask.status?.description || "Chưa rõ"}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton color="primary" onClick={() => handleEdit(projectTask.id)}>
              <Edit />
            </IconButton>
            <IconButton color="secondary" onClick={() => handleDeleteOpen(projectTask.id)}>
              <Delete />
            </IconButton>
            {/* <IconButton color="default" onClick={() => handleExportPDF(projectTask)}>
              <PictureAsPdf />
            </IconButton> */}
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
        <DialogTitle>{isEditing ? "Chỉnh sửa công việc" : "Thêm công việc"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Công việc"
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
            value={formData.projectId}
            onChange={(e) => handleFormChange("projectId", e.target.value)}
            error={!!errors.projectId}
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              -- Thuộc dự án --
            </MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
          {errors.projectId && <Typography color="error">{errors.projectId}</Typography>}


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
                          ? URL.createObjectURL(image.file)
                          : `${process.env.REACT_APP_API_BASE_URL}${image.preview.filePath}`
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
          <Typography>Bạn có chắc muốn xóa công việc này?</Typography>
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

export default ProjectTaskPage;
// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Button,
//   TablePagination,
//   TextField,
//   Container,
//   Box,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Typography,
//   Grid,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { Edit, Delete, Add, Close, PictureAsPdf } from "@mui/icons-material";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { jwtDecode } from "jwt-decode";
// import CameraAlt from '@mui/icons-material/CameraAlt';
// import domtoimage from 'dom-to-image';
// import { jsPDF } from 'jspdf';
// import html2canvas from "html2canvas";
// const ProjectTaskPage = () => {
//   const [projectTk, setProjectTK] = useState(null);
//   const [iD, setID] = useState(null);
//   const [statuses, setStatuses] = useState([]);
//   const [userData, setUserData] = useState([]);
//   const [projectsTask, setProjectsTask] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [totalCount, setTotalCount] = useState(0);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     statusId: "",
//     projectId: "",
//     images: [],
//     imageIdsToDelete: []
//   });
//   const [errors, setErrors] = useState({
//     name: "",
//     description: "",
//     statusId: "",
//     projectId: "",
//     images: "",
//   });

//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     if (!token) {
//       toast.error("Bạn chưa đăng nhập!");
//       return;
//     }

//     try {
//       const decodedToken = jwtDecode(token);
//       const userIdFromToken = decodedToken.AccountID;

//       if (!userIdFromToken) {
//         toast.error("Xác thực người dùng thất bại!");
//         return;
//       }

//       axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/accounts/getById/${userIdFromToken}`)
//         .then((accountResponse) => {
//           const accountData = accountResponse.data;
//           if (accountData) {
//             axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/User/get/${accountData.userId}`)
//               .then((userResponse) => {
//                 setUserData(userResponse.data);
//               })
//               .catch((error) => {
//                 toast.error("Không thể tải dữ liệu người dùng.");
//                 console.error(error);
//               });
//           } else {
//             toast.error("Tài khoản không hợp lệ hoặc đã hết hạn.");
//           }
//         })
//         .catch((error) => {
//           toast.error("Lỗi khi tải dữ liệu tài khoản.");
//           console.error(error);
//         });
//     } catch (error) {
//       toast.error("Lỗi khi giải mã token!");
//       console.error(error);
//     }

//     const fetchStatusJob = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/StatusJob`);
//         setStatuses(response.data);
//       } catch (error) {
//         console.error("Lỗi khi tải trạng thái công việc:", error);
//       }
//     };

//     const fetchProjects = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/projects/getAllPage`);
//         setProjects(response.data);
//       } catch (error) {
//         console.error("Không thể tải công việc:", error);
//       }
//     };

//     const fetchProjectsTask = async (page, pageSize) => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/paged`, {
//           params: { page: page + 1, pageSize },
//         });
//         setProjectsTask(response.data.items);
//         setTotalCount(response.data.totalItems);
//       } catch (error) {
//         console.error("Không thể tải công việc:", error);
//       }
//     };

//     fetchProjectsTask(page, rowsPerPage);
//     fetchProjects();
//     fetchStatusJob();
//   }, [page, rowsPerPage]);

//   const handleSearchChange = (e) => setSearch(e.target.value);

//   const handlePageChange = (event, newPage) => setPage(newPage);

//   const handleRowsPerPageChange = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const handleModalOpen = () => setIsModalOpen(true);

//   const handleModalClose = () => {
//     setIsModalOpen(false);
//     setFormData({ name: "", description: "", statusId: "", projectId: "", images: [] });
//     setErrors({ name: "", description: "", statusId: "", projectId: "", images: "" });
//     setIsEditing(false);
//     setEditingId(null);
//   };

//   const handleFormChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     setErrors((prev) => ({ ...prev, [field]: "" }));
//   };

//   const handleEdit = async (projectTaskId) => {
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/${projectTaskId}`);
//       const projectTask = response.data;

//       const responseImg = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/images/getByTaskId/${projectTaskId}`);
//       const projectTaskImg = responseImg.data;

//       setIsEditing(true);
//       setEditingId(projectTask.id);
//       setFormData({
//         name: projectTask.name || "",
//         description: projectTask.description || "",
//         statusId: projectTask.statusId || "",
//         projectId: projectTask.projectId || "",
//         images: projectTaskImg.map((img) => ({ file: null, preview: img })),
//       });
//       handleModalOpen();
//     } catch (error) {
//       console.error("Error fetching project details:", error);
//       toast.error("Không thể tải dữ liệu công việc.");
//     }
//   };

//   const handleDeleteOpen = (projectTaskId) => {
//     setDeletingId(projectTaskId);
//     setIsDeleteModalOpen(true);
//   };

//   const handleDeleteClose = () => {
//     setIsDeleteModalOpen(false);
//     setDeletingId(null);
//   };

//   const handleDeleteConfirm = async () => {
//     try {
//       await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/${deletingId}`);
//       toast.success("Xóa dự án thành công!");
//       const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask`);
//       setProjectsTask(response.data);
//       handleDeleteClose();
//     } catch (error) {
//       console.error("Lỗi khi xóa công việc:", error);
//       toast.error("Lỗi khi xóa công việc.");
//       handleDeleteClose();
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.name || formData.name.trim() === "") {
//       newErrors.name = "Không để trống công việc";
//     }
//     if (!formData.description || formData.description.trim() === "") {
//       newErrors.description = "Mô tả không được để trống";
//     }
//     if (!formData.statusId) {
//       newErrors.statusId = "Trạng thái không được để trống";
//     }
//     if (!formData.projectId) {
//       newErrors.projectId = "Không được để trống dự án";
//     }
//     if (formData.images.length === 0) {
//       newErrors.images = "Vui lòng chọn ít nhất 1 ảnh.";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleFileChange = (event) => {
//     const files = Array.from(event.target.files);
//     if (formData.images.length + files.length > 3) {
//       toast.error("Bạn chỉ có thể chọn tối đa 3 ảnh.");
//       return;
//     }
//     const newImages = files.map((file) => ({
//       file,
//       preview: URL.createObjectURL(file),
//     }));
//     setFormData((prev) => ({
//       ...prev,
//       images: [...prev.images, ...newImages],
//     }));
//     if (formData.images.length > 0) {
//       setErrors((prev) => ({
//         ...prev,
//         images: "",
//       }));
//     }
//   };

//   const handleRemoveImage = async (index) => {
//     if (formData.images.length === 1) {
//       toast.warning("Không thể xóa hình ảnh này, phải có tối thiểu 1 ảnh!");
//       return;
//     }

//     const updatedImages = formData.images.filter((_, i) => i !== index);
//     setFormData((prev) => ({
//       ...prev,
//       images: updatedImages,
//     }));
//   };

//   const handleFormSubmit = async () => {
//     if (!validateForm()) {
//       toast.error("Form không hợp lệ. Vui lòng kiểm tra lại.");
//       return;
//     }
//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append("name", formData.name?.trim() || "");
//       formDataToSend.append("description", formData.description?.trim() || "");
//       formDataToSend.append("statusId", formData.statusId || null);
//       formDataToSend.append("projectId", formData.projectId || null);

//       formData.images.forEach((image) => {
//         if (image.file) {
//           formDataToSend.append("images", image.file);
//         }
//       });

//       const method = isEditing ? "put" : "post";
//       const url = isEditing
//         ? `${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/${editingId}`
//         : `${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask`;

//       await axios({
//         method,
//         url,
//         data: formDataToSend,
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       toast.success(`${isEditing ? "Cập nhật" : "Thêm"} công việc thành công!`);
//       handleModalClose();

//       const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask`);
//       setProjectsTask(response.data);
//     } catch (error) {
//       console.error("Lỗi khi lưu công việc:", error);
//       const errorMessage = error.response?.data?.message || "Lưu công việc thất bại.";
//       toast.error(`Lỗi: ${errorMessage}`);
//     }
//   };

//   const filteredProjectsTask = projectsTask.filter((projectTask) =>
//     projectTask.name.toLowerCase().includes(search.toLowerCase())
//   );
//   const fetchImagesByTaskId = async (taskId) => {
//     try {
//       const response = await axios.get(`https://localhost:7093/api/images/getByTaskId/${taskId}`, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
  
//       if (!response.data || !Array.isArray(response.data)) {
//         throw new Error("API trả về dữ liệu không hợp lệ.");
//       }
  
//       // Trả về danh sách ảnh với URL đầy đủ
//       return response.data.map((image) => ({
//         ...image,
//         fullPath: `https://localhost:7093${image.filePath}`, // Ghép domain vào filePath
//       }));
//     } catch (error) {
//       console.error("Lỗi khi lấy danh sách hình ảnh:", error);
//       return [];
//     }
//   };
  
//   const handleExportPDF = async (projectTask) => {
//     try {
//       const images = await fetchImagesByTaskId(projectTask.id);
  
//       if (images.length === 0) {
//         console.error("Không có hình ảnh.");
//         return;
//       }
  
//       // Tạo container DOM chứa nội dung và hình ảnh
//       const container = document.createElement("div");
//       container.style.padding = "20px";
//       container.style.fontFamily = "Arial, sans-serif";
//       container.style.backgroundColor = "#fff";
//       container.style.width = "800px";
//       container.style.margin = "0 auto";
  
//       container.innerHTML = `
//         <div>
//           <h2 style="text-align: center; margin-bottom: 20px;">${projectTask.name}</h2>
//           <p><strong>Mô tả:</strong> ${projectTask.description}</p>
//           <p><strong>Thuộc dự án:</strong> ${projectTask.project?.name || "Chưa rõ"}</p>
//           <p><strong>Trạng thái:</strong> ${projectTask.status?.description || "Chưa rõ"}</p>
//           <div>
//             ${images
//               .map(
//                 (image) =>
//                   `<img src="${image.fullPath}" alt="Hình ảnh" 
//                     style="width: 100%; max-height: 400px; margin: 10px 0; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;" />`
//               )
//               .join("")}
//           </div>
//         </div>
//       `;
  
//       document.body.appendChild(container);
  
//       // Đợi một chút để hình ảnh được tải đầy đủ
//       await new Promise((resolve) => setTimeout(resolve, 1000));
  
//       // Sử dụng html2canvas để chụp ảnh màn hình DOM
//       const canvas = await html2canvas(container, {
//         scale: 2, // Tăng chất lượng hình ảnh
//         useCORS: true, // Cho phép tải ảnh từ domain khác nếu được cấu hình CORS
//       });
  
//       const imgData = canvas.toDataURL("image/png");
  
//       // Tạo PDF và thêm hình ảnh
//       const pdf = new jsPDF("p", "mm", "a4");
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
//       // Kiểm tra nếu nội dung dài hơn 1 trang
//       if (pdfHeight > pdf.internal.pageSize.getHeight()) {
//         let position = 0;
//         while (position < canvas.height) {
//           const section = canvas.getContext("2d").getImageData(0, position, canvas.width, canvas.height / 2);
//           pdf.addImage(section, "PNG", 0, 0, pdfWidth, pdfHeight);
//           position += canvas.height / 2;
//           if (position < canvas.height) pdf.addPage();
//         }
//       } else {
//         pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//       }
  
//       pdf.save(`${projectTask.name}.pdf`);
//       document.body.removeChild(container);
//     } catch (error) {
//       console.error("Lỗi khi xuất PDF:", error);
//     }
//   };
  
//   return (
//     <Container>
//       <Box sx={{ display: "flex", justifyContent: "space-between", my: 2 }}>
//         <TextField
//           label="Tìm kiếm"
//           variant="outlined"
//           value={search}
//           onChange={handleSearchChange}
//           sx={{ width: "50%", marginRight: 2 }}
//         />
//         <Button variant="contained" color="success" startIcon={<Add />} onClick={handleModalOpen}>
//           Thêm công việc
//         </Button>
//       </Box>

//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell><strong>Công việc</strong></TableCell>
//               <TableCell><strong>Mô tả</strong></TableCell>
//               <TableCell><strong>Thuộc dự án</strong></TableCell>
//               <TableCell><strong>Trạng thái</strong></TableCell>
//               <TableCell><strong>Hành động</strong></TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredProjectsTask.map((projectTask) => (
//               <TableRow key={projectTask.id}>
//                 <TableCell>{projectTask.name}</TableCell>
//                 <TableCell>{projectTask.description}</TableCell>
//                 <TableCell>{projectTask.project?.name || "Chưa rõ"}</TableCell>
//                 <TableCell>{projectTask.status?.description || "Chưa rõ"}</TableCell>
//                 <TableCell>
//                   <Box sx={{ display: "flex", gap: 1 }}>
//                     <IconButton color="primary" onClick={() => handleEdit(projectTask.id)}>
//                       <Edit />
//                     </IconButton>
//                     <IconButton color="secondary" onClick={() => handleDeleteOpen(projectTask.id)}>
//                       <Delete />
//                     </IconButton>
//                     <IconButton color="default" onClick={() => handleExportPDF(projectTask)}>
//                       <PictureAsPdf />
//                     </IconButton>
//                   </Box>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <TablePagination
//         component="div"
//         count={totalCount}
//         page={page}
//         onPageChange={handlePageChange}
//         rowsPerPage={rowsPerPage}
//         onRowsPerPageChange={handleRowsPerPageChange}
//         rowsPerPageOptions={[5, 10, 25]}
//         labelRowsPerPage="Số dòng mỗi trang"
//         labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
//       />

//       <Dialog open={isModalOpen} onClose={handleModalClose} maxWidth="sm" fullWidth>
//         <DialogTitle>{isEditing ? "Chỉnh sửa công việc" : "Thêm công việc"}</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="Công việc"
//             fullWidth
//             variant="outlined"
//             value={formData.name}
//             onChange={(e) => handleFormChange("name", e.target.value)}
//             error={!!errors.name}
//             helperText={errors.name}
//             sx={{ mb: 2 }}
//           />
//           <TextField
//             label="Mô tả"
//             fullWidth
//             multiline
//             rows={3}
//             variant="outlined"
//             value={formData.description}
//             onChange={(e) => handleFormChange("description", e.target.value)}
//             error={!!errors.description}
//             helperText={errors.description}
//             sx={{ mb: 2 }}
//           />
//           <Select
//             fullWidth
//             value={formData.statusId}
//             onChange={(e) => handleFormChange("statusId", e.target.value)}
//             error={!!errors.statusId}
//             displayEmpty
//             sx={{ mb: 2 }}
//           >
//             <MenuItem value="" disabled>-- Chọn trạng thái --</MenuItem>
//             {statuses.map((status) => (
//               <MenuItem key={status.id} value={status.id}>
//                 {status.description}
//               </MenuItem>
//             ))}
//           </Select>
//           {errors.statusId && <Typography color="error">{errors.statusId}</Typography>}
//           <Select
//             fullWidth
//             value={formData.projectId}
//             onChange={(e) => handleFormChange("projectId", e.target.value)}
//             error={!!errors.projectId}
//             displayEmpty
//             sx={{ mb: 2 }}
//           >
//             <MenuItem value="" disabled>-- Thuộc dự án --</MenuItem>
//             {projects.map((project) => (
//               <MenuItem key={project.id} value={project.id}>
//                 {project.name}
//               </MenuItem>
//             ))}
//           </Select>
//           {errors.projectId && <Typography color="error">{errors.projectId}</Typography>}
//           <Grid item xs={12}>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//               <Button
//                 variant="outlined"
//                 startIcon={<CameraAlt />}
//                 component="label"
//                 disabled={formData.images.length >= 3}
//               >
//                 Chọn ảnh
//                 <input
//                   type="file"
//                   hidden
//                   accept="image/*"
//                   multiple
//                   onChange={handleFileChange}
//                 />
//               </Button>
//               <Typography variant="body2">Đã chọn: {formData.images.length}/3 ảnh</Typography>
//             </Box>
//             {formData.images.length > 0 && (
//               <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
//                 {formData.images.map((image, index) => (
//                   <Box key={index} sx={{ position: "relative" }}>
//                     <img
//                       src={
//                         image.file
//                           ? URL.createObjectURL(image.file)
//                           : `${process.env.REACT_APP_API_BASE_URL}${image.preview.filePath}`
//                       }
//                       alt={`uploaded-${index}`}
//                       style={{ width: 100, height: 100, borderRadius: 4 }}
//                     />
//                     <IconButton
//                       sx={{ position: "absolute", top: 0, right: 0, color: "red" }}
//                       size="small"
//                       onClick={() => handleRemoveImage(index)}
//                     >
//                       <Close />
//                     </IconButton>
//                   </Box>
//                 ))}
//               </Box>
//             )}
//             {errors.images && (
//               <Typography color="error" variant="body2" sx={{ mt: 1 }}>
//                 {errors.images}
//               </Typography>
//             )}
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button variant="outlined" onClick={handleModalClose} startIcon={<Close />}>
//             Hủy
//           </Button>
//           <Button variant="contained" color="primary" onClick={handleFormSubmit}>
//             {isEditing ? "Cập nhật" : "Thêm"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={isDeleteModalOpen} onClose={handleDeleteClose}>
//         <DialogTitle>Xác nhận xóa</DialogTitle>
//         <DialogContent>
//           <Typography>Bạn có chắc muốn xóa công việc này?</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button variant="outlined" onClick={handleDeleteClose}>Hủy</Button>
//           <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Xóa</Button>
//         </DialogActions>
//       </Dialog>

//       <ToastContainer />
//     </Container>
//   );
// };

// export default ProjectTaskPage;