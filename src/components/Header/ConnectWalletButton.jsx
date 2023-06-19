import React, { useContext } from "react";
import { toast } from "react-toastify";
import WalletContext from "../../lib/WalletService/WalletContext";
import GlowButton from "../buttons/GlowButton";

function ConnectWalletButton() {
  // const { pairingData, toggleConnectWalletModal, disconnect } = useContext(WalletContext)

  const { provider, disconnectWallet, toggleConnectWalletModal } = useContext(WalletContext);
  
  console.log("This is the provider: ", provider)
  
  const handleClick = () => {
    if (!provider) toggleConnectWalletModal(true);
    else disconnectWallet(provider);
  };

  return (
    <GlowButton onClick={handleClick}>
      {provider ? "Disconnect Wallet" : "Connect Wallet"}
    </GlowButton>
  );
}

export default ConnectWalletButton;
