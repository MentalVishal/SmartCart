import axios from "axios";

const api = axios.create({
  baseURL: "https://smartcart-mx4t.onrender.com/api",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("smartcart_user"));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
