import React, { Suspense, lazy, useState, useMemo, useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import { Helmet } from "react-helmet"
import io from "socket.io-client"
import { QueryClientProvider, QueryClient } from "react-query"
import UserContext from "../context/userContext.js"
import StockContext from "../context/stockContext.js"

import "./App.css"
import Loader from "../components/Loader"
import Navbar from "../components/Navbar"
import useAuthListener from "../hooks/use-auth-listener.js"
import * as ROUTES from "../routes/index.js"
import IsUserLoggedIn from "../helpers/is-user-logged-in.js"
import ProtectedRoute from "../helpers/protected-route.js"

const Signin = lazy(() => import("../components/Signin/index.js"))
const Register = lazy(() => import("../components/Register/index.js"))
const Dashboard = lazy(() => import("../pages/dashboard.js"))
const Profile = lazy(() => import("../components/Profile/index.js"))
const WatchList = lazy(() => import("../components/WatchList/index.js"))
const StockList = lazy(() => import("../components/StockList/index.js"))
const Stock = lazy(() => import("../components/Stock/index.js"))
const UpdateProfile = lazy(() => import("../components/UpdateProfile/index.js"))
const NotFound = lazy(() => import("../components/404/index.js"))

const App = () => {
	const { userId, setUserId } = useAuthListener()
	const isAuthenticated = userId !== null
	const { stockSymbol, setStockSymbol } = useState("")

	//Query Client
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
			},
		},
	})

	// Socket
	const socket = useMemo(() => io("http://localhost:8000"), [])

	useEffect(() => {
		socket.on("connect", () => console.log("user connected", socket.id))
		return () => {
			socket.disconnect()
		}
	}, [socket])

	if (userId === undefined) return null

	return (
		<QueryClientProvider client={queryClient}>
			<UserContext.Provider value={{ userId, setUserId, isAuthenticated }}>
				<StockContext.Provider value={{ stockSymbol, setStockSymbol }}>
					<div className="App">
						<Helmet>
							<title>Portfolio Manager</title>
							{isAuthenticated ? (
								<style>
									{
										"body{background: linear-gradient(89deg, #1f2739 0%, #1f2739 100%);}"
									}
								</style>
							) : null}
						</Helmet>
						<link
							rel="stylesheet"
							href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
						/>
						<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
						<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
						<Navbar isAuthenticated={isAuthenticated} setUserId={setUserId} />
						<Suspense fallback={<Loader />}>
							<Routes>
								<Route
									element={
										<IsUserLoggedIn
											isAuthenticated={isAuthenticated}
											redirectPath={ROUTES.DASHBOARD}
										/>
									}
								>
									<Route path={ROUTES.LOGIN} element={<Signin />} />
									<Route path={ROUTES.REGISTER} element={<Register />} />
								</Route>
								<Route
									element={
										<ProtectedRoute
											isAuthenticated={isAuthenticated}
											redirectPath={ROUTES.LOGIN}
										/>
									}
								>
									<Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
									<Route path={ROUTES.PROFILE} element={<Profile />} />
									<Route path={ROUTES.WATCHLIST} element={<WatchList />} />
									<Route
										path={ROUTES.UPDATE_PROFILE}
										element={<UpdateProfile />}
									/>
								</Route>

								<Route
									path={ROUTES.STOCKLIST}
									element={<StockList socket={socket} />}
								/>
								<Route path={ROUTES.STOCK} element={<Stock />} />
								<Route path="*" element={<NotFound />} />
							</Routes>
						</Suspense>
					</div>
				</StockContext.Provider>
			</UserContext.Provider>
		</QueryClientProvider>
	)
}

export default App
