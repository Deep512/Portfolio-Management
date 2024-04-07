import React from "react"
import { Outlet, Navigate } from "react-router-dom"
const IsUserLoggedIn = (props) => {
	const { isAuthenticated, redirectPath } = props
	return isAuthenticated ? <Navigate to={redirectPath} /> : <Outlet />
}

export default IsUserLoggedIn
