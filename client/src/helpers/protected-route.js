import React from "react";
import { Outlet, Navigate } from "react-router-dom";
const ProtectedRoute = (props) => {
	const { isAuthenticated, redirectPath } = props;
	return isAuthenticated ? <Outlet /> : <Navigate to={redirectPath} />;
};

export default ProtectedRoute;
