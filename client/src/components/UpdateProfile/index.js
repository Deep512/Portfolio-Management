import React, { useContext, useEffect, useRef, useState } from "react"
import "./index.css"
import { useNavigate } from "react-router-dom"
import UserContext from "../../context/userContext"
import * as ROUTES from "../../routes"

const UpdateProfile = () => {
	const [userName, setUserName] = useState("")
	const [firstName, setFirstName] = useState("")
	const [lastName, setLastName] = useState("")
	const [oldPassword, setOldPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confPassword, setConfPassword] = useState("")
	const [flag, setFlag] = useState(false)

	const { userId } = useContext(UserContext)
	const navigate = useNavigate()
	const errorRef = useRef(null)

	const invalidDetails = (response) => {
		if (response === "empty username") {
			errorRef.current.innerHTML = "Username is required"
		} else if (response === "username exists") {
			errorRef.current.innerHTML = "Username already exists"
		} else if (response === "empty firstname") {
			errorRef.current.innerHTML = "Firstname is required"
		} else if (response === "incorrect old password") {
			errorRef.current.innerHTML = "Old password is incorrect"
		} else if (response === "empty new password") {
			errorRef.current.innerHTML = "New password can't be empty"
		} else if (response === "unmatching password") {
			errorRef.current.innerHTML = "Passwords don't match"
		}
	}

	const onUsernameChange = (event) => {
		setUserName(event.target.value)
	}

	const onFnameChange = (event) => {
		setFirstName(event.target.value)
	}

	const onLnameChange = (event) => {
		setLastName(event.target.value)
	}

	const onOldPasswordChange = (event) => {
		setOldPassword(event.target.value)
	}

	const onPasswordChange = (event) => {
		setNewPassword(event.target.value)
	}

	const onConfirmPasswordChange = (event) => {
		setConfPassword(event.target.value)
	}

	const onUpdateProfile = () => {
		fetch("http://localhost:8000/save", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: userName,
				old_password: oldPassword,
				new_password: newPassword,
				confirm_password: confPassword,
				firstname: firstName,
				lastname: lastName,
				id: userId,
			}),
		})
			.then((response) => response.json())
			.then((user) => {
				if (user["affectedRows"]) {
					navigate(ROUTES.PROFILE)
				} else {
					invalidDetails(user)
				}
			})
	}

	const fetchData = () => {
		fetch("http://localhost:8000/update-profile", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: userId,
			}),
		})
			.then((response) => response.json())
			.then((user) => {
				setUserName(user["username"])
				setFirstName(user["firstname"])
				setLastName(user["lastname"])
				setFlag(true)
			})
	}

	useEffect(() => {
		fetchData()
		// eslint-disable-next-line
	}, [])

	return (
		<div>
			{flag === false ? (
				<h1>Loading...</h1>
			) : (
				<div className="update-area">
					<center style={{ color: "white" }}>
						<h1 style={{ paddingTop: "40px", marginTop: "0px" }}>
							Update Profile
						</h1>
					</center>
					<article
						className=" br3 ba b--black-10 mv4 w-100 w-50-m mw7 shadow-5 center"
						style={{ backgroundColor: "#ddd" }}
					>
						<main className="pa4 black-80">
							<fieldset id="signup" className="ba b--transparent ph0 mh0">
								<p ref={errorRef}></p>
								<h4 htmlFor="username">
									<b>Username</b>
								</h4>
								<input
									type="input"
									placeholder="Enter Username"
									name="username"
									value={userName}
									onChange={onUsernameChange}
								/>
								<br></br>
								<h4 htmlFor="fname">
									<b>First name</b>
								</h4>
								<input
									type="input"
									placeholder="Enter First name"
									name="fname"
									value={firstName}
									onChange={onFnameChange}
								/>
								<br></br>
								<h4 htmlFor="lname">
									<b>Last name</b>
								</h4>
								<input
									type="input"
									placeholder="Enter Last name"
									name="lname"
									value={lastName}
									onChange={onLnameChange}
								/>
								<br></br>
								<h4 htmlFor="opassword">
									<b>Old Password</b>
								</h4>
								<input
									type="password"
									placeholder="Enter Old Password"
									name="opassword"
									onChange={onOldPasswordChange}
								/>
								<br></br>
								<h4 htmlFor="password">
									<b>Password</b>
								</h4>
								<input
									type="password"
									placeholder="Enter New Password"
									name="password"
									onChange={onPasswordChange}
								/>
								<br></br>
								<h4 htmlFor="cpassword">
									<b>Confirm Password</b>
								</h4>
								<input
									type="password"
									placeholder="Enter Confirm New Password"
									name="cpassword"
									onChange={onConfirmPasswordChange}
								/>
								<br />
								<br />
								<input
									type="submit"
									name="update"
									value="Update Profile"
									onClick={() => onUpdateProfile()}
								></input>
							</fieldset>
						</main>
					</article>
				</div>
			)}
		</div>
	)
}

export default UpdateProfile
