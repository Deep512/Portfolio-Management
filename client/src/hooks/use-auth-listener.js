import { useEffect, useState } from "react"
const useAuthListener = () => {
	const [userId, setUserId] = useState()
	useEffect(() => {
		const authUserId = JSON.parse(window.localStorage.getItem("authUserId"))
		setUserId(authUserId ? authUserId : null)
	}, [])

	useEffect(() => {
		window.localStorage.setItem(
			"authUserId",
			JSON.stringify(userId === undefined ? null : userId)
		)
	}, [userId])

	return { userId, setUserId }
}

export default useAuthListener
