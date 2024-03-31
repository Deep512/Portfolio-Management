import React, { useEffect } from "react"

const Dashboard = (props) => {
	useEffect(() => {
		document.title = "Portfolio Manager"
	}, [])

	return <div style={{ color: "white" }}>DASHBOARD</div>
}

export default Dashboard
