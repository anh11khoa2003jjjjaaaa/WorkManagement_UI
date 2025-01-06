

import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, Divider, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { Home, People, AccountCircle, ExitToApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Logo from '../../../AdminImage/logonew.png';
import Work from '@mui/icons-material/Work';
import Apartment from '@mui/icons-material/Apartment';
import Engineering from '@mui/icons-material/Engineering';
import Assignment from '@mui/icons-material/Assignment';
import LocationOn from '@mui/icons-material/LocationOn';
import Notifications from '@mui/icons-material/Notifications';


const useStyles = makeStyles((theme) => ({
    drawer: {
        width: 260,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
    },
    drawerPaper: {
        width: 260,
        backgroundColor: theme.palette.background.paper,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
    },
    logo: {
        display: 'flex',
        justifyContent: 'center',
        padding: theme.spacing(2),
    },
    menuItem: {
        width: 240,
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(0.5, 1),
        borderRadius: 12,
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    },
    menuIcon: {
        marginRight: theme.spacing(2),
    },
    activeMenuItem: {
        backgroundColor: '#1976d2',
        color: '#fff',
        borderRadius: 12,
        '&:hover': {
            backgroundColor: '#1976d2',
        },
    },
    logoutButtonContainer: {
        marginTop: 'auto',
        padding: theme.spacing(2),
    },
    logoutButton: {
        backgroundColor: '#f44336 !important',
        width: '100%',
        color: '#fff',
        borderRadius: 12,
    },
}));

const Sidebar = () => {
    const classes = useStyles();
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('/admin/dashboard');

    const handleItemClick = (path) => {
        setActiveItem(path);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        window.location.href = '/login'
    };

    const handleClickLogo = () => {
        navigate('/user/department');
    }

    return (
        <Drawer
            className={classes.drawer}
            variant="permanent"
            anchor="left"
            classes={{
                paper: classes.drawerPaper,
            }}
        >
            {/* Logo as a Link to /home */}
            <div className={classes.logo}>
                <Typography onClick={handleClickLogo}>
                    <img src={Logo} alt="Logo" style={{ width: 140, cursor: 'pointer' }} />
                </Typography>
            </div>

            <Divider />

            <List>
                <ListItem
                    component={Link}
                    to="/admin/dashboard"
                    className={`${classes.menuItem} ${activeItem === '/admin/dashboard' ? classes.activeMenuItem : ''}`}
                    onClick={() => handleItemClick('/admin/dashboard')}
                >
                    <Home className={classes.menuIcon} />
                    <ListItemText primary="Trang chủ" />
                </ListItem>

                <ListItem
                    component={Link}
                    to="/admin/department"
                    className={`${classes.menuItem} ${activeItem === '/admin/department' ? classes.activeMenuItem : ''}`}
                    onClick={() => handleItemClick('/admin/department')}
                >
                    <Apartment className={classes.menuIcon} />
                    <ListItemText primary="Quản lý phòng ban" />
                </ListItem>

                <ListItem
                    component={Link}
                    to="/admin/project"
                    className={`${classes.menuItem} ${activeItem === '/admin/project' ? classes.activeMenuItem : ''}`}
                    onClick={() => handleItemClick('/admin/project')}
                >
                    <Engineering className={classes.menuIcon} />
                    <ListItemText primary="Quản lý dự án" />
                </ListItem>

                <ListItem
                    component={Link}
                    to="/admin/projectTask"
                    className={`${classes.menuItem} ${activeItem === '/admin/projectTask' ? classes.activeMenuItem : ''}`}
                    onClick={() => handleItemClick('/admin/projectTask')}
                >
                    <Assignment className={classes.menuIcon} />
                    <ListItemText primary="Quản lý công việc" />
                </ListItem>


                <ListItem
                    component={Link}
                    to="/admin/taskEployee"
                    className={`${classes.menuItem} ${activeItem === '/admin/taskEployee' ? classes.activeMenuItem : ''}`}
                    onClick={() => handleItemClick('/admin/taskEployee')}
                >
                    <Work className={classes.menuIcon} />
                    <ListItemText primary="Công việc nhân viên" />
                </ListItem>

                <ListItem
                    component={Link}
                    to="/admin/user"
                    className={`${classes.menuItem} ${activeItem === '/admin/user' ? classes.activeMenuItem : ''}`}
                    onClick={() => handleItemClick('/admin/user')}
                >
                    <People className={classes.menuIcon} />
                    <ListItemText primary="Quản lý người dùng" />
                </ListItem>

                <ListItem
                    component={Link}
                    to="/admin/position"
                    className={`${classes.menuItem} ${activeItem === '/admin/position' ? classes.activeMenuItem : ''}`}
                    onClick={() => handleItemClick('/admin/position')}
                >
                    <LocationOn className={classes.menuIcon} />
                    <ListItemText primary="Quản lý vị trí" />
                </ListItem>

                <ListItem
                    component={Link}
                    to="/admin/notification"
                    className={`${classes.menuItem} ${activeItem === '/admin/notification' ? classes.activeMenuItem : ''}`}
                    onClick={() => handleItemClick('/admin/notification')}
                >
                    <Notifications className={classes.menuIcon} />
                    <ListItemText primary="Gửi thông báo" />
                </ListItem>

                <ListItem
                    component={Link}
                    to="/admin/account"
                    className={`${classes.menuItem} ${activeItem === '/admin/account' ? classes.activeMenuItem : ''}`}
                    onClick={() => handleItemClick('/admin/account')}
                >
                    <AccountCircle className={classes.menuIcon} />
                    <ListItemText primary="Quản lý tài khoản" />
                </ListItem>

            </List>

            <div className={classes.logoutButtonContainer}>
                <Button
                    className={classes.logoutButton}
                    variant="contained"
                    startIcon={<ExitToApp />}
                    onClick={handleLogout}
                >
                    Đăng xuất
                </Button>
            </div>
        </Drawer>
    );
};

export default Sidebar;
