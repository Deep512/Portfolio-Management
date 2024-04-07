import React, { useEffect, useRef, useState, useCallback } from "react"
import { Helmet } from "react-helmet"
import { useNavigate } from "react-router-dom"
import CircularProgress from "@mui/joy/CircularProgress"
import { Skeleton } from "@mui/material"
import { useInfiniteQuery } from "react-query"

import "./index.css"
import Quote from "../Quote"
import { getPaginatedStockList } from "../../resources/api"

const StockList = ({ socket }) => {
	const navigate = useNavigate()

	const [searchResults, setSearchResults] = useState([])
	const [keyword, setKeyword] = useState("")
	const scrollPosition = useRef(0)

	// query to implememt paginated infinite scroll
	const {
		isFetching,
		fetchNextPage,
		data: paginatedResult,
		hasNextPage,
	} = useInfiniteQuery({
		queryKey: ["stockList"],
		queryFn: ({ pageParam = 1 }) => getPaginatedStockList(pageParam),
		getNextPageParam: (lastPage) => lastPage.next.pageNumber,
		keepPreviousData: true,
		staleTime: Infinity,
	})

	// Intersection observer and configuring the callback ref on the last element
	const observer = useRef()
	const lastStockRef = useCallback(
		(node) => {
			if (isFetching) return
			if (observer.current) observer.current.disconnect()
			observer.current = new IntersectionObserver(
				(entries) => {
					const entry = entries[0]
					if (entry.isIntersecting && hasNextPage) {
						fetchNextPage()
					}
				},
				{ threshold: 1 }
			)
			if (node) observer.current.observe(node)
		},
		[isFetching, hasNextPage, fetchNextPage]
	)

	// Store scroll position
	const handleScroll = () => {
		scrollPosition.current = window.scrollY
	}

	// Maintain scroll position for infinite scrolling
	useEffect(() => {
		window.scrollTo(0, scrollPosition.current)
	}, [paginatedResult])

	// add an event listener for scroll
	useEffect(() => {
		window.addEventListener("scroll", handleScroll)

		return () => {
			window.removeEventListener("scroll", handleScroll)
		}
	}, [])

	// make a server call only after 1.5 seconds of user typing a keyword
	useEffect(() => {
		const timer = setTimeout(() => {
			if (keyword && socket?.id) {
				socket.emit("search_keyword", keyword)
			}
		}, 1500)
		return () => clearTimeout(timer)
	}, [keyword, socket])

	useEffect(() => {
		socket &&
			socket.on("search_result", (resp) => {
				if (resp.error !== "") {
					alert("Error: " + resp.error)
				} else setSearchResults(resp.data)
			})
	}, [socket])

	const onKeywordChange = (e) => {
		setKeyword(e.target.value)
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
								onClick={() => navigate(`/stock/${result["symbol"]}`)}
							>
								<p style={{ fontWeight: "bold" }}>{result.symbol}</p>

								<p>{result.name}</p>
							</div>
						)
					})}
				</div>
			)}
			{paginatedResult?.pages?.length ? (
				<table className="container">
					<tbody>
						{paginatedResult.pages
							?.flatMap((page) => page.results)
							.map((stock) => (
								<tr key={stock["symbol"]}>
									<td>{stock["share_name"]}</td>
									<td>
										<button
											onClick={() => navigate(`/stock/${stock["symbol"]}`)}
										>
											View
										</button>
									</td>
								</tr>
							))}
					</tbody>
				</table>
			) : (
				<div style={{ width: "70%", margin: "3% auto" }}>
					{[...Array(15).keys()].map((idx) => (
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
			<div ref={lastStockRef} style={{ marginTop: "20px" }}>
				{isFetching && (
					<CircularProgress thickness={1} variant="solid" size="md" />
				)}
				<Quote />
			</div>
		</div>
	)
}

export default StockList
