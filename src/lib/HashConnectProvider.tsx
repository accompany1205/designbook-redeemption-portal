import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";
import { HashConnectConnectionState } from "hashconnect/dist/types";
import React, { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import {
  TransferTransaction,
  AccountId,
  PrivateKey,
  Client,
  TokenAssociateTransaction,
  Hbar,
} from "@hashgraph/sdk";
import queryString from "query-string";
import { BladeSigner, HederaNetwork } from "@bladelabs/blade-web3.js";

//initialize hashconnect
const hashConnect = new HashConnect(true);

export interface SavedPairingData {
  metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata;
  pairingData: MessageTypes.ApprovePairing;
  privKey?: string;
}

export interface PropsType {
  children: React.ReactNode;
  network: "testnet" | "mainnet" | "previewnet";
  metaData?: HashConnectTypes.AppMetadata;
  debug?: boolean;
}

//Intial App config
let APP_CONFIG: HashConnectTypes.AppMetadata = {
  name: "dApp Example",
  description: "An example hedera dApp",
  icon: "https://absolute.url/to/icon.png",
};

export interface HashconnectContextAPI {
  availableExtension: HashConnectTypes.WalletMetadata;
  state: HashConnectConnectionState;
  topic: string;
  privKey?: string;
  pairingString: string;
  pairingData: MessageTypes.ApprovePairing | null;
  acknowledgeData: MessageTypes.Acknowledge;
}

export const HashConnectAPIContext = React.createContext<
  Partial<
    HashconnectContextAPI & {
      setState: React.Dispatch<
        React.SetStateAction<Partial<HashconnectContextAPI>>
      >;
      network: "testnet" | "mainnet" | "previewnet";
    }
  >
>({ state: HashConnectConnectionState.Disconnected });

export const HashConnectAPIProvider = ({
  children,
  metaData,
  network,
  debug,
}: PropsType) => {
  const [cookies, setCookie] = useCookies(["hashconnectData"]);
  const [stateData, setState] = useState<Partial<HashconnectContextAPI>>({});

  // cookies are almost never being set right now so localdata is mostly undefined
  const localData = cookies.hashconnectData as any as SavedPairingData;

  //initialise the thing
  const initializeHashConnect = useCallback(async () => {
    localStorage.removeItem("hashconnectData"); // why are we doing this step?
    try {
      if (!localData) {
        if (debug) console.log("===Local data not found.=====");

        //first init and store the private key for later
        let initData = await hashConnect.init(metaData ?? APP_CONFIG);
        const privateKey = initData.privKey;
        console.log("PRIVATE KEY: ", privateKey);

        //then connect, storing the new topic for later
        const state = await hashConnect.connect();
        console.log("STATE: ", state);
        hashConnect.findLocalWallets();

        const topic = state.topic;

        //generate a pairing string, which you can display and generate a QR code from
        const pairingString = hashConnect.generatePairingString(
          state,
          network,
          debug ?? false
        );
        setState((exState) => ({
          ...exState,
          topic,
          privKey: privateKey,
          pairingString,
          state: HashConnectConnectionState.Disconnected,
        }));
      } else {
        if (debug) console.log("====Local data found====", localData);
        console.log("STATE DATA\n\n\n\n\n\n\n: ", localData);
        //use loaded data for initialization + connection
        await hashConnect.init(metaData ?? APP_CONFIG, localData?.privKey);
        console.log("debgug data: ", localData);
        const state = await hashConnect.connect(
          localData?.pairingData.topic,
          localData?.pairingData.metadata ?? metaData
        );
        hashConnect.findLocalWallets();

        const pairingString = hashConnect.generatePairingString(
          state,
          network,
          debug ?? false
        );

        setState((exState) => ({
          ...exState,
          pairingString,
          availableExtension: localData?.metadata,
          pairingData: localData?.pairingData,
          state: HashConnectConnectionState.Connected,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  }, [debug, localData, metaData, network]);

  const foundExtensionEventHandler = useCallback(
    (data: HashConnectTypes.WalletMetadata) => {
      if (debug) console.log("====foundExtensionEvent====", data);
      setState((exState) => ({ ...exState, availableExtension: data }));
    },
    [debug]
  );

  const saveDataInLocalStorage = useCallback(
    (data: MessageTypes.ApprovePairing) => {
      if (debug)
        console.info("===============Saving to localstorage::=============");
      const dataToSave: SavedPairingData = {
        metadata: stateData.availableExtension!,
        privKey: stateData.privKey!,
        pairingData: stateData.pairingData!,
      };
      console.log("DATA TO SAVE: ", stateData);
      // setCookie("hashconnectData", dataToSave, { path: "/" });
    },
    [debug]
  );

  const pairingEventHandler = useCallback(
    (data: MessageTypes.ApprovePairing) => {
      if (debug) console.log("===Wallet connected=====", data);
      setState((exState) => ({ ...exState, pairingData: data }));
      saveDataInLocalStorage(data);
    },
    [debug, saveDataInLocalStorage]
  );

  const acknowledgeEventHandler = useCallback(
    (data: MessageTypes.Acknowledge) => {
      if (debug) console.log("====::acknowledgeData::====", data);
      setState((iniData) => ({ ...iniData, acknowledgeData: data }));
    },
    [debug]
  );

  const onStatusChange = (state: HashConnectConnectionState) => {
    if (debug) console.log("hashconnect state change event", state);
    setState((exState) => ({ ...exState, state }));
  };

  useEffect(() => {
    initializeHashConnect();
  }, []);

  useEffect(() => {
    hashConnect.foundExtensionEvent.on(foundExtensionEventHandler);
    hashConnect.pairingEvent.on(pairingEventHandler);
    hashConnect.acknowledgeMessageEvent.on(acknowledgeEventHandler);
    hashConnect.connectionStatusChange.on(onStatusChange);
    return () => {
      hashConnect.foundExtensionEvent.off(foundExtensionEventHandler);
      hashConnect.pairingEvent.off(pairingEventHandler);
      hashConnect.acknowledgeMessageEvent.off(acknowledgeEventHandler);
    };
  }, []);

  return (
    <HashConnectAPIContext.Provider value={{ ...stateData, setState, network }}>
      {children}
    </HashConnectAPIContext.Provider>
  );
};

const defaultProps: Partial<PropsType> = {
  metaData: {
    name: "dApp Example",
    description: "An example hedera dApp",
    icon: "https://absolute.url/to/icon.png",
  },
  network: "testnet",
  debug: false,
};

HashConnectAPIProvider.defaultProps = defaultProps;

// export const HashConnectProvider = React.memo(HashConnectProviderWarped);

export const useHashConnect = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["hashconnectData"]);
  const value = React.useContext(HashConnectAPIContext);
  const { topic, pairingString, setState, privKey, pairingData } = value;

  const connectToExtension = async () => {
    //this will automatically pop up a pairing request in the HashPack extension
    hashConnect.connectToLocalWallet(pairingString!);
  };

  const sendTransaction = async (
    trans: Uint8Array,
    acctToSign: string,
    return_trans: boolean = false,
    hideNfts: boolean = false
  ) => {
    const transaction: MessageTypes.Transaction = {
      topic: topic!,
      byteArray: trans,

      metadata: {
        accountToSign: acctToSign,
        returnTransaction: return_trans,
      },
    };

    return await hashConnect.sendTransaction(topic!, transaction);
  };

  const disconnect = () => {
    removeCookie("hashconnectData");
    setState!((exData) => ({ ...exData, pairingData: null }));
  };

  async function initBlade() {
    const bladeSigner = new BladeSigner();
    const params = {
      network: HederaNetwork.Testnet,
      // dAppCode - optional while testing, request specific one by contacting us.
      dAppCode: "yourAwesomeApp",
    };
    // create session with optional parameters.
    await bladeSigner.createSession(params);

    // bladeSigner object can now be used.
    return bladeSigner;
  }

  const claimNft = async (blade: boolean = false) => {
    if (!pairingData) {
      return;
    }

    const value = queryString.parse(window.location.search);
    const token = value.claim;

    if (!token) {
      return;
    }

    const config = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ redemptionUrl: token }),
    };
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}nftdata`,
      config
    );
    const data = await response.json();

    const { serial_number, hedera_token_id, hedera_id, hedera_private_key } =
      data;
    const client = Client.forTestnet();

    const treasuryId = AccountId.fromString(hedera_id);
    const treasuryKey = PrivateKey.fromString(hedera_private_key);
    client.setOperator(treasuryId, treasuryKey);

    let provider = hashConnect.getProvider(
      "testnet",
      pairingData.topic,
      pairingData.accountIds[0]
    );

    let signer = await hashConnect.getSigner(provider);

    let bladeSigner = await initBlade();

    //Create the transfer transaction for the user not to pay
    const sendHbar = await new TransferTransaction()
      .addHbarTransfer(treasuryId, Hbar.fromTinybars(-150000000))
      .addHbarTransfer(
        blade
          ? AccountId.fromString(`${bladeSigner.getAccountId()}`)
          : pairingData.accountIds[0],
        Hbar.fromTinybars(150000000)
      )
      .execute(client);

    const transactionReceipt = await sendHbar.getReceipt(client);
    console.log(
      "The transfer transaction from brand account to the new account was: " +
        transactionReceipt.status.toString()
    );

    let associateBobTx = await new TokenAssociateTransaction()
      .setAccountId(
        blade
          ? AccountId.fromString(`${bladeSigner.getAccountId()}`)
          : pairingData.accountIds[0]
      )
      .setTokenIds([hedera_token_id])
      .freezeWithSigner(blade ? bladeSigner : signer);

    try {
      const result = await associateBobTx.executeWithSigner(
        blade ? bladeSigner : signer
      );
    } catch (e) {
      // blade fails if already associated
      console.log(e);
    }

    let tokenTransferTx = await new TransferTransaction()
      .addNftTransfer(
        hedera_token_id,
        serial_number,
        treasuryId,
        blade ? bladeSigner.getAccountId() : pairingData.accountIds[0]
      )
      .freezeWith(client)
      .sign(treasuryKey);

    let res = await tokenTransferTx.execute(client);

    let tokenTransferRx = await res.getReceipt(client);
  };

  const returnNFT = async () => {
    if (!pairingData) {
      return;
    }

    const value = queryString.parse(window.location.search);
    const token = value.claim;

    if (!token) {
      return;
    }
    const config = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ redemptionUrl: token }), //"76a4f9efb734dd5f3a77f2567921fa5d"})
    };
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}nftdata`,
      config
    );
    const data = await response.json();
    const { serial_number, hedera_token_id, hedera_id, hedera_private_key } =
      data;
    let provider = hashConnect.getProvider(
      "testnet",
      pairingData.topic,
      pairingData.accountIds[0]
    );
    let signer = await hashConnect.getSigner(provider);
    let tokenTransferTx = await new TransferTransaction()
      .addNftTransfer(
        hedera_token_id,
        serial_number,
        pairingData.accountIds[0],
        hedera_id
      )
      .freezeWithSigner(signer);
    let res1 = await tokenTransferTx.executeWithSigner(signer);
  };

  return {
    ...value,
    connectToExtension,
    sendTransaction,
    disconnect,
    claimNft,
    returnNFT,
  };
};
