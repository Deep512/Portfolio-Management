import React, { useContext, useState, useEffect } from "react"
import "./index.css"
import UserContext from "../../context/userContext"
import { useNavigate } from "react-router-dom"
import { Skeleton } from "@mui/material"
import * as ROUTES from "../../routes/index"

const WatchList = () => {
	const [watchList, setWatchList] = useState()

	const { userId } = useContext(UserContext)
	const navigate = useNavigate()
	const getList = () => {
		fetch("http://localhost:8000/watch-list", {
			method: "post",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: userId,
			}),
		})
			.then((response) => response.json())
			.then((shares) => {
				setWatchList(shares)
			})
	}

	const deleteShare = (symbol) => {
		fetch("http://localhost:8000/remove", {
			method: "post",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: userId,
				symbol: symbol,
			}),
		}).then((response) => response.json())
		var filtered = watchList.filter(function (value, index, arr) {
			return value["symbol"] !== symbol
		})
		setWatchList(filtered)
	}

	const setStock = (symbol) => {
		navigate(`/stock/${symbol}`)
	}

	useEffect(() => {
		getList()
		// eslint-disable-next-line
	}, [])

	return (
		<div>
			<h1 style={{ color: "white", paddingTop: "70px" }}>My Watch List</h1>
			<div id="link">
				{watchList && watchList.length ? (
					<table className="container">
						<tbody>
							{watchList.map((share) => (
								<tr key={share["symbol"]}>
									<td style={{ fontSize: "17px" }} key="1">
										{share["share_name"]}
									</td>
									<td key="2">
										<button
											className="wishlist-actions"
											onClick={() => setStock(share["symbol"])}
										>
											View
										</button>
										<button
											className="wishlist-actions"
											onClick={() => deleteShare(share["symbol"])}
										>
											Remove
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				) : watchList ? (
					<div
						style={{
							color: "white",
							marginTop: "10%",
							fontSize: "20px",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<p className="white f2 i">
							Add items to your watchlist from the&nbsp;
						</p>
						<p
							className="white f2 i underline pointer"
							onClick={() => navigate(ROUTES.STOCKLIST)}
						>
							Stocklist
						</p>
					</div>
				) : (
					<div style={{ width: "70%", margin: "3% auto" }}>
						{[...Array(20).keys()].map((idx) => (
							<div key={idx}>
								<Skeleton
									variant="rectangular"
									width={"100%"}
									height={100}
									sx={{ margin: "1% auto" }}
								/>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default WatchList
