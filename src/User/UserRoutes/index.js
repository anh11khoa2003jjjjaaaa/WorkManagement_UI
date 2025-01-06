

import UserNotFound from "../pages/404";
import UserChangePass from "../pages/UserChangePass";
import UserDepartment from "../pages/UserDepartment";
import UserForgotPassword from "../pages/UserFotgotPassword";
import UserLogin from "../pages/UserLogin";
import UserProfile from "../pages/UserProfile";
import UserProject from "../pages/UserProject";
import UserProjectTaskDetail from "../pages/UserProjectTask";

import UserRegister from "../pages/UserRegister";


const UserRoutes=[

    { path: '/login', component: UserLogin },
    { path: '/register', component: UserRegister },
    { path: '/forgot-password', component: UserForgotPassword },
    { path: '/user/projects/department/:departmentId', component: UserProject },
    { path: '/user/projects/:projectId', component: UserProjectTaskDetail },
    { path: '/user/profile', component: UserProfile },
    { path: '/user/change-pass', component: UserChangePass },
    { path: '/user/department', component: UserDepartment },
    { path: '/user/NotFound404', component: UserNotFound },
];


export default UserRoutes;