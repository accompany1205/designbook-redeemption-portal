import axios from "axios";

const client = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// handle network errors
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(error);
    if (error.code === "ERR_NETWORK") {
      return Promise.reject({
        handled: true,
        title: "Network error",
        message: "We could not connect to the server",
      });
    }

    return Promise.reject({
      handled: false,
      title: "Error",
      message: error.response?.data?.message || "Something went wrong",
    });
  }
);

export default client;
