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

  // useEffect(() => {
  //   if (state) {
  //     setSearchParams({ ...state });
  //   }
  // }, [state]);

  // const handleCopy = () => {
  //   navigator.clipboard.writeText(pairingString!);
  // };

  const checkNFTClickPermissions = (nftCallback: () => Promise<void>) => {
    // // if (!isAuthenicated)
    // //   return toast.error("Please login proceed with the action.");
    // if (!availableExtension)
    //   return toast.error(
    //     "Please install Hash Connect extension from chrome web store to proceed with the action."
    //   );
    // if (!pairingData)
    //   return toast.error(
    //     "Please connect to Hash Connect extension to proceed with the action."
    //   );
    // nftCallback();
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="my-8">
        <p>
          Provider: {provider} <br />
          AccountId: {accountId}
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
  );
}

export default Home;
