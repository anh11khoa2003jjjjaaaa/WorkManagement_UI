

import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Box,
  Chip,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate,useParams } from "react-router-dom";

const UserProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook điều hướng
 const { departmentId } = useParams();
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/projects/department/${departmentId}`
        );
        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin dự án. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };
    fetchProjectData();
  }, []);

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

  return (
    <Box p={3}>
      <Typography sx={{ fontWeight: "bold" }} variant="h4" align="center" gutterBottom>
        Danh sách dự án
      </Typography>
      <Grid container spacing={4}>
        {projects.map((project, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Card sx={{ padding: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    cursor: "pointer",
                    textDecoration: "none",
                    transition: "color 0.3s, transform 0.3s",
                    "&:hover": {
                      color: "primary.main", // Đổi màu chữ khi hover
                      transform: "scale(1.05)", // Phóng to nhẹ
                      textDecoration: "underline", // Gạch chân khi hover
                    },
                  }}
                  onClick={() => navigate(`/user/projects/${project.id}`)} // Điều hướng
                >
                  {project.name || "Tên dự án chưa có"}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ cursor: "pointer" }} onClick={() => navigate(`/user/projects/${project.id}`)} paragraph>
                  {project.description || "Mô tả dự án chưa có."}
                </Typography>
                <Typography variant="body2">
                  <strong>Ngày bắt đầu:</strong>{" "}
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                    : "Chưa có"}{" "}
                  <br />
                  <strong>Ngày kết thúc:</strong>{" "}
                  {project.endDate
                    ? new Date(project.endDate).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                    : "Chưa có"}
                </Typography>

                <Box mt={2}>
                  <Chip label={`Trạng thái: ${project.status?.name || "Không xác định"}`} color="primary" />
                  <Chip
                    label={`Người quản lý: ${project.manager?.name || "Chưa có"}`}
                    sx={{ ml: 1 }}
                    color="secondary"
                  />
                  <Chip
                    label={`Phòng ban: ${project.department?.name || "Không có"}`}
                    sx={{ ml: 1 }}
                    color="success"
                  />
                </Box>
              </CardContent>
              {project.images?.length > 0 && (
                <CardMedia
                  component="img"
                  height="200"
                  image={`${process.env.REACT_APP_API_BASE_URL}${project.images[0]?.url}`}
                  alt={`Hình ảnh của dự án ${project.name}`}
                  sx={{ borderRadius: 2, marginTop: 2 }}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UserProjectPage;
