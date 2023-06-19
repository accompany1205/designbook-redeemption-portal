import React, { useCallback, useEffect } from "react";
import {
  AccountId,
  Signer,
  TokenAssociateTransaction,
  PrivateKey,
  Client,
  TransferTransaction,
  TransactionReceiptQuery,
  Hbar,
} from "@hashgraph/sdk";
import { BladeSigner } from "@bladelabs/blade-web3.js";
import queryString from "query-string";
import { toast } from "react-toastify";
import ApiClient from "../../../api/client";

export interface BladeStoreState {
  signer: Signer | null;
  accountId: AccountId | null;
  hasSession: boolean;
}

const signer = new BladeSigner();

const useBladeStore = () => {
  const [state, setState] = React.useState<BladeStoreState>({
    signer: null,
    accountId: null,
    hasSession: false,
  });

  // useEffect(() => {
  //   const signer = new BladeSigner();
  //   // check if there is a session
  //   try {
  //     const hasSession = !!signer.getAccountId();
  //     console.log(signer.getAccountId());
  //     setState({
  //       signer,
  //       accountId: signer.getAccountId(),
  //       hasSession: true,
  //     });
  //     signer.onWalletLocked(() => {
  //       setState({
  //         signer: null,
  //         accountId: null,
  //         hasSession: false,
  //       });
  //     });
  //   } catch (e) {
  //     setState({
  //       signer: null,
  //       accountId: null,
  //       hasSession: false,
  //     });
  //   }
  // }, [])

  const connectToExtension = useCallback(async () => {
    if (state.hasSession) {
      console.log("Session was there");
      return;
    } else {
      try {
        await signer.createSession();
        signer.onWalletLocked(() => {
          setState({
            signer: null,
            accountId: null,
            hasSession: false,
          });
        });
        const accountId = signer.getAccountId();
        setState({
          signer,
          accountId,
          hasSession: true,
        });
        localStorage.setItem(
          "bladeWalletAccountId",
          JSON.stringify({
            bladeAccountId: accountId,
          })
        );
        return true;
      } catch (err: any) {
        toast.error("Could not connect to the extention");
      }
    }
  }, [state.hasSession]);
  const disconnectFromExtension = async () => {
    // if (state.signer) {
    // (window as any).bladeConnect.killSession();
    // }
    localStorage.removeItem("bladeWalletAccountId");
    setState({
      signer: null,
      accountId: null,
      hasSession: false,
    });
  };

  const claimNft = async (token: string) => {
    if (!state.signer) {
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

      //Create the transfer transaction for the user not to pay
      const sendHbar = await new TransferTransaction()
        .addHbarTransfer(treasuryId, Hbar.fromTinybars(-150000000))
        .addHbarTransfer(
          AccountId.fromString(`${state.signer.getAccountId()}`),
          Hbar.fromTinybars(150000000)
        )
        .execute(client);

      const transactionReceipt = await sendHbar.getReceipt(client);
      console.log(
        "The transfer transaction from brand account to the new account was: " +
          transactionReceipt.status.toString()
      );

      let associateBobTx = await new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(`${state.signer.getAccountId()}`))
        .setTokenIds([hedera_token_id])
        .freezeWithSigner(state.signer);

      const result = await associateBobTx.executeWithSigner(state.signer);

      let tokenTransferTx = await new TransferTransaction()
        .addNftTransfer(
          hedera_token_id,
          serial_number,
          treasuryId,
          state.signer.getAccountId()
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
      toast.error("Could not claim nft through blade.");
      return false;
    }
  };

  const returnNft = async (token: string) => {
    if (!state.signer) {
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

      let signer = state.signer;

      const client = Client.forTestnet();

      const treasuryId = AccountId.fromString(hedera_id);
      const treasuryKey = PrivateKey.fromString(hedera_private_key);
      client.setOperator(treasuryId, treasuryKey);

      //Create the transfer transaction for the user not to pay
      const sendHbar = await new TransferTransaction()
        .addHbarTransfer(treasuryId, Hbar.fromTinybars(-150000000))
        .addHbarTransfer(
          state.signer.getAccountId().toString(),
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
          state.signer.getAccountId().toString(),
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
      toast.error("Could not return nft through blade.");
      return false;
    }
  };

  const initializeBladeSigner = useCallback(() => {
    const wasConnected = JSON.parse(
      localStorage.getItem("bladeWalletAccountId") || "null"
    );
    if (wasConnected) {
      connectToExtension();
    }
  }, [connectToExtension]);

  useEffect(() => {
    initializeBladeSigner();
  }, [initializeBladeSigner]);

  return {
    accountId: state.accountId,
    hasSession: !!state.signer && !!state.accountId,
    connectToExtension,
    disconnectFromExtension,
    claimNft,
    returnNft,
  };
};

export default useBladeStore;
