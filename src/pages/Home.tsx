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
    <div className="flex flex-col items-center justify-center md:items-end md:pr-40">
      <div className="flex flex-col items-center justify-center">
        <div className="my-8">
          <p>
            Wallet Provider: {provider} <br />
            Wallet Number ID: {accountId}
          </p>
        </div>
        <div className="flex space-x-4 px-2">
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
