// frontend/src/lib/api.ts

import axios from "axios";

// Use the backend URL set via Vercel's environment variable
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// (Optional) Interceptor for auth tokens or error logging
// api.interceptors.request.use((config) => {
//   // Attach token if needed
//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle errors globally, if desired
//     return Promise.reject(error);
//   }
// );

export default api;
