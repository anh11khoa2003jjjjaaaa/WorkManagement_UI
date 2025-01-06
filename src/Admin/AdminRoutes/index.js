import AdminAccounts from "../pages/AdminAccounts";
import AdminDashboard from "../pages/AdminDashboard";
import AdminDepartment from "../pages/AdminDepartment";
import AdminNotification from "../pages/AdminNotification";
import AdminPosition from "../pages/AdminPosition";
import AdminProject from "../pages/AdminProject";
import AdminProjectTask from "../pages/AdminProjectTask";
import AdminTaskEmployee from "../pages/AdminTaskEmployee";
import AdminUser from "../pages/AdminUser";

const AdminRoutes = [
    { path: '/admin/dashboard', component: AdminDashboard },
    { path: '/admin/department', component: AdminDepartment },
    { path: '/admin/project', component: AdminProject },
    { path: '/admin/projectTask', component: AdminProjectTask },
    { path: '/admin/taskEployee', component: AdminTaskEmployee },
    { path: '/admin/user', component: AdminUser },
    { path: '/admin/notification', component: AdminNotification },
    { path: '/admin/position', component: AdminPosition },
    { path: '/admin/account', component: AdminAccounts },

];

export default AdminRoutes;