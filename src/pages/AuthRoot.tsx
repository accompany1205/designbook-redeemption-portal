import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
// import AuthContext from "../auth/WalletContext";

function AuthRoot() {
  // const isAuthenticated = useContext(AuthContext).isAuthenticated;

  // if (isAuthenticated) {
  //   return <Navigate to="/" replace />;
  // }
  
  return <Outlet />;
}

export default AuthRoot;
