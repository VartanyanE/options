const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://cash-flow-strategist.onrender.com"
    : "http://localhost:5050";

export default API_BASE_URL;