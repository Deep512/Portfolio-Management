import React, { useState, useEffect, useContext } from "react";
import "./index.css";
import UserContext from "../../context/userContext";
import Loader from "../Loader";

const Profile = () => {
	const [userName, setUserName] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [current, setCurrent] = useState(0);
	const [invested, setInvested] = useState(0);
	const [returns, setReturns] = useState(0);

	const { userId } = useContext(UserContext);

	const fetchUser = () => {
		fetch("http://localhost:8000/profile", {
			method: "post",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: userId,
			}),
		})
			.then((response) => response.json())
			.then((user) => {
				setFirstName(user["firstname"]);
				setLastName(user["lastname"]);
				setUserName(user["username"]);
				setCurrent(user["current"]);
				setInvested(user["invested"]);
				setReturns(user["returns"]);
				setIsLoading(false);
			});
	};

	useEffect(() => {
		fetchUser();
		// eslint-disable-next-line
	}, []);

	return (
		<div className="profile-white-box">
			<div
				className="container"
				style={{
					textAlign: "center",
					paddingRight: "650px",
					paddingTop: "50px",
				}}
			>
				<p style={{ fontSize: "48px" }}>My Profile</p>
				<br />
				{isLoading ? (
					<Loader />
				) : (
					<div>
						<p>Username : {userName}</p>
						<p>
							Name : {firstName} {lastName}
						</p>
						<p>
							Current holdings : {current} share
							{current !== 1 ? "s" : ""}
						</p>
						<p>Total Invested : $ {invested.toFixed(2)}</p>
						<p>Total Returns : $ {returns.toFixed(2)}</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Profile;
