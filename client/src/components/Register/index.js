import React, { useState, useContext, useRef } from "react"
import "./index.css"
import * as ROUTES from "../../routes"
import { useNavigate } from "react-router-dom"
import UserContext from "../../context/userContext"
const Register = () => {
	const [formData, setFormData] = useState({
		userName: "",
		firstName: "",
		lastName: "",
		password: "",
		confPassword: "",
	})

	const { setUserId } = useContext(UserContext)
	const navigate = useNavigate()
	const errorRef = useRef(null)

	const invalidDetails = (response) => {
		if (response === "empty username") {
			errorRef.current.innerHTML = "Username is required"
		} else if (response === "username exists") {
			errorRef.current.innerHTML = "Username already exists"
		} else if (response === "empty firstname") {
			errorRef.current.innerHTML = "Firstname is required"
		} else if (response === "empty password") {
			errorRef.current.innerHTML = "Password can't be empty"
		} else if (response === "unmatching password") {
			errorRef.current.innerHTML = "Passwords don't match"
		}
	}

	const handleChange = (event) => {
		const { name, value } = event.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const onSubmitRegister = () => {
		const { userName, firstName, lastName, password, confPassword } = formData
		fetch("http://localhost:8000/register", {
			method: "post",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: userName,
				password: password,
				confirm_password: confPassword,
				firstname: firstName,
				lastname: lastName,
			}),
		})
			.then((response) => response.json())
			.then((user) => {
				if (user["user_id"]) {
					setUserId(user["user_id"])
				} else {
					invalidDetails(user)
				}
			})
	}
	return (
		<div className="register-area">
			<center style={{ color: "black" }}>
				<h1 style={{ paddingTop: "30px", marginTop: "0px" }}>Sign Up</h1>
				<h3>Please fill in this form to create an account.</h3>
			</center>
			<article className="br3 ba b--black-10 mv4 w-100 w-50-m mw7 shadow-5 center">
				<main className="pa4 black-80">
					<fieldset id="signup" className="ba b--transparent ph0 mh0">
						<p ref={errorRef}></p>
						<h4 htmlFor="username">
							<b>Username</b>
						</h4>
						<input
							type="input"
							placeholder="Enter Username"
							name="userName"
							value={formData.userName}
							onChange={handleChange}
						/>
						<br></br>
						<h4 htmlFor="firstName">
							<b>First name</b>
						</h4>
						<input
							type="input"
							placeholder="Enter First name"
							name="firstName"
							value={formData.firstName}
							onChange={handleChange}
						/>
						<br></br>
						<h4 htmlFor="lastName">
							<b>Last name</b>
						</h4>
						<input
							type="input"
							placeholder="Enter Last name"
							name="lastName"
							value={formData.lastName}
							onChange={handleChange}
						/>
						<br></br>
						<h4 htmlFor="password">
							<b>Password</b>
						</h4>
						<input
							type="password"
							placeholder="Enter Password"
							name="password"
							value={formData.password}
							onChange={handleChange}
						/>
						<br></br>
						<h4 htmlFor="confPassword">
							<b>Confirm Password</b>
						</h4>
						<input
							type="password"
							placeholder="Enter Confirm Password"
							name="confPassword"
							value={formData.confPassword}
							onChange={handleChange}
						/>
						<br />
						<br />
						<input
							type="submit"
							name="signup"
							value="Register"
							onClick={() => onSubmitRegister()}
						></input>
						<h4
							style={{ textAlign: "center" }}
							className="f3 link dim dark-blue underline black pa3 pointer"
							onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
						>
							Already a member? Sign in
						</h4>
					</fieldset>
				</main>
			</article>
		</div>
	)
}

export default Register
