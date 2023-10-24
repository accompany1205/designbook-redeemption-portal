import React, { useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
// import AuthContext from "../auth/WalletContext";
import { AuthContext } from "../contexts/AuthContext";
import WalletContext from "../lib/WalletService/WalletContext";

function AuthRoot() {
  const isAuthenticated = useContext(AuthContext).isLoggedIn;
  const {provider} = useContext(WalletContext);

  // if (isAuthenticated || provider) {
  //   return <Navigate to="/wallet" replace />;
  // }

  return <Outlet />;
}

export default AuthRoot;
