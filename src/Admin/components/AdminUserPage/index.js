
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
    FormControlLabel,
    Checkbox
} from "@mui/material";
import { Edit, Delete, Add, Close } from "@mui/icons-material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { Avatar } from '@mui/material';
import ErrorIcon from "@mui/icons-material/Error";
const AdminUserPage = () => {

    const [user, setUser] = useState([]);
    const [position, setPosition] = useState(null);
    const [department, setDepartment] = useState([]);
    const [userData, setUserData] = useState([]);
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
        email: "",
        phone: "",
        birthDay: "",
        avatar: [],
        departmentId: "",
        isLeader: "",
        positionId: "",

    });
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        phone: "",
        birthDay: "",
        avatar: "",
        departmentId: "",
        isLeader: "",
        positionId: "",
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

        const fetchDepartments = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Department`);
                setDepartment(response.data);
                // setTotalCount(response.data.totalCount);

            } catch (error) {
                console.error("Lỗi khi tải trạng thái công việc:", error);
            }
        }



        // const fetchUser = async (page, pageSize) => {
        //     try {
        //         const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/User/paged`,
        //             { params: { page: page + 1, pageSize }, });
        //         setUser(response.data.items);
        //         setTotalCount(response.data.totalCount);
        //     } catch (error) {
        //         console.error("Không thể tải công việc:", error);
        //     }
        // };




        const fetchPosition = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Position`);
                setPosition(response.data);
                // setTotalCount(response.data.totalCount);
            } catch (error) {
                console.error("Không thể tải công việc:", error);
            }
        };
        fetchPosition();
        fetchUser(page, rowsPerPage);
        fetchDepartments();


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
        setFormData({
            name: "",
            email: "",
            phone: "",
            birthDay: "",
            avatar: [],
            departmentId: "",
            isLeader: "",
            positionId: "",
        });
        setErrors({
            name: "",
            email: "",
            phone: "",
            birthDay: "",
            avatar: "",
            departmentId: "",
            isLeader: "",
            positionId: "",
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleEdit = async (userId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/User/get/${userId}`);
            const useremployee = response.data;

            setIsEditing(true);
            setEditingId(userId);
            setFormData({
                name: useremployee.name || "",
                email: useremployee.email || "",
                phone: useremployee.phone || "",
                birthDay: useremployee.birthDay || "",
                avatar: useremployee.avatar ? [{ file: null, preview: useremployee.avatar }] : [],
                departmentId: useremployee.departmentId || "",
                isLeader: useremployee.isLeader || "",
                positionId: useremployee.positionId || "",
            });

            handleModalOpen();
        } catch (error) {
            console.error("Error fetching user details:", error);
            toast.error("Không thể tải dữ liệu người dùng.");
        }
    };


    const handleDeleteOpen = (userId) => {
        setDeletingId(userId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteClose = () => {
        setIsDeleteModalOpen(false);
        setDeletingId(null);
    };

    // const handleDeleteConfirm = async () => {
    //     try {
    //         await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/User/delete/${deletingId}`);
    //         toast.success("Xóa nhân viên thành công!");
    //         const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/User`);
    //         setUser(response.data);
    //         handleDeleteClose();
    //     } catch (error) {
    //         console.error("Lỗi khi xóa nhân viên:", error);
    //         toast.error("Lỗi khi xóa nhân viên.");
    //         handleDeleteClose();
    //     }
    // };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name || formData.name.trim() === "") {
            newErrors.name = "Tên không được để trống.";
        }
        if (!formData.email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
            newErrors.email = "Vui lòng nhập email hợp lệ.";
        }
        if (!formData.phone || !/^\d{10,11}$/.test(formData.phone)) {
            newErrors.phone = "Số điện thoại phải có 10-11 chữ số.";
        }
        if (!formData.birthDay) {
            newErrors.birthDay = "Vui lòng chọn ngày sinh.";
        } else {
            const birthDate = new Date(formData.birthDay);
            const today = new Date();
            const eighteenYearsAgo = new Date(
                today.getFullYear() - 18,
                today.getMonth(),
                today.getDate()
            );

            if (birthDate > eighteenYearsAgo) {
                newErrors.birthDay = "Bạn phải đủ 18 tuổi.";
            }
        }

        if (!formData.departmentId) {
            newErrors.departmentId = "Vui lòng chọn phòng ban.";
        }

        if (!formData.positionId) {
            newErrors.positionId = "Vui lòng chọn vị trí.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const fetchUser = async (page, pageSize) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/User/paged`,
                { params: { page: page + 1, pageSize }, });
            setUser(response.data.items);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error("Không thể tải công việc:", error);
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
            formDataToSend.append("email", formData.email?.trim() || "");
            formDataToSend.append("phone", formData.phone?.trim() || "");
            formDataToSend.append("birthDay", formData.birthDay || "");
            formDataToSend.append("departmentId", formData.departmentId || null);
            formDataToSend.append("isLeader", formData.isLeader || "");
            formDataToSend.append("positionId", formData.positionId || null);

            // Thêm ảnh đại diện
            console.log("Danh sách avatar được chọn:");
            formData.avatar.forEach((image) => {
                if (image.file) {
                    console.log("Hình ảnh được thêm:", image.file);
                    formDataToSend.append("avatar", image.file);
                }
            });

            // Xác định phương thức và URL
            const method = isEditing ? "put" : "post";
            const url = isEditing
                ? `${process.env.REACT_APP_API_BASE_URL}/api/User/update/${editingId}`
                : `${process.env.REACT_APP_API_BASE_URL}/api/User/add`;

            // Gửi dữ liệu tới API
            await axios({
                method,
                url,
                data: formDataToSend,
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Hiển thị thông báo thành công và cập nhật danh sách người dùng
            toast.success(`${isEditing ? "Cập nhật" : "Thêm"} nhân viên thành công!`);
            handleModalClose();

            // Lấy lại danh sách người dùng sau khi lưu thành công
            await fetchUser(page, rowsPerPage);
        } catch (error) {
            console.error("Lỗi khi lưu nhân viên:", error);

            // Hiển thị thông báo lỗi
            const errorMessage = error.response?.data?.message || "Lưu nhân viên thất bại.";
            toast.error(`Lỗi: ${errorMessage}`);
        }
    };
    const filteredUser = user.filter((us) =>
        us.name.toLowerCase().includes(search.toLowerCase())
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
                    Thêm nhân viên
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Hình ảnh</strong></TableCell>
                            <TableCell><strong>Nhân viên</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Số điện thoại</strong></TableCell>
                            <TableCell><strong>Ngày sinh</strong></TableCell>
                            <TableCell><strong>Phòng ban</strong></TableCell>
                            <TableCell><strong>Vị trí</strong></TableCell>
                            <TableCell><strong>Vai trò</strong></TableCell>
                            <TableCell><strong>Hành động</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUser?.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell>
                                    <Avatar
                                        alt={employee.name}
                                        src={
                                            employee.avatar
                                                ? `${process.env.REACT_APP_API_BASE_URL}/Uploads/${employee.avatar}`
                                                : undefined
                                        }
                                        sx={{ width: 50, height: 50 }}
                                    />
                                </TableCell>

                                <TableCell>{employee?.name}</TableCell>
                                <TableCell>{employee.email}</TableCell>
                                <TableCell>{employee.phone}</TableCell>
                                <TableCell>
                                    {employee.birthDay
                                        ? new Intl.DateTimeFormat('vi-VN', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            //  hour: '2-digit',
                                            //  minute: '2-digit',
                                            //  second: '2-digit',
                                            timeZone: 'Asia/Ho_Chi_Minh',
                                        }).format(new Date(employee.birthDay))
                                        : "Chưa có"}
                                </TableCell>

                                <TableCell>{employee.department?.name}</TableCell>
                                <TableCell>{employee.position?.name}</TableCell>
                                <TableCell>{employee.isLeader ? "Trưởng phòng" : "Nhân viên"}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton color="primary" onClick={() => handleEdit(employee.id)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton color="secondary" onClick={() => handleDeleteOpen(employee.id)}>
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
                <DialogTitle>{isEditing ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Tên nhân viên"
                        fullWidth
                        variant="outlined"
                        value={formData.name}
                        onChange={(e) => handleFormChange("name", e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Email"
                        fullWidth
                        variant="outlined"
                        value={formData.email}
                        onChange={(e) => handleFormChange("email", e.target.value)}
                        error={!!errors.email}
                        helperText={errors.email}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Số điện thoại"
                        fullWidth
                        variant="outlined"
                        value={formData.phone}
                        onChange={(e) => handleFormChange("phone", e.target.value)}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Ngày sinh"
                        fullWidth
                        variant="outlined"
                        type="date"
                        value={formData.birthDay ? formData.birthDay.split("T")[0] : ""}
                        onChange={(e) => handleFormChange("birthDay", e.target.value)}
                        error={!!errors.birthDay}
                        helperText={errors.birthDay}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                    />

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
                        {department?.map((department) => (
                            <MenuItem key={department.id} value={department.id}>
                                {department.name}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.departmentId && <Typography color="error">{errors.departmentId}</Typography>}

                    <Select
                        fullWidth
                        value={formData.positionId}
                        onChange={(e) => handleFormChange("positionId", e.target.value)}
                        error={!!errors.positionId}
                        displayEmpty
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="" disabled>
                            -- Chọn vị trí --
                        </MenuItem>
                        {position?.map((position) => (
                            <MenuItem key={position.id} value={position.id}>
                                {position.name}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.positionId && <Typography color="error">{errors.positionId}</Typography>}

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.isLeader}
                                onChange={(e) => handleFormChange("isLeader", e.target.checked)}
                            />
                        }
                        label="Là trưởng phòng"
                    />


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
                <DialogTitle>Thông báo!</DialogTitle>
                <DialogContent>

                    <Typography variant="body1" color="error">
                        <ErrorIcon color="error" />{/* Thêm icon */} Không thể xóa
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="error" onClick={handleDeleteClose}>
                        Ok
                    </Button>
                    {/* <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
                        Xóa
                    </Button> */}
                </DialogActions>
            </Dialog>

            <ToastContainer />
        </Container>

    );
};

export default AdminUserPage;