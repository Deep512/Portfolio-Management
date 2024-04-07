import mysql from "mysql"
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()

const config = {
	connectionLimit: 20,
	port: process.env.DB_PORT,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
}

var dbms = mysql.createConnection(config)

var pool = mysql.createPool(config)

function csvJSON(csvStr) {
	var lines = csvStr.split("\n")
	var result = []

	// NOTE: If your columns contain commas in their values, you'll need
	// to deal with those before doing the next step
	// (you might convert them to &&& or something, then covert them back later)
	// jsfiddle showing the issue https://jsfiddle.net/
	var headers = lines[0].split(",")

	for (var i = 1; i < lines.length; i++) {
		var obj = {}
		var currentline = lines[i].split(",")

		for (var j = 0; j < headers.length; j++) {
			obj[headers[j]] = currentline[j]
		}

		result.push(obj)
	}
	return result //JavaScript object
}

dbms.connect((err) => {
	if (err) throw err

	dbms.query("USE Portfolio;", (err, result) => {
		if (err) throw err
		else {
			console.log(">> Successfully connected to Portfolio Database")
		}
		pool.getConnection((err, connection) => {
			if (err) {
				connection.release()
				throw err
			}
			connection.query("USE Portfolio;", (err, result) => {
				if (err) {
					connection.release()
					throw err
				}
			})
			fs.readFile("./file.txt", "utf-8", (err, data) => {
				if (err) {
					connection.release()
					throw err
				}
				const listedEntities = csvJSON(data)
				connection.beginTransaction((err) => {
					if (err) {
						connection.release()
						throw err
					}
					listedEntities
						.filter((entity) => entity.assetType === "Stock")
						.forEach((stock) => {
							const query = `CALL shareInfo(?)`
							connection.query(query, stock.symbol, (err, result, fields) => {
								if (err) {
									connection.rollback(() => {
										connection.release()
										throw err
									})
								}
								if (result[0].length === 0) {
									const query = `CALL insert_share(?,?,?)`
									const info = `${stock.name}(${stock.symbol}) is a ${stock.assetType} that is listed on ${stock.exchange}. It went public on ${stock.ipoDate}.`
									connection.query(
										query,
										[stock.symbol, stock.name, info],
										(err, result, fields) => {
											if (err) {
												connection.rollback(() => {
													connection.release()
													throw err
												})
											}
											connection.commit((err) => {
												if (err) {
													connection.rollback(() => {
														connection.release()
														throw err
													})
												}
												connection.release()
											})
										}
									)
								}
							})
						})
				})
			})
		})
	})
})
