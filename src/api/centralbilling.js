import axios from "axios";

const api = axios.create({
//   baseURL: "http://localhost:8800/api",
  baseURL: "https://backend.viddy.cloud/api",
  withCredentials: false, // we use Bearer tokens, no cookies needed
});

export default api;