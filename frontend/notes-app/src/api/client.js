import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// DO NOT set Content-Type globally.
// Axios will automatically set:
// - application/json for JSON
// - multipart/form-data for FormData uploads

export default api;
