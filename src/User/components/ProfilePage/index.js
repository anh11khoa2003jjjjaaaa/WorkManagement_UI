
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Avatar,
    Typography,
    TextField,
    Grid,
    IconButton,
    Paper,
    Button,
    Menu,
    MenuItem,
    Dialog,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { FaCamera, FaPen } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateAvatar } from "../../../User/Redux/userSlice"; // Mới
import { useDispatch } from "react-redux"; // Mới
const ProfilePage = () => {
    const [avatarURL, setAvatarURL] = useState("");
    const [editing, setEditing] = useState(false);
    const [accountId, setAccountId] = useState(null);
    const [userData, setUserData] = useState({
        name: "",
        birthDay: "",
        email: "",
        phone: "",
        avatar: "",
        departmentId: null,
        isLeader: false,
        positionId: null,
        department: {},
        position: null,
    });
    const [userId, setUserId] = useState(null);
    const [errors, setErrors] = useState({
        name: "",
        birthDay: "",
        email: "",
        phone: "",
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const [openAvatarDialog, setOpenAvatarDialog] = useState(false);
    // Mới
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) return console.log("Token không tồn tại.");

                const decoded = jwtDecode(token);
                const accountId = decoded?.AccountID;
                if (!accountId) return toast.error("Xác thực thất bại!");

                const accountRes = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/accounts/getById/${accountId}`
                );
                const accountData = accountRes.data;

                if (!accountData) return toast.error("Tài khoản không hợp lệ.");

                setAccountId(accountData.userId);

                const userRes = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/User/get/${accountData.userId}`
                );
                const userData = userRes.data;

                // Cập nhật avatar từ server
                const fullAvatarURL = `${process.env.REACT_APP_API_BASE_URL}/Uploads/${userData.avatar}`;
                setUserData({ ...userData, avatar: fullAvatarURL });
                setAvatarURL(fullAvatarURL);
                setUserId(userData.id);
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu.");
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const handleViewAvatar = () => {
        setOpenAvatarDialog(true); // Mở dialog hiển thị ảnh
        handleCloseMenu(); // Đóng menu
    };
    const handleCloseAvatarDialog = () => {
        setOpenAvatarDialog(false); // Đóng dialog
    };
    const validateForm = () => {
        const { name, email, phone, birthDay } = userData;
        const newErrors = {
            name: "",
            birthDay: "",
            email: "",
            phone: "",
        };

        const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10,12}$/;

        if (!name.trim()) {
            newErrors.name = "Họ tên không được để trống.";
        } else if (!nameRegex.test(name)) {
            newErrors.name = "Họ tên chỉ chứa chữ cái và khoảng trắng.";
        }

        if (!email.trim()) {
            newErrors.email = "Email không được để trống.";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Email không hợp lệ. Ví dụ đúng: example@domain.com.";
        }

        if (!phone.trim()) {
            newErrors.phone = "Số điện thoại không được để trống.";
        } else if (!phoneRegex.test(phone)) {
            newErrors.phone = "Số điện thoại phải từ 10 đến 12 chữ số và chỉ chứa số.";
        }

        if (!birthDay.trim()) {
            newErrors.birthDay = "Ngày sinh không được để trống.";
        } else {
            const birthDate = new Date(birthDay);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const isUnder18 =
                age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())));

            if (isUnder18) {
                newErrors.birthDay = "Ngày sinh không hợp lệ. Người dùng phải đủ 18 tuổi.";
            }
        }

        setErrors(newErrors);
        return Object.values(newErrors).every((error) => error === "");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveChanges = () => {
        if (!validateForm()) return;

        axios
            .put(`${process.env.REACT_APP_API_BASE_URL}/api/User/update/${userId}`, userData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })


            .then(() => {


                toast.success("Cập nhật thông tin thành công!");
                setEditing(false);
            })
            .catch((error) => {
                toast.error("Lỗi khi cập nhật thông tin!");
                console.error(error);
            });
    };

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };



    // const handleUploadAvatar = async (event) => {
    //     const file = event.target.files[0];
    //     if (!file) return;

    //     const formData = new FormData();
    //     formData.append("avatarFile", file);

    //     try {
    //         const response = await axios.put(
    //             `${process.env.REACT_APP_API_BASE_URL}/api/User/update-avatar/${userId}`,
    //             formData,
    //             { headers: { "Content-Type": "multipart/form-data" } }
    //         );

    //         const uploadedAvatarUrl = response.data.avatar; // API trả về tên file hoặc URL
    //         const fullURL = `${process.env.REACT_APP_API_BASE_URL}/Uploads/${uploadedAvatarUrl}`;

    //         // Cập nhật ảnh đại diện với URL chính xác từ server
    //         setAvatarURL(fullURL);
    //         setUserData((prev) => ({ ...prev, avatar: fullURL }));

    //         toast.success("Cập nhật ảnh đại diện thành công!");
    //     } catch (error) {
    //         toast.error("Lỗi khi cập nhật ảnh đại diện.");
    //         console.error(error);
    //     } finally {
    //         handleCloseMenu();
    //     }
    // };
    const handleUploadAvatar = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatarFile", file);

        try {
            // Dispatch the updateAvatar action instead of direct API call
            const resultAction = await dispatch(updateAvatar({ userId, formData }));
            
            if (updateAvatar.fulfilled.match(resultAction)) {
                // Update local state with the new avatar URL
                setAvatarURL(resultAction.payload);
                setUserData(prev => ({ ...prev, avatar: resultAction.payload }));
                toast.success("Cập nhật ảnh đại diện thành công!");
            } else {
                throw new Error('Avatar update failed');
            }
        } catch (error) {
            toast.error("Lỗi khi cập nhật ảnh đại diện.");
            console.error(error);
        } finally {
            handleCloseMenu();
        }
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 800, m: "auto", mt: 5 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
                    <Box>
                        <Avatar
                            src={avatarURL || undefined}
                            sx={{
                                width: 100,
                                height: 100,
                                m: "auto",
                                position: "relative",
                                bgcolor: avatarURL ? "transparent" : "primary.main",
                            }}
                            onClick={handleAvatarClick}
                        >
                            {!avatarURL && (
                                <Typography variant="h4" color="white">
                                    {userData.name?.charAt(0)?.toUpperCase() || "U"}
                                </Typography>
                            )}
                            <IconButton
                                sx={{ position: "absolute", bottom: 0, right: 0, bgcolor: "white" }}
                                size="small"
                            >
                                <FaCamera />
                            </IconButton>
                        </Avatar>


                        {editing ? (
                            <TextField
                                fullWidth
                                variant="standard"
                                name="name"
                                value={userData.name}
                                onChange={handleInputChange}
                                sx={{ maxWidth: 200, mx: "auto", mt: 2 }}
                                error={!!errors.name}
                                helperText={errors.name}
                            />
                        ) : (
                            <Typography variant="h5" sx={{ mt: 2 }}>
                                <strong>{userData.name}</strong>
                            </Typography>
                        )}

                        <IconButton onClick={() => setEditing(!editing)} size="small" sx={{ mt: 1 }}>
                            <FaPen />
                        </IconButton>
                    </Box>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Box>
                        <Grid container spacing={2}>
                            {["phone", "email", "birthDay"].map((field, index) => (
                                <Grid item xs={12} key={index}>
                                    {field === "birthDay" && editing ? (
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="Ngày sinh"
                                            name="birthDay"
                                            value={userData.birthDay ? userData.birthDay.split("T")[0] : ""}
                                            onChange={handleInputChange}
                                            InputLabelProps={{ shrink: true }}
                                            error={!!errors.birthDay}
                                            helperText={errors.birthDay}
                                        />
                                    ) : (
                                        <TextField
                                        disabled={!editing}
                                            fullWidth
                                            label={
                                                field === "phone"
                                                    ? "Số điện thoại"
                                                    : field === "email"
                                                        ? "Email"
                                                        : "Ngày sinh"
                                            }
                                            name={field}
                                            value={
                                                field === "birthDay"
                                                    ? new Date(userData.birthDay).toLocaleDateString("vi-VN")
                                                    : userData[field] || ""
                                            }
                                            onChange={handleInputChange}
                                            error={!!errors[field]}
                                            helperText={errors[field]}
                                        />
                                    )}
                                </Grid>
                            ))}

                            <Grid item xs={12}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                                    {editing && (
                                        <Button onClick={handleSaveChanges} variant="contained">
                                            Lưu thay đổi
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
                <MenuItem onClick={handleViewAvatar}>Xem ảnh đại diện</MenuItem>
                <MenuItem>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="upload-avatar"
                        type="file"
                        onChange={handleUploadAvatar}
                    />
                    <label htmlFor="upload-avatar">
                        <Button component="span">Chọn ảnh tải lên</Button>
                    </label>
                </MenuItem>
            </Menu>
            <Dialog open={openAvatarDialog} onClose={handleCloseAvatarDialog} maxWidth="sm" fullWidth>
                <Box sx={{ p: 2, textAlign: "center" }}>
                    {avatarURL ? (
                        <img
                            src={avatarURL}
                            alt="Avatar"
                            style={{ maxWidth: "100%", height: "auto", borderRadius: "10px" }}
                        />
                    ) : (
                        <Typography variant="h6">Không có ảnh đại diện.</Typography>
                    )}
                    <Button
                        sx={{ mt: 2 }}
                        variant="contained"
                        color="primary"
                        onClick={handleCloseAvatarDialog}
                    >
                        Đóng
                    </Button>
                </Box>
            </Dialog>

            <ToastContainer />
        </Paper>
    );
};

export default ProfilePage;