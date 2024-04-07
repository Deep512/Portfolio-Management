import { createContext } from "react"

const StockContext = createContext({
	stockSymbol: null,
	setStockSymbol: (stockSymbol) => {},
})
export default StockContext
