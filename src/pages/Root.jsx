import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

const content = {
  "/": {
    title: "Digital Certificate Portal",
    description: "Instantly Redeem or Return your NFT",
  },
  "/auth/register": {
    title: "Register",
    description: "Register page description",
  },
  "/auth/login": {
    title: "Login",
    description: "Login page description",
  },
};

function Root() {
  // get the path
  const path = useLocation().pathname;

  return (
    <>
      <Header />
      {content[path] && (
        <section
          style={{
            background:
              "url('/images/background/subheader2.jpg') center top / cover",
          }}>
          <div className="text-white text-center py-20 md:py-32 lg:pt-40 lg:pb-36 2xl:pt-40 2xl:pb-36">
            <h1 className="text-4xl md:text-6xl font-bold">{content[path].title}</h1>
            <p className="mt-2">{content[path].description}</p>
          </div>
        </section>
      )}
      <Outlet />
      <Footer />
    </>
  );
}

export default Root;
