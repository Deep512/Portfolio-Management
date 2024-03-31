import React, { useState, useContext, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import "./index.css";
import { useParams, useNavigate } from "react-router-dom";
import * as ROUTES from "../../routes";

import createPlotlyComponent from "react-plotlyjs";
import Plotly from "plotly.js-basic-dist";
import UserContext from "../../context/userContext";
import Loader from "../Loader";
const PlotlyComponent = createPlotlyComponent(Plotly);

const Stock = () => {
	const [stockName, setStockName] = useState("");
	const [stockInfo, setStockInfo] = useState("");
	const [inWatchList, setInWatchList] = useState(false);
	const [current, setCurrent] = useState(0);
	const [invested, setInvested] = useState(0);
	const [returns, setReturns] = useState(0);
	const [xData, setXData] = useState([]);
	const [yData, setYData] = useState([]);
	const [price, setPrice] = useState(0);
	const [buyValue, setBuyValue] = useState(0);
	const [sellValue, setSellValue] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	const { stockSymbol: symbol } = useParams();
	const navigate = useNavigate();
	const { userId } = useContext(UserContext);

	const fetchData = useCallback(() => {
		fetch("http://localhost:8000/share", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: userId,
				symbol: symbol,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data["name"]) {
					setStockName(data["name"]);
					setStockInfo(data["info"]);
					setXData(data["xdata"]);
					setYData(data["y"]);
					setPrice(data["price"]);
					setIsLoading(false);
					setBuyValue(0);
					setSellValue(0);
					if (userId && userId !== "null" && userId !== "undefined") {
						setInWatchList(data["inWatchList"]);
						setCurrent(data["current"]);
						setInvested(data["invested"]);
						setReturns(data["returns"]);
					}
				} else {
					navigate(ROUTES.NOT_FOUND);
				}
			});
	}, [navigate, symbol, userId]);

	const onBuyValueChange = (event) => {
		setBuyValue(event.target.value);
	};

	const onSellValueChange = (event) => {
		if (event.target.value <= current) setSellValue(event.target.value);
	};

	const addToList = () => {
		fetch("http://localhost:8000/add", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: userId,
				symbol: symbol,
			}),
		}).then((response) => response.json());
		setInWatchList(true);
	};

	const removeFromList = () => {
		fetch("http://localhost:8000/remove", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: userId,
				symbol: symbol,
			}),
		}).then((response) => response.json());
		setInWatchList(false);
	};

	const buyShare = (event) => {
		event.preventDefault();
		if (!buyValue) return;
		fetch("http://localhost:8000/buy", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: userId,
				symbol: symbol,
				quantity: buyValue,
				price: price,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				fetchData();
			});
	};

	const sellShare = (event) => {
		event.preventDefault();
		if (!sellValue) return;
		fetch("http://localhost:8000/sell", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id: userId,
				symbol: symbol,
				quantity: sellValue,
				price: price,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				fetchData();
			});
	};

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	var plotData;
	if (xData) {
		var trace = {
			x: xData,
			y: yData,
			type: "scatter",
		};
		plotData = [trace];
	}
	return (
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
							{userId && userId !== "null" && userId !== "undefined" ? (
								<>
									<p style={{ fontSize: "17px" }}>
										{!inWatchList ? "Add to" : "Remove from"} Watch List
										<button
											className="watchlist"
											name="symbol"
											value={symbol}
											onClick={() =>
												!inWatchList ? addToList() : removeFromList()
											}
										>
											{!inWatchList ? "+" : "-"}
										</button>
									</p>
									<br></br>
									<form className="buy-form" onSubmit={buyShare}>
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
									<form className="sell-form" onSubmit={sellShare}>
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
	);
};

export default Stock;
