import {
  AccountId,
  Client,
  PrivateKey,
  TokenAssociateTransaction,
  TransferTransaction,
  TransactionReceiptQuery,
  Hbar,
  NftId,
} from "@hashgraph/sdk";
import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";
import { HashConnectConnectionState } from "hashconnect/dist/types";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import queryString from "query-string";
import ApiClient from "../../../api/client";

export interface PropTypes {
  network: string;
  debug?: boolean;
}

export interface ResponseType {
  response: MessageTypes.TransactionResponse | undefined;
  receipt: any;
}

export interface SavedPairingData {
  metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata;
  pairingData: MessageTypes.ApprovePairing;
  privKey?: string;
}

export interface HashconnectContextAPI {
  hashConnect: HashConnect | null;
  availableExtension: HashConnectTypes.WalletMetadata;
  state: HashConnectConnectionState;
  topic: string;
  privKey?: string;
  pairingString: string;
  pairingData: MessageTypes.ApprovePairing | null;
  acknowledgeData: MessageTypes.Acknowledge;
}

type TNetwork = 'testnet' | 'mainnet' | 'previewnet';

const APP_CONFIG: HashConnectTypes.AppMetadata = {
  name: "dApp Example",
  description: "An example hedera dApp",
  icon: "https://absolute.url/to/icon.png",
  url: 'https://qa.redemption.designbook.app/'
};

const useHashStore = ({ network, debug = false }: PropTypes) => {
  const [hashState, setState] = useState<Partial<HashconnectContextAPI>>({
    hashConnect: null,
    availableExtension: undefined,
    state: HashConnectConnectionState.Disconnected,
    topic: "",
    privKey: undefined,
    pairingString: "",
    pairingData: null,
    acknowledgeData: undefined,
  });

  const sessionData: SavedPairingData | null = JSON.parse(
    localStorage.getItem("hashpack") || "null"
  );

  // const initializeHashConnect = useCallback(async () => {
  //   try {
  //     console.log("---------------------- initialized hash connect ----------------")
  //     hashState.hashConnect = new HashConnect(debug);
  //     if (!sessionData) {
  //       //first init and store the private key for later
  //       let initData = await hashState.hashConnect.init(APP_CONFIG);
  //       const privateKey = initData.privKey;
  //       if (debug) console.log("PRIVATE KEY: ", privateKey);

  //       //then connect, storing the new topic for later
  //       const state = await hashState.hashConnect.connect();
  //       if (debug) console.log("STATE: ", state);
  //       hashState.hashConnect.findLocalWallets();

  //       const topic = state.topic;

  //       //generate a pairing string, which you can display and generate a QR code from
  //       const pairingString = hashState.hashConnect.generatePairingString(
  //         state,
  //         network,
  //         debug ?? false
  //       );
  //       setState((exState) => ({
  //         ...exState,
  //         topic,
  //         privKey: privateKey,
  //         pairingString,
  //         state: HashConnectConnectionState.Disconnected,
  //       }));
  //     } else {
  //       hashState.hashConnect = new HashConnect(debug);
  //       await hashState.hashConnect.init(APP_CONFIG, sessionData?.privKey);

  //       const state = await hashState.hashConnect.connect(
  //         sessionData?.pairingData.topic,
  //         sessionData?.pairingData.metadata
  //       );

  //       hashState.hashConnect.findLocalWallets();

  //       const pairingString = hashState.hashConnect.generatePairingString(
  //         state,
  //         network,
  //         debug
  //       );

  //       setState((exState) => ({
  //         ...exState,
  //         pairingString,
  //         availableExtension: sessionData?.metadata,
  //         pairingData: sessionData?.pairingData,
  //         state: HashConnectConnectionState.Connected,
  //       }));
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [debug, network]);
  const initializeHashConnect = useCallback(async () => {
    try {
      console.log("---------------------- initialized hash connect ----------------")
      // hashState.hashConnect = new HashConnect(debug);
      const hashConnectInstance = new HashConnect(debug);
      // if (!sessionData) {
        //first init and store the private key for later
        let initData = await hashConnectInstance.init(APP_CONFIG, 'testnet');
        const privateKey = initData.encryptionKey;
        if (debug) console.log("PRIVATE KEY: ", privateKey);

        console.log({initData})
        //then connect, storing the new topic for later
        const state = await hashConnectInstance.connect();
        if (debug) console.log("STATE: ", state);
        hashConnectInstance.findLocalWallets();

        const { topic } = initData;

        //generate a pairing string, which you can display and generate a QR code from
        const pairingString = hashConnectInstance.generatePairingString(
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
          hashConnect: hashConnectInstance,
        }));
        
      // } else {
      //   // hashState.hashConnect = new HashConnect(debug);
      //   const hashConnectInstance = new HashConnect(debug);
      //   await hashConnectInstance.init(APP_CONFIG, (sessionData.privKey || 'testnet') as TNetwork,);

      //   const state = await hashConnectInstance.connect(
      //     sessionData?.pairingData.topic,
      //     sessionData?.pairingData.metadata
      //   );

      //   hashConnectInstance.findLocalWallets();

      //   const pairingString = hashConnectInstance.generatePairingString(
      //     state,
      //     network,
      //     debug
      //   );

      //   setState((exState) => ({
      //     ...exState,
      //     pairingString,
      //     availableExtension: sessionData?.metadata,
      //     pairingData: sessionData?.pairingData,
      //     state: HashConnectConnectionState.Connected,
      //     hashConnect: hashConnectInstance,
      //   }));
      // }
    } catch (error) {
      console.log(error);
    }
  }, [debug, network, sessionData]);

  const foundExtensionEventHandler = useCallback(
    (data: HashConnectTypes.WalletMetadata) => {
      if (debug) console.log("====foundExtensionEvent====", data);
      setState((exState) => ({ ...exState, availableExtension: data }));
    },
    [debug]
  );

  const saveDataInLocalStorage = useCallback(
    (data: SavedPairingData) => {
      if (debug)
        console.info("===============Saving to localstorage::=============");
      const dataToSave: SavedPairingData = {
        metadata: data.metadata!,
        privKey: data.privKey!,
        pairingData: data.pairingData!,
      };
      if (debug) console.log("DATA TO SAVE: ", data);
      localStorage.setItem("hashpack", JSON.stringify(dataToSave));
    },
    [debug]
  );

  const pairingEventHandler = useCallback(
    (data: MessageTypes.ApprovePairing) => {
      if (debug) console.log("===Wallet connected=====", data);
      setState((exState) => ({ ...exState, pairingData: data }));
      saveDataInLocalStorage({
        metadata: hashState.availableExtension!,
        pairingData: data,
        privKey: hashState.privKey!,
      });
    },
    [debug, saveDataInLocalStorage, hashState.availableExtension, hashState.privKey,]
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
    if (!hashState.hashConnect) return;
    hashState.hashConnect.foundExtensionEvent.on(foundExtensionEventHandler);
    hashState.hashConnect.pairingEvent.on(pairingEventHandler);
    hashState.hashConnect.acknowledgeMessageEvent.on(acknowledgeEventHandler);
    hashState.hashConnect.connectionStatusChangeEvent.on(onStatusChange);
    return () => {
      if (!hashState.hashConnect) return;
      hashState.hashConnect.foundExtensionEvent.off(foundExtensionEventHandler);
      hashState.hashConnect.pairingEvent.off(pairingEventHandler);
      hashState.hashConnect.acknowledgeMessageEvent.off(
        acknowledgeEventHandler
      );
    };
  }, [hashState.hashConnect]);

  const connectToExtension = async () => {
    if (hashState.state === HashConnectConnectionState.Connected) {
      toast.error("Already connected");
      return false;
    }
    console.log("2222222222222222", hashState)
    if (!hashState.availableExtension) {
      toast.error("Could not connect to the Hashpack extension");
      return false;
    }

    if (!hashState.hashConnect) {
      toast.error("An unexpected error occoured. Please reload");
      return false;
    }
    hashState.hashConnect.connectToLocalWallet();
    return true;
  };

  const disconnectFromExtension = () => {
    localStorage.removeItem("hashpack");
    setState!((exData) => ({
      ...exData,
      pairingData: null,
      state: HashConnectConnectionState.Disconnected,
    }));
  };

  const claimNft = async (token: string) => {
    if (!hashState.pairingData || !hashState.hashConnect) {
      toast.error("An unexpected error occoured. Reload and try again");
      return false;
    }

    try {
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

      let provider = hashState.hashConnect.getProvider(
        "testnet",
        hashState.pairingData.topic,
        hashState.pairingData.accountIds[0]
      );

      let signer = await hashState.hashConnect.getSigner(provider);
      //Create the transfer transaction for the user not to pay
      const sendHbar = await new TransferTransaction()
        .addHbarTransfer(treasuryId, Hbar.fromTinybars(-150000000))
        .addHbarTransfer(
          hashState.pairingData.accountIds[0],
          Hbar.fromTinybars(150000000)
        )
        .execute(client);
      const transactionReceipt = await sendHbar.getReceipt(client);
      console.log(
        "The transfer transaction from brand account to the new account was: " +
          transactionReceipt.status.toString()
      );
      let associateBobTx = await new TokenAssociateTransaction()
        .setAccountId(hashState.pairingData.accountIds[0])
        .setTokenIds([hedera_token_id])
        .freezeWithSigner(signer);
      let res1 = await associateBobTx.executeWithSigner(signer);
      let tokenTransferTx = await new TransferTransaction()
        .addNftTransfer(
          // hedera_token_id,
          // serial_number,
          new NftId(hedera_token_id, serial_number),
          treasuryId,
          hashState.pairingData.accountIds[0]
        )
        .freezeWith(client)
        .sign(treasuryKey);
      let res = await tokenTransferTx.execute(client);
      let tokenTransferRx = await res.getReceipt(client);

      if (tokenTransferRx.status.toString() === "SUCCESS") {
        await ApiClient.post("/change/status", {
          redemptionUrl: token,
          status: "redeemed",
        });
      }

      return true;
    } catch (err: any) {
      console.log("err", err);

      toast.error("Could not claim nft through hash pack");
      return false;
    }
  };

  const returnNft = async (token: string) => {
    if (!hashState.pairingData || !hashState.hashConnect) {
      toast.error("An unexpected error occoured. Reload and try again");
      return false;
    }

    try {
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
      let provider = hashState.hashConnect.getProvider(
        "testnet",
        hashState.pairingData.topic,
        hashState.pairingData.accountIds[0]
      );
      let signer = await hashState.hashConnect.getSigner(provider);

      const client = Client.forTestnet();

      const treasuryId = AccountId.fromString(hedera_id);
      const treasuryKey = PrivateKey.fromString(hedera_private_key);
      client.setOperator(treasuryId, treasuryKey);

      //Create the transfer transaction for the user not to pay
      const sendHbar = await new TransferTransaction()
        .addHbarTransfer(treasuryId, Hbar.fromTinybars(-150000000))
        .addHbarTransfer(
          hashState.pairingData.accountIds[0],
          Hbar.fromTinybars(150000000)
        )
        .execute(client);

      const transactionReceipt = await sendHbar.getReceipt(client);
      console.log(
        "The transfer transaction from brand account to the new account was: " +
          transactionReceipt.status.toString()
      );
      let tokenTransferTx = await new TransferTransaction()
        .addNftTransfer(
          hedera_token_id,
          serial_number,
          hashState.pairingData.accountIds[0],
          hedera_id
        )
        .freezeWithSigner(signer);
      
      let res1 = await tokenTransferTx.executeWithSigner(signer);
      
      const transferQuery = await new TransactionReceiptQuery()
        .setTransactionId(res1.transactionId)
        .execute(client)

      if (transferQuery.status.toString() === "SUCCESS") {

        await ApiClient.post("/change/status", {
          redemptionUrl: token,
          status: "returned",
        });
      };
      

      return true;
    } catch (err: any) {
      console.log("err", err);
      toast.error("Could not return nft through hashpack");
      return false;
    }
  };

  return {
    ...hashState,
    connectToExtension,
    status: hashState.pairingData
      ? HashConnectConnectionState.Connected
      : HashConnectConnectionState.Disconnected,
    disconnectFromExtension,
    accountId: hashState.pairingData?.accountIds[0].toString(),
    claimNft,
    returnNft,
  };
};

export default useHashStore;
