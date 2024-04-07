// ################################################################### MySQL

import mysql from "mysql"
import config from "./config.js"

var dbms = mysql.createConnection(config)

var pool = mysql.createPool(config)
var noOfStocks = 0
dbms.connect(function (err) {
	if (err) throw err

	dbms.query("USE Portfolio;", function (err, result) {
		if (err) throw err
		else {
			console.log(">> Successfully connected to Portfolio Database")
			dbms.query(
				"SELECT COUNT(*) as noOfStocks FROM Share;",
				function (err, result) {
					if (err) throw err
					else {
						noOfStocks = result[0]["noOfStocks"]
					}
				}
			)
		}
	})
})

// ################################################################# Server
import bcrypt from "bcryptjs"
import express from "express"
import http from "http"
import bodyParser from "body-parser"
import axios from "axios"
import cors from "cors"
import { Server } from "socket.io"
import dotenv from "dotenv"
dotenv.config()

var saltRounds = bcrypt.genSaltSync(10)
var app = express()

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
)
app.use(bodyParser.json())
app.use(cors())

// ################################################################# Socket
var server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
		credentials: true,
	},
})

io.on("connection", (socket) => {
	console.log("user connected", socket.id)

	// Fetch search results
	socket.on("search_keyword", (keyword) => {
		axios({
			method: "get",
			url:
				"https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" +
				keyword +
				"&apikey=" +
				process.env.ALPHAVANTAGE_APIKEY,
			responseType: "json",
		})
			.then((resp) => resp.data)
			.then((data) => {
				if (data["Error Message"] || !data["bestMatches"])
					socket.emit("search_result", {
						error: "Could not fetch search results",
						data: [],
					})
				else {
					const results = data["bestMatches"]
					var resultsVal = results
						.filter((result) => result["3. type"] === "Equity")
						.map((result) => ({
							symbol: result["1. symbol"],
							name: result["2. name"],
						}))
					socket.emit("search_result", { error: "", data: resultsVal })
				}
			})
			.catch((err) => socket.emit("search_result", { error: err, data: [] }))
	})

	socket.on("disconnect", () => {
		console.log("user disconnected", socket.id)
	})
})

// ################################################################# API Endpoints
// List of users
app.get("/", function (req, res) {
	var query = "SELECT * from User"
	dbms.query(query, function (err, result) {
		res.json(result)
	})
})

// Login
app.post("/login", function (req, res) {
	var query = `CALL checkUser(?)`
	dbms.query(query, req.body.username, function (err, result, fields) {
		// Get login details of user
		if (err) throw err
		if (result[0].length == 0) {
			res.status(400).json("Invalid username")
		} else {
			var query = "CALL loginDetails(?)"
			dbms.query(query, req.body.username, function (err, result, fields) {
				if (err) throw err
				bcrypt.compare(
					req.body.password,
					result[0][0]["user_password"],
					function (err, resu) {
						if (resu == false) {
							res.status(400).json("Wrong Password")
						} else {
							res.json(result[0][0])
						}
					}
				)
			})
		}
	})
})

// Register
app.post("/register", function (req, res) {
	// Check if User exists in database
	var query = `CALL checkUser(?)`
	dbms.query(query, req.body.username, function (err, result, fields) {
		if (err) throw err
		if (req.body.username === "") {
			res.status(400).json("empty username")
		} else if (result[0].length === 1) {
			res.status(400).json("username exists")
		} else if (req.body.firstname === "") {
			res.status(400).json("empty firstname")
		} else if (req.body.password === "") {
			res.status(400).json("empty password")
		} else if (req.body.password !== req.body.confirm_password) {
			res.status(400).json("unmatching password")
		} else {
			pool.getConnection(function (err, connection) {
				if (err) {
					connection.release()
					throw err
				}
				connection.query("USE Portfolio;", function (err, result) {
					if (err) {
						connection.release()
						throw err
					}
				})
				connection.beginTransaction(function (err) {
					if (err) {
						connection.release()
						throw err
					}
					bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
						var insertQuery = `CALL insertUser(?,?,?,?)`
						connection.query(
							insertQuery,
							[req.body.username, hash, req.body.firstname, req.body.lastname],
							function (err, result, fields) {
								if (err) {
									connection.rollback(function () {
										connection.release()
										throw err
									})
								}
								var IDquery = "CALL getId(?)"
								connection.query(
									IDquery,
									req.body.username,
									function (err, result, fields) {
										if (err) {
											connection.rollback(function () {
												connection.release()
												throw err
											})
										}
										connection.commit(function (err) {
											if (err) {
												connection.rollback(function () {
													connection.release()
													throw err
												})
											}
											res.json(result[0][0])
											connection.release()
										})
									}
								)
							}
						)
					})
				})
			})
		}
	})
})

// Profile
app.post("/profile", function (req, res) {
	// Details of all the shares bought
	var bought = "CALL bought(?)"

	dbms.query(bought, req.body.id, function (err, bght, fields) {
		if (err) throw err
		var bought
		var invested
		if (bght[0].length == 0) {
			bought = 0
			invested = 0.0
		} else {
			bought = bght[0][0]["bought"]
			invested = bght[0][0]["invested"]
		}
		// Details of all the shares sold
		var sold = "CALL sold(?)"
		dbms.query(sold, req.body.id, function (err, sld, fields) {
			if (err) throw err
			var sold
			var returns
			if (sld[0].length == 0) {
				sold = 0
				returns = 0.0
			} else {
				sold = sld[0][0]["sold"]
				returns = sld[0][0]["returns"]
			}

			var current = Number(bought - sold)
			// Get user info FROM user_id
			var userInfoQuery = "CALL userInfo(?)"

			dbms.query(userInfoQuery, req.body.id, function (err, userInfo, fields) {
				const val = {
					current: current,
					invested: Number(invested),
					returns: Number(returns),
					username: userInfo[0][0]["user_name"],
					firstname: userInfo[0][0]["first_name"],
					lastname: userInfo[0][0]["last_name"],
				}
				res.json(val)
			})
		})
	})
})

// Watch List
app.post("/watch-list", function (req, res) {
	// Stocks in WatchList of a user
	var query = "CALL watchList(?)"
	dbms.query(query, req.body.id, function (err, result, fields) {
		if (err) throw err
		res.status(200).json(result[0])
	})
})

// Get paginated stock List
app.get("/paginated-stock-list", function (req, res) {
	// List of all the Stocks
	const pageNumber = parseInt(req.query.pageNumber)
	const pageSize = parseInt(req.query.pageSize)

	const offset = (pageNumber - 1) * pageSize
	const limit = pageSize
	var query = "CALL get_paginated_stock_list(?,?)"
	dbms.query(query, [offset, limit], function (err, result, fields) {
		if (err) throw err
		const results = {}

		if (offset !== 0)
			results.prev = {
				pageNumber: pageNumber - 1,
				pageSize: pageSize,
			}
		if (offset + limit < noOfStocks)
			results.next = {
				pageNumber: pageNumber + 1,
				pageSize: pageSize,
			}

		results.results = result[0]
		res.status(200).json(results)
	})
})

// Stock page
app.post("/shareInfo", function (req, res) {
	axios({
		method: "get",
		url:
			"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" +
			req.body.symbol +
			"&interval=1min&apikey=" +
			process.env.ALPHAVANTAGE_APIKEY,
		responseType: "json",
	})
		.then((res) => res.data)
		.then((data) => {
			if (
				data["Error Message"] ||
				data["Information"]?.indexOf("25 requests per day") >= 0
			) {
				res.status(501).json(data["Error Message"] || data["Information"])
				throw new Error("Unable to fetch data")
			} else {
				var first = 1
				var price
				for (var key in data["Time Series (1min)"]) {
					if (first == 1) {
						price = data["Time Series (1min)"][key]["4. close"]
						first = 0
					}
					// Insert into ShareHistory
					var historyQuery = "CALL shareHistory(?,?,?)"
					dbms.query(
						historyQuery,
						[key, req.body.symbol, data["Time Series (1min)"][key]["4. close"]],
						function (err, result, fields) {}
					)
				}

				var xdata = [],
					y = []
				for (const x in data["Time Series (1min)"]) {
					xdata.push(x)
					y.push(Number(data["Time Series (1min)"][x]["4. close"]))
				}

				// Get Share Info for symbol
				var query = "CALL shareInfo(?)"
				dbms.query(query, req.body.symbol, function (err, resultname, fields) {
					if (err) throw err
					const result = {
						name: resultname[0][0]["share_name"],
						info: resultname[0][0]["share_info"],
						price: price,
						xdata: xdata,
						y: y,
					}
					res.json(result)
				})
			}
		})
		.catch((err) => console.error(err))
})

app.post("/userShareInfo", (req, res) => {
	// Check if share exists in WatchList
	if (req.body.id && req.body.id !== "null" && req.body.id !== "undefined") {
		var existsQuery = "CALL inWatchList(?,?)"
		dbms.query(
			existsQuery,
			[req.body.id, req.body.symbol],
			function (err, result, fields) {
				if (err) throw err

				// Details of Shares bought of specific company
				var bought = "CALL boughtShare(?,?)"

				dbms.query(
					bought,
					[req.body.id, req.body.symbol],
					function (err, bght, fields) {
						if (err) throw err
						var bought
						var invested
						if (bght[0].length == 0) {
							bought = 0
							invested = 0.0
						} else {
							bought = bght[0][0]["bought"]
							invested = bght[0][0]["invested"]
						}
						// Details of Shares sold of specific company
						var sold = "CALL soldShare(?,?)"
						dbms.query(
							sold,
							[req.body.id, req.body.symbol],
							function (err, sld, fields) {
								if (err) throw err
								var sold
								var returns
								if (sld[0].length == 0) {
									sold = 0
									returns = 0.0
								} else {
									sold = sld[0][0]["sold"]
									returns = sld[0][0]["returns"]
								}
								var current = Number(bought - sold)
								var val = {
									inWatchList: result[0].length > 0,
									current: current,
									invested: Number(invested),
									returns: Number(returns),
								}
								res.json(val)
							}
						)
					}
				)
			}
		)
	} else res.status(401).json("Unauthorized user")
})

// Buy share
app.post("/transact", function (req, res) {
	var now = new Date()
	var timestamp =
		now.toISOString().substr(0, 10) + " " + now.toISOString().substr(11, 8)

	// Insert into BuyShare
	var buyQuery = req.body.isBuyTransaction
		? "CALL buyQuery(?,?,?,?,?)"
		: "CALL sellQuery(?,?,?,?,?)"

	dbms.query(
		buyQuery,
		[
			timestamp,
			req.body.id,
			req.body.quantity,
			req.body.price,
			req.body.symbol,
		],
		function (err, result, fields) {
			if (err) throw err

			// Insert into User History
			var historyQuery = "call userHistory(?,?,?,?,?,?)"

			dbms.query(
				historyQuery,
				[
					timestamp,
					req.body.id,
					req.body.quantity,
					req.body.price,
					req.body.isBuyTransaction ? 0 : 1,
					req.body.symbol,
				],
				function (err, result, fields) {
					if (err) throw err
					res.json(result)
				}
			)
		}
	)
})

// Add to watch list
app.post("/add", function (req, res) {
	// Insert into Watch list
	pool.getConnection(function (err, connection) {
		if (err) {
			connection.release()
			throw err
		}
		var query = "CALL insertList(?,?)"
		connection.query(
			query,
			[req.body.id, req.body.symbol],
			function (err, result, fields) {
				if (err) throw err
				// Stocks in WatchList of a user
				var query = "CALL watchList(?)"
				connection.query(query, req.body.id, function (err, result, fields) {
					if (err) {
						connection.rollback(function () {
							connection.release()
							throw err
						})
					}
					connection.commit(function (err) {
						if (err) {
							connection.rollback(function () {
								connection.release()
								throw err
							})
						}
						res.json(result[0])
						connection.release()
					})
				})
			}
		)
	})
})

// Remove from watch list
app.post("/remove", function (req, res) {
	pool.getConnection(function (err, connection) {
		if (err) {
			connection.release()
			throw err
		}
		connection.query("USE Portfolio;", function (err, result) {
			if (err) {
				connection.release()
				throw err
			}
		})
		connection.beginTransaction(function (err) {
			if (err) {
				connection.release()
				throw err
			}
			// Delete from Watch list
			var query = "CALL deleteList(?,?)"
			connection.query(
				query,
				[req.body.id, req.body.symbol],
				function (err, result, fields) {
					if (err) {
						connection.rollback(function () {
							connection.release()
							throw err
						})
					}
					// Stocks in WatchList of a user
					var query = "CALL watchList(?)"
					connection.query(query, req.body.id, function (err, result, fields) {
						if (err) {
							connection.rollback(function () {
								connection.release()
								throw err
							})
						}
						connection.commit(function (err) {
							if (err) {
								connection.rollback(function () {
									connection.release()
									throw err
								})
							}
							res.json(result[0])
							connection.release()
						})
					})
				}
			)
		})
	})
})

// Update Profile
app.post("/update-profile", function (req, res) {
	// Get user info FROM user_id
	var userInfoQuery = `CALL userInfo(?)`
	dbms.query(userInfoQuery, req.body.id, function (err, result, fields) {
		if (err) throw err
		const value = {
			username: result[0][0]["user_name"],
			firstname: result[0][0]["first_name"],
			lastname: result[0][0]["last_name"],
		}
		res.json(value)
	})
})

// Update Profile
app.post("/save", function (req, res) {
	// Check if user exists with same username
	var query = "CALL updateCheck(?,?)"
	dbms.query(
		query,
		[req.body.username, req.body.id],
		function (err, result, fields) {
			if (err) throw err
			// Get password of User
			var currentPasswordQuery = "CALL getPassword(?)"
			dbms.query(
				currentPasswordQuery,
				req.body.id,
				function (err, pass, fields) {
					if (err) throw err
					bcrypt.compare(
						req.body.old_password,
						pass[0][0]["user_password"],
						function (err, resu) {
							if (err) throw err
							if (req.body.username == "") {
								res.status(400).json("empty username")
							} else if (result[0].length == 1) {
								res.status(400).json("username exists")
							} else if (req.body.firstname == "") {
								res.status(400).json("empty firstname")
							} else if (resu == false) {
								res.status(400).json("incorrect old password")
							} else if (req.body.new_password === "") {
								res.status(400).json("empty new password")
							} else if (req.body.new_password !== req.body.confirm_password) {
								res.status(400).json("unmatching password")
							} else {
								bcrypt.hash(
									req.body.new_password,
									saltRounds,
									function (err, hash) {
										// Update details of a user
										var updateQuery = "CALL updateUser(?,?,?,?,?)"
										dbms.query(
											updateQuery,
											[
												req.body.username,
												hash,
												req.body.firstname,
												req.body.lastname,
												req.body.id,
											],
											function (err, result, fields) {
												if (err) throw err
												res.json(result)
											}
										)
									}
								)
							}
						}
					)
				}
			)
		}
	)
})

server.listen(process.env.PORT)
console.log(`Server live on http://127.0.0.1:/${process.env.PORT}`)
