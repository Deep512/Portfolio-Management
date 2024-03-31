import React, { useState, useContext, useRef } from "react";
import "./index.css";
import UserContext from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import * as ROUTES from "../../routes";

const Signin = () => {
	const [userName, setUserName] = useState("");
	const [password, setPassword] = useState("");

	const { setUserId } = useContext(UserContext);
	const navigate = useNavigate();
	const errorRef = useRef(null);
	const invalidDetails = (response) => {
		errorRef.current.innerHTML =
			response === "Invalid username" || "Wrong Password"
				? "Invalid username or password"
				: "";
	};

	const onUsernameChange = (event) => {
		setUserName(event.target.value);
	};

	const onPasswordChange = (event) => {
		setPassword(event.target.value);
	};

	const onSubmitSignIn = () => {
		fetch("http://localhost:8000/login", {
			method: "post",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: userName,
				password: password,
			}),
		})
			.then((response) => response.json())
			.then((user) => {
				if (user["user_id"]) {
					setUserId(user["user_id"]);
				} else {
					invalidDetails(user);
				}
			});
	};
	return (
		<div className="signin-area">
			<center>
				<h1 style={{ color: "black", paddingTop: "30px", marginTop: "0px" }}>
					Login
				</h1>
			</center>
			<div className="imgcontainer">
				<img
					src={"/images/img_avatar.png"}
					alt="Avatar"
					className="avatar"
					style={{
						width: "100px",
						height: "100px",
					}}
				/>
			</div>
			<article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw7 pa5 shadow-5 center">
				<main className="pa4 black-80">
					<fieldset id="signup" className="ba b--transparent ph0 mh0">
						<p ref={errorRef}></p>
						<h4 htmlFor="username" style={{ color: "black" }}>
							<b>Username</b>
						</h4>
						<input
							type="input"
							placeholder="Enter Username"
							name="username"
							onChange={onUsernameChange}
						/>
						<br></br>
						<h4 htmlFor="password" style={{ color: "black" }}>
							<b>Password</b>
						</h4>
						<input
							type="password"
							placeholder="Enter Password"
							name="password"
							onChange={onPasswordChange}
						/>
						<br />
						<br />
						<input
							type="submit"
							name="login"
							value="Login"
							onClick={onSubmitSignIn}
						></input>

						<p
							style={{ textAlign: "center" }}
							className="f3 link dim dark-blue underline black pa3 pointer"
							onClick={() => navigate(ROUTES.REGISTER, { replace: true })}
						>
							Not a member? Sign Up
						</p>
					</fieldset>
				</main>
			</article>
		</div>
	);
};

export default Signin;
