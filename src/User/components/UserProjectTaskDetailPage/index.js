import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TableContainer,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
const UserProjectTaskDetailPage = () => {
  const { projectId } = useParams(); // Lấy projectId từ URL
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false); // Kiểm soát mở/đóng dialog
  const [selectedTask, setSelectedTask] = useState(null); // Lưu công việc cần cập nhật
  const [newStatus, setNewStatus] = useState(3); // Trạng thái mới người dùng nhập vào
  const [status, setStatus] = useState(null);
  const token = localStorage.getItem("authToken");
  const[role,setRole]=useState("");
  useEffect(() => {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    setRole(userRole);
    const userIdFromToken = decodedToken.AccountID;

    if (!userIdFromToken) {
      toast.error("Xác thực người dùng thất bại!");
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/accounts/getById/${userIdFromToken}`)
      .then((accountResponse) => {
        const accountData = accountResponse.data;
        setAccountId(accountData.userId);
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


      })


    const fetchStatusJob = async () => {
      const reponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/StatusJob`)
      setStatus(reponse.data);

    }
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/taskByProject/${projectId}`
        );
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin công việc. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchStatusJob();
    fetchTasks();
  }, [projectId]);


  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/taskByProject/${projectId}`
      );
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      setError("Không thể tải thông tin công việc. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };
  const handleCompleteTask = async (taskId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/TaskEmployee/updatestatus/${taskId}`, newStatus,

        {
          headers: {
            // Thêm token xác thực
            "Content-Type": "application/json",
          },
        }
      );
      
      toast.success("Công việc đã hoàn thành!");
      fetchTasks();
      fetchUserTasks(); // Cập nhật lại danh sách công việc
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái!");
      console.error(error);
    }
  };
  const handleCompleteTaskProcess = async (taskId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/TaskEmployee/updatestatus/${taskId}`, 2,

        {
          headers: {
            // Thêm token xác thực
            "Content-Type": "application/json",
          },
        }
      );
      
      toast.success("Công việc đang tiến hành!");
      fetchTasks();
      fetchUserTasks(); // Cập nhật lại danh sách công việc
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái!");
      console.error(error);
    }
  };


  const fetchUserTasks = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/TaskEmployee/taskByUser/${accountId}`,
      );
      setUserTasks(response.data);
    } catch (err) {
      console.error("Không thể tải công việc cá nhân:", err);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    fetchUserTasks();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    fetchUserTasks();//
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error" align="center">
        {error}
      </Typography>
    );
  }

  const projectName = tasks.length > 0 ? tasks[0].project.name : "";
  const isLeader = role === 'Leader';
  return (
    <Box p={3} >

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2, mx: "auto", display: "block" }}
        disabled={isLeader}
        onClick={handleOpenDialog}
      >
        Công việc cá nhân
      </Button>
      <Typography variant="h4" align="center" gutterBottom>
        Danh sách công việc thuộc dự án {projectName}
      </Typography>



      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Công việc cá nhân</DialogTitle>
        <DialogContent>
          {userTasks.length > 0 ? (
            <Timeline position="alternate">
              {userTasks.map((task, index) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot color={task.status.description === "Hoàn thành" ? "success" : "primary"} />
                    {index < userTasks.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Box>
                      <Typography variant="h6" component="div">
                        {task.task.name || "Tên công việc chưa có"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {task.task.description || "Mô tả chưa có"}
                      </Typography>
                      {/* <Chip
                        label={`Trạng thái: ${task.statusId===1?"Đang tiến hành": "Không xác định"}`}
                        color={task.status.description === "Hoàn thành" ? "success" : "warning"}
                        sx={{ mt: 1 }}
                      /> */}
<Chip
  label={`Trạng thái: ${
    task.statusId === 1
      ? "Đang chờ xử lý"
      : task.statusId === 2
      ? "Đang tiến hành"
      : task.statusId === 3
      ? "Hoàn thành"
      : "Không xác định"
  }`}
  color={
    task.statusId === 3
      ? "success"
      : task.statusId === 2
      ? "info"
      : "warning"
  }
  sx={{ mt: 1 }}
/>

<Button 
  variant="contained"
  color="success"
  size="small"
  onClick={() => handleCompleteTask(task.id)}
  sx={{ mt: 1, marginRight: 10 }}
  disabled={task.status.description === "Hoàn thành"} 
>
  {task.status.description === "Hoàn thành" ? "Đã hoàn thành" : "Hoàn Tất"}
</Button>


{task.status.description !== "Hoàn thành" && (
  <Button
    variant="contained"
    color="success"
    size="small"
    onClick={() => handleCompleteTaskProcess(task.id)}
    sx={{ mt: 1 }}
  >
    Bắt Đầu
  </Button>
)}


                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              Không có công việc cá nhân nào.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {tasks.length > 0 ? (
        <Timeline position="alternate">
          {tasks.map((task, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot color={task.status.description === "Hoàn thành" ? "success" : "primary"} />
                {index < tasks.length - 1 && <TimelineConnector />}

              </TimelineSeparator>
              <TimelineContent>
                <Box>
                  <Typography variant="h6" component="div">
                    {task.name || "Tên công việc chưa có"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {task.description || "Mô tả chưa có"}
                  </Typography>
                  <Chip
                    label={`Trạng thái: ${task.status.description || "Không xác định"}`}
                    color={task.status.description === "Hoàn thành" ? "success" : "warning"}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center">
          Không có công việc nào thuộc dự án này.
        </Typography>
      )}


      <TableContainer />
    </Box>

  );

};

export default UserProjectTaskDetailPage;
