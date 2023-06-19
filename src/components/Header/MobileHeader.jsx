import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import ConnectWalletButton from "./ConnectWalletButton";

function MobileHeader({ urlState }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div
      className={`p-2 pt-3 pl-3 overflow-y-clip ${
        menuOpen ? "h-36" : "h-12"
      }  transition-all duration-700`}>
      <div className="flex items-center   justify-between">
        <div>
          <img src="/images/logo-black.png" alt="logo" width={150} />
        </div>
        <HamburgerMenu toggleMenu={toggleMenu} />
      </div>

      <div className="flex flex-col px-3 mt-4 divide-y-[0.04rem] divide-gray-400">
        <HeaderItem urlState={urlState} title="Home" to="/" />
      </div>
      <div className="text-sm w-fit px-3 mt-2">
        <ConnectWalletButton />
      </div>
    </div>
  );
}

function HeaderItem({ title, to, onClick = () => null, urlState }) {
  return (
    <div onClick={onClick}>
      <Link to={to} state={urlState}>
        <div className="text-gray-400 py-3 px-1 font-bold text-sm">{title}</div>
      </Link>
    </div>
  );
}

function HamburgerMenu({ toggleMenu }) {
  return (
    <div
      className="flex flex-col space-y-1 justify-center items-center"
      onClick={toggleMenu}>
      <div className="w-6 h-1 bg-gray-400 rounded-full"></div>
      <div className="w-6 h-1 bg-gray-400 rounded-full"></div>
      <div className="w-6 h-1 bg-gray-400 rounded-full"></div>
    </div>
  );
}

export default MobileHeader;
