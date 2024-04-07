import React, { useContext } from "react"
import "./index.css"
import UserContext from "../../context/userContext"
import Loader from "../Loader"
import { useQuery } from "react-query"
import { fetchProfileData } from "../../resources/api"

const Profile = () => {
	const { userId } = useContext(UserContext)

	const {
		data: userData,
		isLoading,
		isError,
		error,
		status,
	} = useQuery({
		queryKey: ["profile", { userId }],
		queryFn: fetchProfileData,
		staleTime: 10 * 60 * 1000,
	})

	if (status === "success")
		var { username, firstname, lastname, current, invested, returns } = userData

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
				{isError ? (
					<p>{error.message}</p>
				) : isLoading ? (
					<Loader />
				) : (
					<div>
						<p>Username : {username}</p>
						<p>
							Name : {firstname} {lastname}
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
	)
}

export default Profile
