
import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, Card, CardContent, Avatar, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Button } from "@mui/material";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Work, Group, Assignment, CheckCircle } from '@mui/icons-material';
import { exportToExcel } from "../../AdminFormatExcel/excelExport";
ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardPage = () => {
    const [data, setData] = useState({
        totalEmployees: 0,
        totalProjectsCompleted: 0,
        totalProjectsPending: 0,
        totalTasksCompleted: 0,
        tasksByProject: [],
        employeesByDepartment: [],
    });


    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const [employees, setEmployees] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [openTasks, setOpenTasks] = useState(false);

    const COLORS = [
        "#FF5722", // Cam đỏ
        "#FF9800", // Cam
        "#4CAF50", // Xanh lá
        "#9C27B0", // Tím
        "#03A9F4", // Xanh dương nhạt
        "#8BC34A", // Xanh lá nhạt
        "#E91E63", // Hồng
        "#FFEB3B", // Vàng
        "#00BCD4", // Xanh dương đậm
        "#3F51B5", // Xanh dương tím
    ];


    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [
                    employeesRes,
                    projectStatusRes,
                    taskCompletionRes,
                    projectTaskCountsRes
                ] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/User/statistical-employees`),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/User/project-status-statistics`),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/User/employee-task-completion-status`),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/User/project-task-counts`),
                ]);

                const employees = employeesRes.data || [];
                const projectStatus = projectStatusRes.data || {};
                const taskCompletion = taskCompletionRes.data || {};
                const projectTaskCounts = projectTaskCountsRes.data || [];

                const tasksByProject = projectTaskCounts.map(item => ({
                    id: item.projectId, // Giả sử bạn có projectId
                    name: item.projectName,
                    value: item.taskCount,
                }));

                const employeesByDepartment = employees.map(item => ({
                    id: item.departmentId, // Giả sử bạn có departmentId
                    name: item.departmentName,
                    value: item.employeeCount || 0,
                }));

                const completedProjects = projectStatus.find((item) => item.status === "Completed")?.totalProjects || 0;
                const inProgressProjects = projectStatus.find((item) => item.status === "In Progress")?.totalProjects || 0;
                const pendingProjects = projectStatus.find((item) => item.status === "Pending")?.totalProjects || 0;

                setData({
                    totalEmployees: employees.reduce((sum, item) => sum + item.employeeCount, 0),
                    totalProjectsCompleted: completedProjects,
                    totalProjectsInProgress: inProgressProjects,
                    totalProjectsPending: pendingProjects,
                    totalTasksCompleted: taskCompletion.completed || 0,
                    tasksByProject,
                    employeesByDepartment,
                });
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchDashboardData();
    }, []);


    const fetchEmployeesByDepartment = async (departmentId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Department/${departmentId}/employees`);
            setEmployees(response.data || []);
            response.data.forEach((item) => {
                setSelectedDepartment(item.departmentName);
                console.log("Phòng ban", item.departmentName)
            });

            console.log(response.data);


            setOpen(true); // Mở modal
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };
   
    const handleDepartmentPieClick = (event, chartElement) => {
        if (!chartElement.length) return; // Kiểm tra nếu không có phần nào được click
        const index = chartElement[0].index; // Lấy chỉ số của phần được click
        const department = data.employeesByDepartment[index]; // Lấy thông tin phòng ban từ dữ liệu
        if (department) fetchEmployeesByDepartment(department.id); // Gọi API lấy nhân viên theo ID phòng ban
    };

    const fetchTasksByProject = async (projectId) => {
        if (!projectId) {
            console.error("projectId không hợp lệ:", projectId);
            return; // Tránh gọi API khi ID không hợp lệ
        }
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/ProjectTask/taskByProject/${projectId}`
            );
            setTasks(response.data || []);
            response.data.forEach((item) => {
                setSelectedProject(item.project.name);
                console.log("dự án", item.project.name);

            }); // Lưu danh sách công việc
            // Lưu ID dự án được chọn
            setOpenTasks(true); // Mở modal hiển thị danh sách
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };


    const handleProjectPieClick = (event, chartElement) => {
        if (!chartElement.length) return; // Nếu không click vào phần nào, thoát

        const index = chartElement[0].index; // Lấy chỉ số của vùng được click
        const project = data.tasksByProject[index]; // Truy xuất dự án tương ứng

        console.log("Dự án được chọn:", project); // Log dữ liệu để kiểm tra

        if (project?.id) {
            fetchTasksByProject(project.id); // Gọi API với ID dự án
        } else {
            console.error("Không tìm thấy project ID. Dữ liệu dự án:", project);
        }
    };



    const employeesByDepartmentChartOptions = {
        onClick: (event, chartElement) => handleDepartmentPieClick(event, chartElement),
    };

    const tasksByProjectChartData = {
        labels: data.tasksByProject.map(item => item.name),
        datasets: [
            {
                label: "Số công việc theo dự án",
                data: data.tasksByProject.map(item => item.value),
                backgroundColor: data.tasksByProject.map((_, index) => COLORS[index % COLORS.length]),
                borderWidth: 0,
            },
        ],
    };

    const employeesByDepartmentChartData = {
        labels: data.employeesByDepartment.map(item => item.name),
        datasets: [
            {
                label: "Số nhân viên theo phòng ban",
                data: data.employeesByDepartment.map(item => item.value),
                backgroundColor: data.employeesByDepartment.map((_, index) => COLORS[index % COLORS.length]),
                borderWidth: 0,
            },
        ],
    };


    // Hàm xuất danh sách nhân viên ra file Excel
    const exportEmployeesToExcel = () => {
        if (employees.length === 0) {
            alert("Không có nhân viên nào để xuất!");
            return;
        }
        
        exportToExcel(employees, selectedDepartment);
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: "#2196F3", color: "#fff", borderRadius: 3, boxShadow: 3, '&:hover': { boxShadow: 6, transform: 'translateY(-5px)' }, transition: 'all 0.3s ease' }}>
                        <CardContent sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ bgcolor: "#1976D2", color: "#fff", width: 56, height: 56, marginRight: 2, boxShadow: 3 }}>
                                <Group sx={{ fontSize: 30 }} />
                            </Avatar>
                            <div>
                                <Typography variant="h6">Tổng nhân viên</Typography>
                                <Typography variant="h4" fontWeight="bold">{data.totalEmployees}</Typography>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: "#4CAF50", color: "#fff", borderRadius: 3, boxShadow: 3, '&:hover': { boxShadow: 6, transform: 'translateY(-5px)' }, transition: 'all 0.3s ease' }}>
                        <CardContent sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ bgcolor: "#388E3C", color: "#fff", width: 56, height: 56, marginRight: 2, boxShadow: 3 }}>
                                <CheckCircle sx={{ fontSize: 30 }} />
                            </Avatar>
                            <div>
                                <Typography variant="h6">Dự án hoàn thành</Typography>
                                <Typography variant="h4" fontWeight="bold">{data.totalProjectsCompleted}</Typography>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        sx={{
                            bgcolor: "#E9C46A", // Màu xanh lá cho trạng thái "Chưa hoàn thành"
                            color: "#fff",
                            borderRadius: 3,
                            boxShadow: 3,
                            "&:hover": {
                                boxShadow: 6,
                                transform: "translateY(-5px)",
                            },
                            transition: "all 0.3s ease",
                        }}
                    >
                        <CardContent sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                                sx={{
                                    bgcolor: "#F4A261", // Màu xanh lá đậm cho avatar
                                    color: "#fff",
                                    width: 56,
                                    height: 56,
                                    marginRight: 2,
                                    boxShadow: 3,
                                }}
                            >
                                <Assignment sx={{ fontSize: 30 }} />
                            </Avatar>
                            <div>
                                <Typography variant="h6">Chưa hoàn thành</Typography>
                                <Typography variant="h4" fontWeight="bold">
                                    {data.totalProjectsPending}
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        sx={{
                            bgcolor: "#FF8383", // Màu xanh dương cho trạng thái "Đang tiến hành"
                            color: "#fff",
                            borderRadius: 3,
                            boxShadow: 3,
                            "&:hover": {
                                boxShadow: 6,
                                transform: "translateY(-5px)",
                            },
                            transition: "all 0.3s ease",
                        }}
                    >
                        <CardContent sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                                sx={{
                                    bgcolor: "#F72C5B", // Màu xanh dương đậm cho avatar
                                    color: "#fff",
                                    width: 56,
                                    height: 56,
                                    marginRight: 2,
                                }}
                            >
                                <Assignment sx={{ fontSize: 30 }} />
                            </Avatar>
                            <div>
                                <Typography variant="h6">Đang tiến hành</Typography>
                                <Typography variant="h4" fontWeight="bold">
                                    {data.totalProjectsInProgress}
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>


            </Grid>

           
            <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
        <Typography
            variant="h6"
            mb={2}
            sx={{
                fontWeight: "bold",
                color: "#1976D2",
                letterSpacing: "0.5px",
                paddingBottom: "5px",
            }}
        >
            Số công việc theo dự án
        </Typography>
        <Box sx={{ 
            height: "300px", 
            width: "100%", 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative'
        }}>
            <Pie
                data={{
                    labels: data.tasksByProject.map((item) => item.name),
                    datasets: [
                        {
                            label: "Số công việc theo dự án",
                            data: data.tasksByProject.map((item) => item.value),
                            backgroundColor: data.tasksByProject.map(
                                (_, index) => COLORS[index % COLORS.length]
                            ),
                            borderWidth: 0,
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    onClick: (event, chartElement) => handleProjectPieClick(event, chartElement),
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 15
                            }
                        }
                    }
                }}
            />
        </Box>
    </Grid>

    <Grid item xs={12} md={6}>
        <Typography 
            variant="h6" 
            mb={2} 
            sx={{ 
                fontWeight: 'bold', 
                color: '#1976D2', 
                letterSpacing: '0.5px', 
                paddingBottom: '5px' 
            }}
        >
            Số nhân viên theo phòng ban
        </Typography>
        <Box sx={{ 
            height: "300px", 
            width: "100%", 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative'
        }}>
            <Pie 
                data={employeesByDepartmentChartData} 
                options={{
                    ...employeesByDepartmentChartOptions,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 15
                            }
                        }
                    }
                }} 
            />
        </Box>
    </Grid>
</Grid>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: '#1976D2' }}>
                    Danh sách nhân viên thuộc phòng ban <strong>{selectedDepartment}</strong>
                </DialogTitle>
                <DialogContent sx={{ paddingBottom: 2 }}>
                    {employees.length > 0 ? (
                        <List>
                            {employees.map((employee) => (
                                <ListItem key={employee.id} sx={{ paddingY: 1, '&:hover': { backgroundColor: '#f1f1f1' } }}>
                                    <ListItemText
                                        primary={employee.name}
                                        secondary={`Họ và tên: ${employee.employeeName} - Email: ${employee.email} - SĐT: ${employee.phone}`}
                                        sx={{ color: '#555' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography sx={{ color: '#757575', textAlign: 'center' }}>Không có nhân viên nào trong phòng ban này.</Typography>
                    )}
                </DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingX: 2, paddingBottom: 2 }}>
                    <Button
                        onClick={() => setOpen(false)}
                        sx={{ width: '48%' }}
                        variant="outlined"
                        color="secondary"
                    >
                        Đóng
                    </Button>
                    <Button
                        onClick={exportEmployeesToExcel}
                        sx={{ width: '48%' }}
                        variant="contained"
                        color="success"
                        disabled={employees.length === 0} // Chỉ vô hiệu hóa nút khi không có nhân viên
                    >
                        Xuất Excel
                    </Button>
                </Box>
            </Dialog>


            <Dialog open={openTasks} onClose={() => setOpenTasks(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Danh sách công việc thuộc dự án <strong>{selectedProject}</strong> </DialogTitle>
                <DialogContent>
                    {tasks.length > 0 ? (
                        <List>
                            {tasks.map((task) => (
                                <ListItem key={task.id}>
                                    <ListItemText primary={task.name} secondary={`Mô tả: ${task.description}`} />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography>Không có công việc nào trong dự án này.</Typography>
                    )}
                </DialogContent>


                <Button onClick={() => setOpenTasks(false)} sx={{ margin: 2 }} variant="contained" color="primary">
                    Đóng
                </Button>

            </Dialog>
        </Box>
    );
};

export default DashboardPage;