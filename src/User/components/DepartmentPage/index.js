
import React, { useEffect, useState } from "react";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    Alert,
    CardActionArea,
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DepartmentPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Hook điều hướng

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/Department`
                );
                setDepartments(response.data);
            } catch (err) {
                setError("Không thể tải danh sách phòng ban.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ color: "primary.main", textAlign: "center", mb: 4 }}
            >
                Danh sách phòng ban
            </Typography>
            <Grid container spacing={3}>
                {departments.map((department, index) => (
                    <Grid item xs={12} sm={6} md={4} key={department.id}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Card
                                sx={{
                                    height: "100%",
                                    bgcolor: index % 2 === 0 ? "#f5f5f5" : "#e0f7fa",
                                    borderRadius: 2,
                                    boxShadow: 3,
                                }}
                            >
                                <CardActionArea onClick={() => navigate(`/user/projects/department/${department.id}`)}>
                                    <CardContent>
                                        <Typography 
                                            variant="h6" 
                                            gutterBottom
                                            sx={{ color: "secondary.main", fontWeight: "bold" }}
                                        >
                                            {department.name}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                        >
                                            {department.description}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default DepartmentPage;
