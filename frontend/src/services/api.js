//Purpose: Centralized Axios Instance with Credentials
import axios from "axios";
const api = axios.create({
    baseURL: "/api", // Vite proxies this to http://localhost:5000/api
    withCredentials: true, // Sends and receives httpOnly cookies (JWT)
    headers: {
        "Content-Type": "application/json",//Axios config for sending JSON data
    },
});
export default api;