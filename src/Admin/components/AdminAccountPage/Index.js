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
    FormControl,
    InputLabel
} from "@mui/material";
import { Edit, Lock, LockOpen, Restore, Person } from "@mui/icons-material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminAccountPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [editingAccountId, setEditingAccountId] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        role: "",
        isActive: true,
    });
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/accounts/getAll`, {
                    params: {
                        pageNumber: page + 1,
                        pageSize: rowsPerPage,
                    },
                });
                setAccounts(response.data.data);
                setTotalCount(response.data.totalCount);
            } catch (error) {
                console.error("Error fetching accounts:", error);
            }
        };

        const fetchRoles = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/role`);
                setRoles(response.data);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };

        fetchAccounts();
        fetchRoles();
    }, [page, rowsPerPage]);

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleOpenModal = (action, accountId) => {
        setModalAction(action);
        setEditingAccountId(accountId);
        setIsModalOpen(true);

        const account = accounts.find(account => account.id === accountId);
        if (account && account.role) {
            setSelectedRole(account.role.id);
        } else {
            setSelectedRole("");
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRole("");
    };

    const handleResetPassword = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/api/accounts/resetpassword/${editingAccountId}`
            );
            toast.success("Đặt lại mật khẩu thành công.");
            handleCloseModal();
        } catch (error) {
            toast.error("Lỗi khi khôi phục mật khẩu.");
        }
    };

    const handleToggleActive = async () => {
        const account = accounts.find((account) => account.id === editingAccountId);
        if (!account) {
            toast.error("Tài khoản không tồn tại.");
            return;
        }

        const newStatus = !account.isActive;

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/api/accounts/activate/${editingAccountId}`,
                newStatus,
                { headers: { 'Content-Type': 'application/json' } }
            );

            const updatedAccount = response.data;

            toast.success(`Cập nhật trạng thái tài khoản thành công. Tài khoản đã ${newStatus ? 'hoạt động' : 'vô hiệu hóa'}.`);

            setAccounts((prevAccounts) =>
                prevAccounts.map((acc) =>
                    acc.id === editingAccountId ? updatedAccount : acc
                )
            );

            const fetchData = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/accounts/getAll`, {
                params: {
                    pageNumber: page + 1,
                    pageSize: rowsPerPage,
                },
            });
            setAccounts(fetchData.data.data);
            setTotalCount(fetchData.data.totalCount);
            handleCloseModal();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái tài khoản:", error);
            toast.error("Lỗi khi cập nhật trạng thái tài khoản.");
        }
    };

    const handleAssignRole = async () => {
        if (!selectedRole) {
            toast.error("Vui lòng chọn vai trò.");
            return;
        }
        try {
            await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/accounts/assignRole/${editingAccountId}`,
                selectedRole,
                { headers: { 'Content-Type': 'application/json' } },
            );
            toast.success("Cập nhật vai trò tài khoản thành công.");
            const fetchData = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/accounts/getAll`, {
                params: {
                    pageNumber: page + 1,
                    pageSize: rowsPerPage,
                },
            });
            setAccounts(fetchData.data.data);
            setTotalCount(fetchData.data.totalCount);
            handleCloseModal();
        } catch (error) {
            toast.error("Lỗi khi phân quyền tài khoản.");
        }
    };


    const filteredAccounts = accounts.filter((account) =>
        account.username && account.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container>
            <Box sx={{ mt: 2, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <TextField
                    label="Tìm kiếm tài khoản"
                    variant="outlined"
                    value={search}
                    onChange={handleSearchChange}
                    sx={{ width: "50%" }}
                />
            </Box>

            <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Tài khoản</strong></TableCell>
                            <TableCell><strong>Họ và tên</strong></TableCell>
                            <TableCell><strong>Vai trò</strong></TableCell>
                            <TableCell><strong>Trạng thái</strong></TableCell>
                            <TableCell><strong>Hành động</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAccounts.map((account) => (
                            <TableRow key={account.id}>
                                <TableCell>{account.username}</TableCell>
                                <TableCell>{account.user.name}</TableCell>
                                <TableCell>
                                    {account.role.id === 1 ? "Trưởng phòng" : account.role.id === 2 ? "Nhân viên" : ""}
                                </TableCell>


                                <TableCell>{account.isActive ? "Hoạt động" : "Vô hiệu hóa"}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton onClick={() => handleOpenModal("resetpassword", account.id)} color="primary">
                                            <Restore />
                                        </IconButton>
                                        <IconButton onClick={() => handleOpenModal(account.isActive ? "lock" : "unlock", account.id)} color={account.isActive ? "error" : "success"}>
                                            {account.isActive ? <Lock /> : <LockOpen />}
                                        </IconButton>
                                        <IconButton onClick={() => handleOpenModal("assignRole", account.id)} color="info">
                                            <Edit />
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

            <Dialog open={isModalOpen} onClose={handleCloseModal}>
                <DialogTitle>
                    {modalAction === "resetPassword" && "Xác nhận khôi phục mật khẩu"}
                    {modalAction === "lock" && "Xác nhận khóa tài khoản"}
                    {modalAction === "unlock" && "Xác nhận mở khóa tài khoản"}
                    {modalAction === "assignRole" && "Chọn vai trò mới"}
                </DialogTitle>
                <DialogContent dividers>
                    {modalAction === "resetpassword" && (
                        <Typography>Bạn có chắc chắn muốn khôi phục mật khẩu cho tài khoản này?</Typography>
                    )}
                    {modalAction === "lock" || modalAction === "unlock" ? (
                        <Typography>
                            Bạn có chắc chắn muốn {modalAction === "lock" ? "khóa" : "mở khóa"} tài khoản này?
                        </Typography>
                    ) : modalAction === "assignRole" ? (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Chọn vai trò</InputLabel>
                                    <Select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        label="Chọn vai trò"
                                    >
                                        {roles.map((role) => (
                                            <MenuItem key={role.id} value={role.id}>
                                                {role.id === 1 ? "Trưởng phòng" : role.id === 2 ? "Nhân viên" : ""}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Hủy</Button>
                    <Button
                        onClick={() => {
                            if (modalAction === "resetpassword") handleResetPassword();
                            if (modalAction === "lock" || modalAction === "unlock") handleToggleActive();
                            if (modalAction === "assignRole") handleAssignRole();
                        }}
                        variant="contained" color="primary"
                    >
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer />
        </Container>
    );
};

export default AdminAccountPage;
