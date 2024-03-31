import mysql from "mysql";
import config from "./config.js";
import fs from "fs";

var dbms = mysql.createConnection(config);

var pool = mysql.createPool(config);

function csvJSON(csvStr) {
	var lines = csvStr.split("\n");
	var result = [];

	// NOTE: If your columns contain commas in their values, you'll need
	// to deal with those before doing the next step
	// (you might convert them to &&& or something, then covert them back later)
	// jsfiddle showing the issue https://jsfiddle.net/
	var headers = lines[0].split(",");

	for (var i = 1; i < lines.length; i++) {
		var obj = {};
		var currentline = lines[i].split(",");

		for (var j = 0; j < headers.length; j++) {
			obj[headers[j]] = currentline[j];
		}

		result.push(obj);
	}
	return result; //JavaScript object
}

dbms.connect(function (err) {
	if (err) throw err;

	dbms.query("USE Portfolio;", function (err, result) {
		if (err) throw err;
		else {
			console.log(">> Successfully connected to Portfolio Database");
		}
		fs.readFile("./file.txt", "utf-8", (err, data) => {
			if (err) throw err;
			const listedEntities = csvJSON(data);

			listedEntities
				.filter((entity) => entity.assetType === "Stock")
				.forEach((stock) => {
					const query = `CALL shareInfo(?)`;
					dbms.query(query, stock.symbol, function (err, result, fields) {
						if (err) {
							throw err;
						}
						if (result[0].length == 0) {
							const query = `CALL insert_share(?,?,?)`;
							const info = `${stock.name}(${stock.symbol}) is a ${stock.assetType} that is listed on ${stock.exchange}. It went public on ${stock.ipoDate}.`;
							dbms.query(
								query,
								[stock.symbol, stock.name, info],
								function (err, result, fields) {
									if (err) {
										throw err;
									}
								}
							);
						}
					});
				});
		});
	});
});
