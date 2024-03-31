import React, { useEffect, useRef, useState, useCallback } from "react"
import { Helmet } from "react-helmet"
import { useNavigate } from "react-router-dom"
import CircularProgress from "@mui/joy/CircularProgress"
import { Skeleton } from "@mui/material"

import "./index.css"
import Quote from "../Quote"

const PAGE_SIZE = 50
const StockList = ({ socket }) => {
	const navigate = useNavigate()

	const [stocks, setStocks] = useState([])
	const [searchResults, setSearchResults] = useState([])
	const [keyword, setKeyword] = useState("")
	const [isLoading, setIsLoading] = useState(true)
	const [isNextPageLoading, setIsNextPageLoading] = useState(false)
	const hasMore = useRef(true)
	const pageNumber = useRef(1)
	const scrollPosition = useRef(0)

	const observer = useRef()
	const lastStockRef = useCallback(
		(node) => {
			if (isLoading || isNextPageLoading) return
			if (observer.current) observer.current.disconnect()
			observer.current = new IntersectionObserver(
				(entries) => {
					const entry = entries[0]
					if (entry.isIntersecting && hasMore.current) {
						fetchStocks()
					}
				},
				{ threshold: 1 }
			)
			if (node) observer.current.observe(node)
		},
		[isLoading, isNextPageLoading]
	)

	const fetchSearchResults = (keyword) => {
		if (socket?.id) {
			socket.emit("search_keyword", keyword)
		}
	}

	useEffect(() => {
		socket &&
			socket.on("search_result", (resp) => {
				if (resp.error !== "") alert("Error: " + resp.error)
				else setSearchResults(resp.data)
			})
	}, [socket])

	const fetchStocks = (isFirstFetch = false) => {
		if (isFirstFetch) setIsLoading(true)
		else setIsNextPageLoading(true)

		fetch(
			`http://localhost:8000/paginated-stock-list?pageNumber=${encodeURIComponent(
				pageNumber.current
			)}&pageSize=${encodeURIComponent(PAGE_SIZE)}`
		)
			.then((response) => response.json())
			.then((result) => {
				if (result.next) {
					pageNumber.current = result.next.pageNumber
					hasMore.current = true
				} else hasMore.current = false
				setStocks((stocks) => [...stocks, ...result.results])
				if (isFirstFetch) setIsLoading(false)
				else setIsNextPageLoading(false)
			})
	}

	const handleScroll = () => {
		scrollPosition.current = window.scrollY
	}

	useEffect(() => {
		window.scrollTo(0, scrollPosition.current)
	}, [stocks])

	useEffect(() => {
		fetchStocks(true)
		window.addEventListener("scroll", handleScroll)

		return () => {
			window.removeEventListener("scroll", handleScroll)
		}
		// eslint-disable-next-line
	}, [])

	const setStock = (symbol) => {
		navigate(`/stock/${symbol}`)
	}

	const onKeywordChange = (e) => {
		setKeyword(e.target.value)
		if (e.target.value !== "") fetchSearchResults(e.target.value)
	}

	return (
		<div>
			<Helmet>
				<title>Stocks</title>
				<style>
					{
						"body{background: linear-gradient(89deg, #1f2739 0%, #1f2739 100%);}"
					}
				</style>
			</Helmet>
			<h1 className="stocklist-header">List of Stocks</h1>
			<div className="input-container">
				<span className="glyphicon glyphicon-search "></span>
				<input
					type="input"
					value={keyword}
					placeholder="What are you looking for today?"
					name="keyword"
					onChange={onKeywordChange}
				/>
				<br></br>
			</div>
			{searchResults.length > 0 && keyword && (
				<div className="search-results-container">
					{searchResults.map((result, key) => {
						return (
							<div
								key={result["symbol"]}
								className="search-result"
								onClick={() => setStock(result["symbol"])}
							>
								<p style={{ fontWeight: "bold" }}>{result.symbol}</p>

								<p>{result.name}</p>
							</div>
						)
					})}
				</div>
			)}
			{stocks && stocks.length ? (
				<table className="container">
					<tbody>
						{stocks?.map((stock, idx) => (
							<tr
								key={stock["symbol"]}
								ref={idx + 1 === stocks.length ? lastStockRef : null}
							>
								<td>{stock["share_name"]}</td>
								<td>
									<button onClick={() => setStock(stock["symbol"])}>
										View
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			) : (
				<div style={{ width: "70%", margin: "3% auto" }}>
					{[...Array(20).keys()].map((idx) => (
						<div key={idx}>
							<Skeleton
								variant="rectangular"
								width={"100%"}
								height={75}
								sx={{ margin: "1% auto" }}
							/>
						</div>
					))}
				</div>
			)}
			<div style={{ marginTop: "20px" }}>
				{isNextPageLoading && (
					<CircularProgress thickness={1} variant="solid" size="md" />
				)}
				<Quote />
			</div>
		</div>
	)
}

export default StockList
