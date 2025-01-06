import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminRoutes from "./Admin/AdminRoutes";
import UserRoutes from "./User/UserRoutes";
import PrivateRoute from "./PrivateRoutes";
import Layout from "./Admin/components/Layout/DefaultLayout";
import DefaultLayout from "./User/components/Layout/DefaultLayout";
import { Provider } from "react-redux";//
import store from "./User/Redux/store"//
// import { UserProvider } from "~/user/components/Context/UserContext";
import UserNotFound from "./User/pages/404"; // Import Error404
import ErrorBoundary  from "./Admin/components/TaskEmployeePage/ErrorBoundary"
function App() {
  return (
     <Provider store={store}>
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            {/* Điều hướng mặc định tới "/home" */}
            <Route path="/" element={<Navigate to="/user/department" />} />

            {/* Các route dành cho admin */}
            {AdminRoutes.map((route, index) => {
              const Page = route.component;
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <PrivateRoute
                      element={<Layout><Page /></Layout>}
                      isAdminRequired={false}
                    />
                  }
                />
              );
            })}

            {/* Các route dành cho user */}
            {UserRoutes.map((route, index) => {
              const Page = route.component;
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <DefaultLayout>
                      <Page />
                    </DefaultLayout>
                  }
                />
              );
            })}

          
            <Route path="*" element={<UserNotFound />} />
          </Routes>
        </div>
      </Router>
      </ErrorBoundary>
      </Provider>
  );
}

export default App;
