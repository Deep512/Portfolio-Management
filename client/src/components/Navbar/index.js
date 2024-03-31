import React from "react";
import "./index.css";
import { Link, useNavigate } from "react-router-dom";
import * as ROUTES from "../../routes";
const Navbar = ({ isAuthenticated, setUserId }) => {
	const navigate = useNavigate();
	return isAuthenticated ? (
		<nav style={{ height: "20%", paddingBottom: "0px", border: "2px" }}>
			<nav className="navbar navbar-inverse" style={{ marginBottom: "0px" }}>
				<div
					className="container-fluid"
					style={{ display: "inline-block", float: "left" }}
				>
					<div className="navbar-header">
						<h5
							className="navbar-brand"
							style={{
								marginBottom: "0px",
								marginTop: "0px",
								fontSize: "20px",
							}}
							onClick={() => navigate(ROUTES.DASHBOARD)}
						>
							Portfolio Manager
						</h5>
					</div>
					<ul
						className="nav navbar-nav"
						style={{ display: "inline-block", float: "left" }}
					>
						<li
							id="my-profile"
							style={{
								display: "inline-block",
								float: "left",
								marginLeft: "25px",
								marginTop: "7px",
								marginBottom: "0px",
							}}
						>
							<h5 style={{ fontSize: "17px" }} className="navbar-link">
								<Link to={ROUTES.PROFILE}>My Profile</Link>
							</h5>
						</li>
						<li
							id="my-watch-list"
							style={{
								display: "inline-block",
								float: "left",
								marginLeft: "25px",
								marginTop: "7px",
								marginBottom: "0px",
							}}
						>
							<h5 style={{ fontSize: "17px" }} className="navbar-link">
								<Link to={ROUTES.WATCHLIST}>Watch List</Link>
							</h5>
						</li>
						<li
							id="my-stock-list"
							style={{
								display: "inline-block",
								float: "left",
								marginLeft: "25px",
								marginTop: "7px",
								marginBottom: "0px",
							}}
						>
							<h5 style={{ fontSize: "17px" }} className="navbar-link">
								<Link to={ROUTES.STOCKLIST}>Stock List</Link>
							</h5>
						</li>
					</ul>
					<ul
						className="nav navbar-nav navbar-right"
						style={{
							display: "inline-block",
							float: "left",
						}}
					>
						<li
							id="update-profile"
							style={{
								display: "inline-block",
								float: "left",
								marginLeft: "25px",
								marginTop: "7px",
								marginBottom: "0px",
							}}
						>
							<h5 style={{ fontSize: "17px" }} className="navbar-link">
								<span className="glyphicon glyphicon-user"></span>
								<Link to={ROUTES.UPDATE_PROFILE}>Update Profile</Link>
							</h5>
						</li>
						<li
							id="logout"
							style={{
								display: "inline-block",
								float: "left",
								marginLeft: "25px",
								marginTop: "7px",
								marginBottom: "0px",
							}}
						>
							<h5
								style={{ fontSize: "17px" }}
								className="navbar-link"
								onClick={() => {
									setUserId(null);
								}}
							>
								<span className="glyphicon glyphicon-log-out"></span>
								<Link to={ROUTES.LOGIN}>Log out</Link>
							</h5>
						</li>
					</ul>
				</div>
			</nav>
		</nav>
	) : (
		<nav
			style={{
				display: "flex",
				width: "100%",
				alignItems: "center",
			}}
		>
			<h2
				className="link dim blue pa3 pointer"
				onClick={() => navigate(ROUTES.DASHBOARD)}
				style={{ padding: "10px", margin: "0 auto" }}
			>
				Portfolio Manager
			</h2>
			<div style={{ display: "flex", margin: "0 auto" }}>
				<h4
					className="link dim blue underline pa3 pointer"
					onClick={() => navigate(ROUTES.LOGIN)}
				>
					Sign In
				</h4>
				<h4
					className="link dim blue underline pa3 pointer"
					onClick={() => navigate(ROUTES.REGISTER)}
				>
					Register
				</h4>
			</div>
			<br />
		</nav>
	);
};

export default Navbar;
