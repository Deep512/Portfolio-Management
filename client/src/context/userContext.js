import { createContext } from "react"

const UserContext = createContext({
	userId: null,
	setUserId: (userId) => {},
	isAuthenticated: false,
})
export default UserContext
