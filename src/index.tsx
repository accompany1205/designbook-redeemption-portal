import React from "react";
import ReactDOM from "react-dom";
// import { HashConnectAPIProvider } from "./lib/HashConnectProvider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Root from "./pages/Root";
import Connect from "./pages/Connect";
import { ToastContainer } from "react-toastify";
import AuthProvider from "./contexts/AuthContext";
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
        element: <Connect />,
      },
      {
        path: "/wallet",
        element: <AuthRoot />,
        children: [
          {
            index: true,
            element: <Wallet />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.render(
  <React.StrictMode>
    {/* <HashConnectAPIProvider debug> */}
    <AuthProvider>
      <WalletProvider>
        <RouterProvider router={router} />
        <ToastContainer autoClose={5000} />
      </WalletProvider>
    </AuthProvider>
    {/* </HashConnectAPIProvider> */}
  </React.StrictMode>,
  document.getElementById("root")
);
