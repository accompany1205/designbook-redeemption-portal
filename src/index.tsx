import React from "react";
import ReactDOM from "react-dom";
// import { HashConnectAPIProvider } from "./lib/HashConnectProvider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Root from "./pages/Root";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthRoot from "./pages/AuthRoot";
// import { WalletConnectionProvider } from "./auth/WalletConnectionProvider";
import WalletProvider from "./lib/WalletService/WalletProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      // {
      //   path: "/auth",
      //   element: <AuthRoot />,
      //   children: [
      //     {
      //       path: "register",
      //       element: <Register />,
      //     },
      //     {
      //       path: "login",
      //       element: <Login />,
      //     },
      //   ],
      // },
    ],
  },
]);

ReactDOM.render(
  <React.StrictMode>
    {/* <HashConnectAPIProvider debug> */}
      <WalletProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </WalletProvider>
    {/* </HashConnectAPIProvider> */}
  </React.StrictMode>,
  document.getElementById("root")
);
