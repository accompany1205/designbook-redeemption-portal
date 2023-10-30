import { AccountId } from "@hashgraph/sdk";
import { createContext } from "react";  

// create a provider enum: blade || hashpack
export enum WalletServiceProviders {
  BLADE = "blade",
  HASHPACK = "hashpack",
}

export interface WalletContextType {
  provider?: WalletServiceProviders;
  accountId?: string | null | AccountId;
  network: string;
  claimNft: (token: string | null) => Promise<boolean>;
  returnNft: (token: string | null) => Promise<boolean>;
  connectWallet: (type: WalletServiceProviders) => Promise<void>;
  disconnectWallet: (type: WalletServiceProviders) => Promise<void>;
  toggleConnectWalletModal: () => void;
}

const WalletContext = createContext<WalletContextType>({
  provider: undefined,
  accountId: undefined,
  network: process.env.REACT_APP_HEDERA_NETWORK || "",
  claimNft: async () => false,
  returnNft: async () => false,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  toggleConnectWalletModal: () => {},
});

export default WalletContext;