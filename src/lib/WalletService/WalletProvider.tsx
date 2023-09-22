import { HashConnectConnectionState } from "hashconnect/dist/types";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import WalletConnectorContainer from "../../components/WalletConnector/WalletConnectorContainer";
import useBladeStore from "./BladeStore/useBladeStore";
import useHashStore from "./HashStore/useHashStore";
import WalletContext, { WalletServiceProviders } from "./WalletContext";
import queryString from "query-string";
import { useSearchParams } from "react-router-dom";

type Props = {};

const WalletProvider = (props: { children: React.ReactNode }) => {
  const bladeStore = useBladeStore();
  const hashStore = useHashStore({ network: process.env.REACT_APP_HEDERA_NETWORK || "", debug: false });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentlyConnected = useMemo(() => {
    if (
      bladeStore.hasSession &&
      hashStore.status === HashConnectConnectionState.Disconnected
    ) {
      return {
        provider: WalletServiceProviders.BLADE,
        accountId: bladeStore.accountId?.toString(),
      };
    } else if (
      hashStore.status === HashConnectConnectionState.Connected &&
      !bladeStore.hasSession
    ) {
      return {
        provider: WalletServiceProviders.HASHPACK,
        accountId: hashStore.accountId,
      };
    } else if (
      hashStore.status === HashConnectConnectionState.Connected &&
      bladeStore.hasSession
    ) {
      toast.error("You were connected to both wallets. Please reload the page");
      hashStore.disconnectFromExtension();
      bladeStore.disconnectFromExtension();
      return undefined;
    } else {
      return undefined;
    }
    // return undefined;
  }, [bladeStore, hashStore]);

  useEffect(() => {
    if (currentlyConnected?.provider === WalletServiceProviders.BLADE) {
      toast.success("Successfully connected to blade wallet!");
    } else if (
      currentlyConnected?.provider === WalletServiceProviders.HASHPACK
    ) {
      toast.success("Successfully connected to hash pack wallet!", { position: toast.POSITION.TOP_RIGHT });
    }
  }, [currentlyConnected?.provider]);

  const connectToExtension = async (
    type: WalletServiceProviders = WalletServiceProviders.BLADE
  ) => {
    if (currentlyConnected?.provider) {
      toast.error("You are already connected", { position: toast.POSITION.TOP_RIGHT });
      return;
    }

    if (type === WalletServiceProviders.BLADE) {
      await bladeStore.connectToExtension();
      setIsModalOpen(false);
      return;
    } else if (type === WalletServiceProviders.HASHPACK) {
      await hashStore.connectToExtension();
      setIsModalOpen(false);
      return;
    }
  };

  const disconnectWallet = async (
    type: WalletServiceProviders = WalletServiceProviders.BLADE
  ) => {
    if (!currentlyConnected?.provider) {
      toast.error("You are not connected to any extension.", { position: toast.POSITION.TOP_RIGHT });
      return;
    }
    if (type === WalletServiceProviders.BLADE) {
      await bladeStore.disconnectFromExtension();
    } else if (type === WalletServiceProviders.HASHPACK) {
      hashStore.disconnectFromExtension();
    }
  };

  const claimNft = async (token: string | null) => {
    if (!token) {
      toast.error("No claim token in url.", { position: toast.POSITION.TOP_RIGHT });
      return;
    }

    if (currentlyConnected?.provider === WalletServiceProviders.BLADE) {
      if (await bladeStore.claimNft(token))
        toast.success("Successfully claimed the nft through blade store", { position: toast.POSITION.TOP_RIGHT });
    } else if (
      currentlyConnected?.provider === WalletServiceProviders.HASHPACK
    ) {
      if (await hashStore.claimNft(token))
        toast.success("Successfully claimed the nft through hash store", { position: toast.POSITION.TOP_RIGHT });
    } else {
      toast.error("You need to connect to a wallet before claiming.", { position: toast.POSITION.TOP_RIGHT });
      setIsModalOpen(true);
    }
  };

  const returnNft = async (token: string | null) => {
    if (!token) {
      toast.error("No claim token in url.", { position: toast.POSITION.TOP_RIGHT });
      return;
    }

    if (currentlyConnected?.provider === WalletServiceProviders.BLADE) {
      if (await bladeStore.returnNft(token))
        toast.success("Successfully returned the nft through hash pack", { position: toast.POSITION.TOP_RIGHT });
    } else if (
      currentlyConnected?.provider === WalletServiceProviders.HASHPACK
    ) {
      await hashStore.returnNft(token)
      // toast.success("Successfully returned the nft through hash");
    } else {
      toast.error("You need to connect to a wallet before returning.", { position: toast.POSITION.TOP_RIGHT });
      setIsModalOpen(true);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        connectWallet: connectToExtension,
        claimNft: claimNft,
        returnNft: returnNft,
        disconnectWallet,
        network: process.env.REACT_APP_HEDERA_NETWORK || "",
        accountId: currentlyConnected?.accountId,
        provider: currentlyConnected?.provider,
        toggleConnectWalletModal: () => setIsModalOpen(!isModalOpen),
      }}>
      <WalletConnectorContainer
        isShown={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {props.children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
