const PAGE_SIZE = 50

// query fn
export const fetchProfileData = ({ queryKey }) => {
	return fetch("http://localhost:8000/profile", {
		method: "post",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			id: queryKey[1].userId,
		}),
	}).then((response) => response.json())
}

// query fn
export const getWatchList = async ({ queryKey }) => {
	return fetch("http://localhost:8000/watch-list", {
		method: "post",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			id: queryKey[1].userId,
		}),
	}).then((response) => response.json())
}

// mutation fn
export const addToWatchList = async ({ userId, symbol }) => {
	return fetch("http://localhost:8000/add", {
		method: "post",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			id: userId,
			symbol: symbol,
		}),
	}).then((response) => response.json())
}

// mutation fn
export const delFromWatchList = async ({ userId, symbol }) => {
	return fetch("http://localhost:8000/remove", {
		method: "post",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			id: userId,
			symbol: symbol,
		}),
	}).then((response) => response.json())
}

// query fn
export const getShareData = async ({ queryKey }) => {
	const response = await fetch("http://localhost:8000/shareInfo", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			symbol: queryKey[1].symbol,
		}),
	})
	if (response.status >= 400) {
		throw new Error("Unable to fetch data")
	}
	return await response.json()
}

// query fn
export const getUserShareData = async ({ queryKey }) => {
	return fetch("http://localhost:8000/userShareInfo", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			id: queryKey[1].userId,
			symbol: queryKey[1].symbol,
		}),
	}).then((response) => response.json())
}

// mutation fn
export const performTransaction = async ({
	userId,
	symbol,
	quantity,
	price,
	isBuyTransaction,
}) => {
	return fetch("http://localhost:8000/transact", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			id: userId,
			symbol: symbol,
			quantity: quantity,
			price: price,
			isBuyTransaction: isBuyTransaction,
		}),
	}).then((response) => response.json())
}

// Infinite query fn
export const getPaginatedStockList = async (pageNumber) => {
	return fetch(
		`http://localhost:8000/paginated-stock-list?pageNumber=${encodeURIComponent(
			pageNumber
		)}&pageSize=${encodeURIComponent(PAGE_SIZE)}`
	).then((response) => response.json())
}
