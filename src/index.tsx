import React from "react";
import ReactDOM from "react-dom";
// import { HashConnectAPIProvider } from "./lib/HashConnectProvider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Root from "./pages/Root";
import Connect from "./pages/Connect";
import TermsView from "./pages/Terms";
import { ToastContainer } from "react-toastify";
import AuthProvider from "./contexts/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import AuthRoot from "./pages/AuthRoot";
// import { WalletConnectionProvider } from "./auth/WalletConnectionProvider";
import WalletProvider from "./lib/WalletService/WalletProvider";
import Notification from "./components/Notification";

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
      {
        path: "/terms-policy",
        element: <TermsView />,
      },
    ],
  },
]);

ReactDOM.render(
  <React.StrictMode>
    {/* <HashConnectAPIProvider debug> */}
    <AuthProvider>
      <WalletProvider>
        <Notification>
          <RouterProvider router={router} />
        </Notification>
      </WalletProvider>
    </AuthProvider>
    {/* </HashConnectAPIProvider> */}
  </React.StrictMode>,
  document.getElementById("root")
);
