
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  TextField,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Link,

} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserData, logout } from "../../../Redux/userSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import logo from '../../../../Admin/AdminImage/logonew.png';
const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoggedIn, avatarUrl, userData, error } = useSelector((state) => state.user);

  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [anchorElAccount, setAnchorElAccount] = useState(null);
  const [role, setRole] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null); // Thông báo được chọn
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Hiển thị form/modal
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchData = async () => {
      try {

        const decodedToken = jwtDecode(token);
        const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setRole(userRole);
        console.log(userRole);
        // const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Token không tồn tại. Vui lòng đăng nhập lại.");
          return;
        }

        const decoded = jwtDecode(token);
        const accountId = decoded?.AccountID;

        if (!accountId) {
          toast.error("Xác thực thất bại. Vui lòng đăng nhập lại.");
          return;
        }

        const accountResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/accounts/getById/${accountId}`
        );
        const accountData = accountResponse.data;

        if (!accountData || !accountData.userId) {
          toast.error("Không tìm thấy tài khoản hợp lệ.");
          return;
        }

        setUserId(accountData.userId);
        dispatch(fetchUserData());
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        // toast.error("Lỗi khi tải thông tin tài khoản.");
      }
    };

    fetchData();
   
  }, [dispatch]);


  



  const handleMenuClose = () => {
    navigate("/admin/dashboard");
    console.log("userid: ",jwtDecode(token).AccountID);
    setAnchorElAccount(null);
};
  const fetchNotifications = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/Notification/get-notifications`,
        { params: { userId: id } }
      );
      const notificationData = response.data;

      setNotifications(notificationData);
      setUnreadCount(notificationData.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Lỗi khi tải thông báo:", err);
      toast.error("Lỗi khi tải thông báo.");
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/api/Notification/mark-as-read/${notificationId}`
      );
      fetchNotifications(userId); // Cập nhật lại danh sách sau khi đánh dấu
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái thông báo:", err);
      toast.error("Không thể đánh dấu thông báo là đã đọc.");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (error) {
      toast.error(`Lỗi: ${error}`);
    }
  }, [error]);

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification); // Lưu thông báo được chọn
    setIsDialogOpen(true); // Hiển thị form/modal
    if (!notification.isRead) {
      markAsRead(notification.id); // Cập nhật trạng thái nếu chưa đọc
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleNotificationMenuOpen = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setAnchorElNotifications(null);
  };

  const handleAccountMenuOpen = (event) => {
    setAnchorElAccount(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAnchorElAccount(null);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#026aa7" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="logo" sx={{ mr: 2 }}>
            <img src={logo} alt="ProTasker Logo" style={{ width: 50, height: 50 }} />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            ProTasker
          </Typography>


          <Typography
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center', // Căn giữa theo chiều dọc
              textAlign: 'center',
              margin: '0 auto',
              position: 'absolute',
              left: '36%',
              fontSize: '25px'

              // Đảm bảo phần tử chiếm hết chiều cao của viewport
            }}
          >
            Chào mừng đến với công ty ProTasker
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", ml: 3 }}>
            <Tooltip title="Thông báo">
              <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
                <Badge badgeContent={unreadCount} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorElNotifications}
              open={Boolean(anchorElNotifications)}
              onClose={handleNotificationMenuClose}
              sx={{ mt: "7px" }}
            >
              {notifications.length > 0 ? (
                <List>
                  {notifications.map((notification, index) => (
                    <ListItem
                      key={index}
                      sx={{ fontWeight: notification.isRead ? "normal" : "bold", cursor: "pointer" }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <ListItemText
                        primary={notification.title}
                        secondary={notification.content}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <MenuItem>Không có thông báo nào.</MenuItem>
              )}
            </Menu>

            <Tooltip title="Tài khoản của bạn">
              <IconButton color="inherit" onClick={handleAccountMenuOpen}>
                {isLoggedIn && avatarUrl ? (
                  <Avatar src={avatarUrl} alt="Avatar người dùng" />
                ) : (
                  <Avatar sx={{ bgcolor: "#0079bf" }}>
                    <AccountCircleIcon />
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorElAccount}
              open={Boolean(anchorElAccount)}
              onClose={handleAccountMenuClose}
              sx={{ mt: "7px" }}
            >

              {role === 'Leader' && (
                <MenuItem  onClick={handleMenuClose}>
                  Quay về trang Admin
                </MenuItem>
              )}
              {isLoggedIn && userData && (
                <>
                  <MenuItem onClick={() => navigate("/user/profile")}>Thông tin cá nhân</MenuItem>
                  <MenuItem onClick={() => navigate("/user/change-pass")}>
                    Đặt lại mật khẩu
                  </MenuItem>
                </>
              )}
              {isLoggedIn ? (
                <MenuItem
                  onClick={() => {
                    dispatch(logout());
                    handleAccountMenuClose();
                    navigate("/login");
                  }}
                >
                  Đăng xuất
                </MenuItem>
              ) : (
                <MenuItem onClick={() => navigate("/login")}>Đăng nhập</MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{selectedNotification?.title}</DialogTitle>
        <DialogContent>{selectedNotification?.content}</DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </>
  );
};

export default Navbar;
