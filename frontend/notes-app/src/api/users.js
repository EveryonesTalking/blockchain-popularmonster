import api from "./client";

// CREATE user (Register)
export const registerUser = (payload) => api.post("/users/register", payload);

// LOGIN user
export const loginUser = (payload) => api.post("/users/login", payload);

// LIST users (for demo)
export const listUsers = () => api.get("/users");

// GET user by ID
export const getUserById = (id) => api.get(`/users/${id}`);

// UPDATE user profile
export const updateUserProfile = (id, payload) => api.put(`/users/${id}`, payload);

// DELETE user
export const deleteUser = (id) => api.delete(`/users/${id}`);