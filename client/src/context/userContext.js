import { createContext } from "react";

const UserContext = createContext({
	userId: null,
	setUserId: (userId) => {},
});
export default UserContext;
