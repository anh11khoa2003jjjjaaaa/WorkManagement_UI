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


const TaskEmployeePage = () => {
  const [currentTask, setCurrentTask] = useState([]);
  const [taskNoSelect, setTaskNoSelect] = useState([]);
  const [usersForTask, setUsersForTask] = useState([]);
  const [user, setUser] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [userData, setUserData] = useState([]);
  const [taskEmployee, setTaskEmployee] = useState([]);
  const [projectsTask, setProjectsTask] = useState([]);
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
    taskId: "",
    userId: "",
    assignedAt: "",
    statusId: "",
    deadline: "",
    completionDate: "",
    penaltyStatus: "",

  });
  const [errors, setErrors] = useState({
    taskId: "",
    userId: "",
    assignedAt: "",
    statusId: "",
    deadline: "",
    completionDate: "",
    penaltyStatus: "",
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

      } catch (error) {
        console.error("Lỗi khi tải trạng thái công việc:", error);
      }
    };

    const fetchProjectsTask = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask`);
        const projectsData = response.data;

        setProjectsTask(projectsData); // Cập nhật danh sách ProjectTask
      } catch (error) {
        console.error("Không thể tải công việc:", error);
      }
    };



    const fetchTaskEmployee = async (page, pageSize) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/page`,
          {
            params: { page: page + 1, pageSize },

          }
        );
        setTaskEmployee(response.data.items);
        setTotalCount(response.data.totalItems);
        console.log(response.data.totalItems);
      } catch (error) {
        console.error("Không thể tải công việc:", error);
      }
    };

    // Gọi các hàm cần thiết
    fetchProjectsTask();
    fetchStatusJob();
    fetchTaskEmployee();
    fetchUsersByTaskId();
  }, [page, rowsPerPage]);

  // Theo dõi sự thay đổi của projectsTask để gọi fetchUser
  useEffect(() => {

    const fetchUser = async (taskIds) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/User`);
        setUser(response.data);

      } catch (error) {
        console.error("Không thể tải người dùng:", error);
      }
    };
    if (projectsTask.length > 0) {
      const projectIds = projectsTask.map((project) => project.id); // Lấy danh sách id từ projectsTask
      fetchUser(projectIds);
    }
  }, [projectsTask]); // Khi projectsTask thay đổi, gọi fetchUser


  const fetchTaskNoSelect = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/available-tasks`);
      setTaskNoSelect(response.data);
    } catch (error) {
      console.error("Error fetching available tasks:", error);
    }
  };

  // Gọi hàm fetch khi component mount
  useEffect(() => {
    fetchTaskNoSelect();
  }, []);

  const fetchUsersByTaskId = async (taskId) => {
    if (!taskId) return; // Không làm gì nếu taskId rỗng
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/User/by-task/${taskId}`);
      console.log("Users for task:", response.data); // Debug danh sách người dùng
      setUsersForTask(response.data); // Cập nhật danh sách người dùng
    } catch (error) {
      console.error("Không thể tải danh sách người dùng cho công việc:", error);
      toast.error("Không thể tải danh sách người dùng cho công việc.");
    }
  };


  const handleSearchChange = (e) => setSearch(e.target.value);

  const handlePageChange = (event, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleModalOpen = () => setIsModalOpen(true);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({
      taskId: "",
      userId: "",
      assignedAt: "",
      statusId: "",
      deadline: "",
      completionDate: "",
      penaltyStatus: "",
    });
    setErrors({
      taskId: "",
      userId: "",
      assignedAt: "",
      statusId: "",
      deadline: "",
      completionDate: "",
      penaltyStatus: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };



  const handleEdit = async (projectTaskEmployeeId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/TaskEmployee/${projectTaskEmployeeId}`);
      const projectTaskEmp = response.data;

      // Lấy danh sách người phụ trách theo Task ID
      await fetchUsersByTaskId(projectTaskEmp.taskId);

      // Kiểm tra và thêm công việc hiện tại vào danh sách `taskNoSelect` nếu chưa có
      const taskExists = taskNoSelect.some((task) => task.id === projectTaskEmp.taskId);
      if (!taskExists) {
        const taskResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/${projectTaskEmp.taskId}`);
        const currentTask = taskResponse.data;
        setTaskNoSelect((prev) => [...prev, currentTask]);
      }

      setIsEditing(true);
      setEditingId(projectTaskEmp.id);
      setFormData({
        taskId: projectTaskEmp.taskId || "", // Gán giá trị công việc hiện tại
        userId: projectTaskEmp.user?.id || "", // Lưu người phụ trách hiện tại
        assignedAt: projectTaskEmp.assignedAt || "",
        statusId: projectTaskEmp.statusId || "",
        deadline: projectTaskEmp.deadline || "",
        completionDate: projectTaskEmp.completionDate || "",
        penaltyStatus: projectTaskEmp.penaltyStatus || "",
      });

      // Nếu người phụ trách không có trong danh sách, thêm vào
      if (projectTaskEmp.user && !usersForTask.some((usr) => usr.id === projectTaskEmp.user.id)) {
        setUsersForTask((prev) => [...prev, projectTaskEmp.user]);
      }

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
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/TaskEmployee/${deletingId}`);
      toast.success("Xóa dự án thành công!");
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/TaskEmployee`);
      setTaskEmployee(response.data);
      handleDeleteClose();
    } catch (error) {
      console.error("Lỗi khi xóa công việc:", error);
      toast.error("Lỗi khi xóa công việc.");
      handleDeleteClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Kiểm tra taskId
    if (!formData.taskId || formData.taskId === "") {
      newErrors.taskId = "Mã công việc không được để trống.";
    }

    // Kiểm tra userId
    if (!formData.userId || formData.userId === "") {
      newErrors.userId = "Mã người dùng không được để trống.";
    }

    // Kiểm tra assignedAt
    if (!formData.assignedAt || formData.assignedAt === "") {
      newErrors.assignedAt = "Ngày giao việc không được để trống.";
    } else if (isNaN(Date.parse(formData.assignedAt))) {
      newErrors.assignedAt = "Ngày giao việc không hợp lệ.";
    }

    // Kiểm tra statusId
    if (!formData.statusId || formData.statusId === "") {
      newErrors.statusId = "Trạng thái không được để trống.";
    }

    // Kiểm tra deadline
    if (!formData.deadline || formData.deadline === "") {
      newErrors.deadline = "Hạn chót không được để trống.";
    } else if (isNaN(Date.parse(formData.deadline))) {
      newErrors.deadline = "Hạn chót không hợp lệ.";
    }

    // Kiểm tra completionDate (có thể để trống)
    if (formData.completionDate && isNaN(Date.parse(formData.completionDate))) {
      newErrors.completionDate = "Ngày hoàn thành không hợp lệ.";
    }

    // // Kiểm tra penaltyStatus
    // if (formData.penaltyStatus !== true && formData.penaltyStatus !== false) {
    //   newErrors.penaltyStatus = "Trạng thái phạt không hợp lệ.";
    // }

    // Cập nhật lỗi vào state
    setErrors(newErrors);

    // Trả về true nếu không có lỗi, false nếu có lỗi
    return Object.keys(newErrors).length === 0;
  };


  const handleFormSubmit = async () => {
    // Kiểm tra form hợp lệ
    if (!validateForm()) {
      toast.error("Form không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    try {
      // Tạo đối tượng dữ liệu JSON
      const formDataToSend = {
        taskId: formData.taskId ? parseInt(formData.taskId, 10) : null,
        userId: formData.userId ? parseInt(formData.userId, 10) : null,
        assignedAt: formData.assignedAt ? new Date(formData.assignedAt).toISOString() : null,
        completionDate: formData.completionDate ? new Date(formData.completionDate).toISOString() : null,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        statusId: formData.statusId ? parseInt(formData.statusId, 10) : null,
        penaltyStatus: formData.penaltyStatus === "" ? null : JSON.parse(formData.penaltyStatus),
      };

      // Xác định phương thức và URL
      const method = isEditing ? "put" : "post";
      const url = isEditing
        ? `${process.env.REACT_APP_API_BASE_URL}/api/TaskEmployee/${editingId}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/TaskEmployee`;

      // Gửi dữ liệu tới API
      await axios({
        method,
        url,
        data: formDataToSend,
        headers: { "Content-Type": "application/json" },
      });

      // Hiển thị thông báo thành công
      toast.success(`${isEditing ? "Cập nhật" : "Thêm"} công việc thành công!`);
      handleModalClose();

      // Lấy lại danh sách công việc
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/TaskEmployee`);
      setTaskEmployee(response.data);
      // Làm mới danh sách công việc chưa được chọn
      await fetchTaskNoSelect();
    } catch (error) {
      console.error("Lỗi khi lưu công việc:", error);

      // Hiển thị thông báo lỗi
      const errorMessage = error.response?.data?.message || "Lưu công việc thất bại.";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };



  const filteredTaskEmployee = taskEmployee.filter((taskemployee) =>
    taskemployee.taskName.toLowerCase().includes(search.toLowerCase())

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
          Phân công công việc
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Công việc</strong></TableCell>
              <TableCell><strong>Người đảm nhiệm</strong></TableCell>
              <TableCell><strong>Thời gian bắt đầu</strong></TableCell>
              <TableCell><strong>Thời gian hoàn thành</strong></TableCell>
              <TableCell><strong>Deadline</strong></TableCell>
              <TableCell><strong>Trạng thái</strong></TableCell>
              <TableCell><strong>Kết quả</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTaskEmployee?.map((taskemp) => (
              <TableRow key={taskemp.id}>
                <TableCell>{taskemp.taskName}</TableCell>
                <TableCell>{taskemp.userName}</TableCell>

                <TableCell>
                  {new Intl.DateTimeFormat('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'Asia/Ho_Chi_Minh'
                  }).format(new Date(taskemp.assignedAt))}
                </TableCell>
                <TableCell>
                  {taskemp.completionDate
                    ? new Intl.DateTimeFormat('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      timeZone: 'Asia/Ho_Chi_Minh',
                    }).format(new Date(taskemp.completionDate))
                    : "Chưa có"}
                </TableCell>

                <TableCell>
                  {new Intl.DateTimeFormat('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'Asia/Ho_Chi_Minh'
                  }).format(new Date(taskemp.deadline))}
                </TableCell>

                <TableCell>{taskemp.description}</TableCell>
                <TableCell>
                  {taskemp.completionDate ? (
                    new Date(taskemp.completionDate) < new Date(taskemp.deadline) ? (
                      <Typography color="success">Đúng hạn</Typography>
                    ) : (
                      <Typography color="error">Trễ hạn</Typography>
                    )
                  ) : (
                    <Typography color="warning">Chưa hoàn thành</Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton disabled={taskemp.statusId===3|| taskemp.statusId===2}  color="primary" onClick={() => handleEdit(taskemp.id)}>
                      <Edit />
                    </IconButton>
                    {/* <IconButton color="secondary" onClick={() => handleDeleteOpen(taskemp.id)}>
                      <Delete />
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
        <DialogTitle>{isEditing ? "Chỉnh sửa công việc cho nhân viên" : "Thêm công việc cho nhân viên"}</DialogTitle>
        <DialogContent>

          <Select
            fullWidth
            value={formData.taskId || ""}
            onChange={(e) => {
              handleFormChange("taskId", e.target.value);
              fetchUsersByTaskId(e.target.value); // Gọi API để lấy người dùng dựa trên taskId
            }}
            error={!!errors.taskId}
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              -- Chọn công việc --
            </MenuItem>
            {taskNoSelect?.map((task) => (
              <MenuItem key={task.id} value={task.id}>
                {task.name}
              </MenuItem>
            ))}
          </Select>
          {errors.taskId && <Typography color="error">{errors.taskId}</Typography>}
          <Select
            fullWidth
            value={usersForTask.some((usr) => usr.id === formData.userId) ? formData.userId : ""}
            onChange={(e) => handleFormChange("userId", e.target.value)}
            error={!!errors.userId}
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              -- Chọn người phụ trách --
            </MenuItem>
            {usersForTask?.map((usr) => (
              <MenuItem key={usr.id} value={usr.id}>
                {usr.name}
              </MenuItem>
            ))}
          </Select>



          
          <Select
            fullWidth
            value={formData.statusId}
            onChange={(e) => handleFormChange("statusId", e.target.value)}
            error={!!errors.statusId}
            displayEmpty
            disabled={statuses?.find((status) => status.id === formData.statusId)?.description === "Hoàn thành"} // Disable nếu là "Hoàn thành"
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              -- Chọn trạng thái --
            </MenuItem>
            {statuses?.map((status) => (
              <MenuItem key={status.id} value={status.id}>
                {status.description}
              </MenuItem>
            ))}
          </Select>
          {errors.statusId && <Typography color="error">{errors.statusId}</Typography>}

          <TextField
            fullWidth
            label="Thời gian bắt đầu"
            type="datetime-local"
            value={formData.assignedAt}
            onChange={(e) => handleFormChange("assignedAt", e.target.value)}
            error={!!errors.assignedAt}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          {errors.assignedAt && <Typography color="error">{errors.assignedAt}</Typography>}

          <TextField
            fullWidth
            label="Deadline"
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => handleFormChange("deadline", e.target.value)}
            error={!!errors.deadline}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          {errors.deadline && <Typography color="error">{errors.deadline}</Typography>}



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

      

      <ToastContainer />
    </Container>
  );
};

export default TaskEmployeePage;