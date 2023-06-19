import React from "react";

type Props = {};

const Footer = (props: Props) => {
  return (
    <div className="absolute bottom-0 bg-black w-screen py-3 text-xs sm:text-sm md:text-base text-center text-white">
      <div className="left-3 absolute">
        <a href="https://designbook.app/" className="cursor-pointer">
          <img
            src="/images/designbook-logo-white.png"
            alt="Designbook Logo"
            className="inline-block h-4 w-auto relative -top-0.5 right-0.5"
          />{" "}
          <img
            src="/images/logo-white.png"
            alt="Designbook Text"
            className="inline-block h-3 w-auto relative -top-0.5"
          />
        </a>
      </div>
      To resell your Items, discover{" "}
      <a href="https://designbook.app/" className=" cursor-pointer">
        Designbook
      </a>
      , the only marketplace for certified goods!
    </div>
  );
};

export default Footer;
