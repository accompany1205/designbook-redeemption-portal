import React, { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import GlowButton from "../components/buttons/GlowButton";
// import { useHashConnect } from "../lib/HashConnectProvider";
import { MdOutlineContentCopy } from "react-icons/md";
import { useLocation, useSearchParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import WalletContext, {
  WalletServiceProviders,
} from "../lib/WalletService/WalletContext";
import ConnectWalletButton from "../components/Header/ConnectWalletButton";

function Home() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("claim");

  const { accountId, provider, claimNft, returnNft } =
    useContext(WalletContext);

  const conCatAccounts = (lastAccs: string, Acc: string) => {
    return lastAccs + " " + Acc;
  };

  const state = useLocation().state;

  return (
    <div className="flex flex-col items-center justify-center md:items-end md:pr-60">
      <div className="flex flex-col items-center justify-center">
        <div className="md:mt-28">
          <ConnectWalletButton />
        </div>
        <div className="my-8 md:mt-12 md:mb-24">
          <p className="text-lg md:mb-4 font-bold text-gray-400">
            <span className="text-gray-400">Wallet Provider:</span> {provider}

          </p>
          <p className="text-lg font-bold ">
            <span className="text-gray-400">Wallet Number ID:</span> {accountId}
          </p>
        </div>
        <div className="flex space-x-20 px-2">
          <GlowButton onClick={() => claimNft(token)}>
            Redeem Your Certificate
          </GlowButton>
          <GlowButton onClick={() => returnNft(token)}>
            Return Your Certificate
          </GlowButton>
        </div>

        {/* <button onClick={disconnectWallet} >Kill session</button>
      <button onClick={() => connectWallet(WalletServiceProviders.HASHPACK)} >Connect</button> */}
      </div>
    </div>
  );
}

export default Home;
