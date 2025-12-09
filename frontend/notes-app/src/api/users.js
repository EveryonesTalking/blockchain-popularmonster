import api from "./client";

// CREATE user (Register)
export const registerUser = (payload) => api.post("/users", payload);

// LIST users (for demo login lookup)
export const listUsers = () => api.get("/users");


// pang push