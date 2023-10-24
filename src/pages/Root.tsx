import React from "react";
import { Outlet, useLocation } from "react-router-dom";

function Root() {

  return (
    <>    
      <Outlet />
    </>
  );
}

export default Root;
