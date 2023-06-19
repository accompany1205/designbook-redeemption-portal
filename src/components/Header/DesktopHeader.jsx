import React, { useContext } from "react";
import { Link } from "react-router-dom";
import ConnectWalletButton from "./ConnectWalletButton";

function DesktopHeader({ urlState }) {
  return (
    <div className="text-sm absolute w-full p-6 md:px-10 xl:px-20 2xl:px-32 bg-transparent flex justify-between items-center">
      <div>
        <img src="/images/logo-white.png" alt="logo" width={240} />
      </div>

      <div className="flex space-x-6 lg:space-x-8 items-center">
        <HeaderItem urlState={urlState} title="Home" to="/" />
        <ConnectWalletButton />
      </div>
    </div>
  );
}

function HeaderItem({ title, to, onClick, urlState }) {
  return (
    <Link to={to} state={urlState} onClick={onClick}>
      <div className="relative text-base text-white font-bold after:absolute after:bg-purple after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-700">
        {title}
      </div>
    </Link>
  );
}

export default DesktopHeader;
