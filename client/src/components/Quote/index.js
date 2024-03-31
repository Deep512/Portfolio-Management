import React, { useMemo } from "react"
import { quotes } from "../../assets/quotes.json"
const Quote = () => {
	const quote = useMemo(
		() => quotes[Math.floor(Math.random() * quotes.length)],
		[]
	)
	return (
		<div style={{ color: "white" }}>
			{quote ? (
				<>
					<div
						style={{
							border: "0.5px solid",
							width: "50%",
							margin: "0 auto",
							marginTop: "20px",
						}}
					></div>
					<h4>{quote["quote"]}</h4>
					<h5> ~ {quote["author"]}</h5>
				</>
			) : null}
		</div>
	)
}

export default Quote
