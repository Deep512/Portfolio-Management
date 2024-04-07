import React, { useContext } from "react"
import "./index.css"
import UserContext from "../../context/userContext"
import { useNavigate } from "react-router-dom"
import { Skeleton } from "@mui/material"
import * as ROUTES from "../../routes/index"
import { getWatchList, delFromWatchList } from "../../resources/api"
import { useQuery, useMutation, useQueryClient } from "react-query"
const WatchList = () => {
	const queryClient = useQueryClient()
	const { userId } = useContext(UserContext)
	const navigate = useNavigate()

	const {
		data: watchList,
		isError,
		error,
	} = useQuery({
		queryKey: ["watchlist", { userId }],
		queryFn: getWatchList,
		staleTime: 10 * 1000 * 60,
	})

	const { mutateAsync: deleteShare } = useMutation({
		mutationFn: delFromWatchList,
		onSuccess: () => {
			queryClient.invalidateQueries(["watchlist", { userId }])
			queryClient.invalidateQueries(["userShareInfo"])
		},
	})

	const setStock = (symbol) => {
		navigate(`/stock/${symbol}`)
	}

	return (
		<div>
			<h1 style={{ color: "white", paddingTop: "70px" }}>My Watch List</h1>
			<div id="link">
				{isError ? (
					<p>{error}</p>
				) : watchList && watchList.length ? (
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
											onClick={async () => {
												try {
													await deleteShare({ userId, symbol: share["symbol"] })
												} catch (err) {
													console.error(err)
												}
											}}
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
