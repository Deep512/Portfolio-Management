import React, { useState, useContext } from "react"
import { Helmet } from "react-helmet"
import "./index.css"
import { useParams, Navigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "react-query"
import * as ROUTES from "../../routes"
import createPlotlyComponent from "react-plotlyjs"
import Plotly from "plotly.js-basic-dist"
import UserContext from "../../context/userContext"
import Loader from "../Loader"
import {
	addToWatchList,
	delFromWatchList,
	getShareData,
	getUserShareData,
	performTransaction,
} from "../../resources/api"
const PlotlyComponent = createPlotlyComponent(Plotly)

const Stock = () => {
	const [buyValue, setBuyValue] = useState(0)
	const [sellValue, setSellValue] = useState(0)

	const { stockSymbol: symbol } = useParams()
	const { userId, isAuthenticated } = useContext(UserContext)

	const queryClient = useQueryClient()

	const shareInfoQuery = useQuery({
		queryKey: ["shareInfo", { symbol }],
		queryFn: getShareData,
		staleTime: 1000,
	})

	const { data: shareData, isLoading, isError } = shareInfoQuery

	const userShareInfoQuery = useQuery({
		queryKey: ["userShareInfo", { userId, symbol }],
		queryFn: getUserShareData,
		staleTime: 10 * 60 * 1000,
		enabled: isAuthenticated,
	})

	const { data: userShareData } = userShareInfoQuery

	if (shareData) {
		var {
			name: stockName,
			info: stockInfo,
			xdata: xData,
			y: yData,
			price,
		} = shareData
		var plotData
		if (xData) {
			var trace = {
				x: xData,
				y: yData,
				type: "scatter",
			}
			plotData = [trace]
		}
	}
	if (userShareData)
		var { inWatchList, current, invested, returns } = userShareData

	const onBuyValueChange = (event) => {
		setBuyValue(event.target.value)
	}

	const onSellValueChange = (event) => {
		if (event.target.value <= current) setSellValue(event.target.value)
	}

	const { mutateAsync: addShareToWatchList } = useMutation({
		mutationFn: addToWatchList,
		onSuccess: (data) => {
			queryClient.setQueryData(["watchlist", { userId }], data)
			queryClient.setQueryData(
				["userShareInfo", { userId, symbol }],
				(oldData) => {
					return {
						...oldData,
						inWatchList: true,
					}
				}
			)
		},
	})

	const { mutateAsync: deleteShareFromWatchList } = useMutation({
		mutationFn: delFromWatchList,
		onSuccess: (data) => {
			queryClient.setQueryData(["watchlist", { userId }], data)
			queryClient.setQueryData(
				["userShareInfo", { userId, symbol }],
				(oldData) => {
					return {
						...oldData,
						inWatchList: false,
					}
				}
			)
		},
	})

	const { mutateAsync: placeOrder } = useMutation({
		mutationFn: performTransaction,
		onSuccess: () => {
			queryClient.invalidateQueries(["userShareInfo", { userId, symbol }])
			queryClient.invalidateQueries(["profile", { userId }])
		},
	})

	const onSubmit = async (e, isBuyTransaction) => {
		e.preventDefault()
		const quantity = isBuyTransaction ? buyValue : sellValue
		if (!quantity) return
		try {
			await placeOrder({
				userId,
				symbol,
				quantity: isBuyTransaction ? buyValue : sellValue,
				price,
				isBuyTransaction,
			})
			isBuyTransaction ? setBuyValue(0) : setSellValue(0)
		} catch (err) {
			console.error(err)
		}
	}

	return isError ? (
		<Navigate to={ROUTES.NOT_FOUND} />
	) : (
		<div>
			<Helmet>
				<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
				<title>{symbol}</title>
				<style>
					{
						"body{background: linear-gradient(89deg, #1f2739 0%, #1f2739 100%);}"
					}
				</style>
			</Helmet>
			{!isLoading ? (
				<div className="stock-white-box">
					<center>
						<p style={{ fontSize: "40px" }}>{stockName}</p>
						<p>{stockInfo}</p>
					</center>
					<div className="container">
						<div style={{ width: "30%", float: "left" }}>
							<p style={{ fontSize: "25px" }}>Symbol : {symbol}</p>
							<p style={{ fontSize: "17px" }}>Current price : $ {price}</p>
							{isAuthenticated ? (
								<>
									{!userShareInfoQuery.isLoading &&
									!userShareInfoQuery.isError ? (
										<>
											<p style={{ fontSize: "17px" }}>
												Current holdings : {current} share
												{current !== 1 ? "s" : ""}
											</p>
											<p style={{ fontSize: "17px" }}>
												Net Worth : $ {(current * price).toFixed(2)}
											</p>
											<p style={{ fontSize: "17px" }}>
												Total Invested : $ {invested.toFixed(2)}
											</p>
											<p style={{ fontSize: "17px" }}>
												Total Returns : $ {returns.toFixed(2)}
											</p>
											<p style={{ fontSize: "17px" }}>
												Total Profit/Loss (Including Net Worth) : $
												{(current * price + (returns - invested)).toFixed(2)}
											</p>
											<br></br>
										</>
									) : null}
									<p style={{ fontSize: "17px" }}>
										{!inWatchList ? "Add to" : "Remove from"} Watch List
										<button
											className="watchlist"
											name="symbol"
											value={symbol}
											onClick={async () => {
												try {
													if (!inWatchList)
														await addShareToWatchList({ userId, symbol })
													else
														await deleteShareFromWatchList({ userId, symbol })
												} catch (err) {
													console.error(err)
												}
											}}
										>
											{!inWatchList ? "+" : "-"}
										</button>
									</p>
									<br></br>
									<form
										className="buy-form"
										onSubmit={async (e) => await onSubmit(e, true)}
									>
										<input
											style={{ width: "37%" }}
											type="number"
											name="quantity"
											min="1"
											value={buyValue}
											onChange={onBuyValueChange}
										/>
										&nbsp;
										<input
											type="hidden"
											name="symbol"
											value={symbol}
											onChange={onBuyValueChange}
										/>
										<input
											type="hidden"
											name="price"
											value={price}
											onChange={onBuyValueChange}
										/>
										<input
											style={{ backgroundColor: "green" }}
											type="submit"
											name="buy"
											value="Buy"
										/>
									</form>
									<br></br>
									<form
										className="sell-form"
										onSubmit={async (e) => await onSubmit(e, false)}
									>
										<input
											style={{ width: "37%" }}
											type="number"
											name="quantity"
											min="1"
											value={sellValue}
											onChange={onSellValueChange}
										/>
										&nbsp;
										<input
											type="hidden"
											name="symbol"
											value={symbol}
											onChange={onSellValueChange}
										/>
										<input
											type="hidden"
											name="price"
											value={price}
											onChange={onSellValueChange}
										/>
										<input
											style={{ backgroundColor: "#cc0000" }}
											type="submit"
											name="sell"
											value="Sell"
										/>
									</form>
								</>
							) : null}
						</div>
						<div style={{ width: "50%", float: "right" }}>
							<div id="tester" style={{ width: "450px", height: "250px" }}>
								<PlotlyComponent
									className="whatever"
									data={plotData}
									layout={{ width: 400, height: 300 }}
									config={{
										showLink: false,
										displayModeBar: true,
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			) : (
				<Loader />
			)}
		</div>
	)
}

export default Stock
