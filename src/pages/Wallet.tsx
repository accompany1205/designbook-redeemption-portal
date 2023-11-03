import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, MagicClient } from "../contexts/AuthContext";
import {
  Client,
  AccountId,
  PrivateKey,
  TransferTransaction,
  Hbar,
  NftId,
  TokenAssociateTransaction,
} from "@hashgraph/sdk";
import { MagicProvider } from "../magic/MagicProvider";
import { MagicWallet } from "../magic/MagicWallet";
import axios from "axios";
import WalletContext, {
  WalletServiceProviders,
} from "../lib/WalletService/WalletContext";
import { NotificationTypeValue } from "../components/Notification";
import { validateHederaAddress } from "../helpers/form-validators";
import Loader from "../components/Loader";

// https://gigaland.io/register.html

function Wallet() {
  const [isLeft, setLeft] = useState<boolean>(true);
  const {
    isLoggedIn,
    setLoggedIn,
    userMetadata,
    publicAddress,
    hBarPrice,
    disConnectMagic,
    token,
    authMagic,
    setNotificationState
  } = useContext(AuthContext);
  const { provider, accountId, claimNft, returnNft, disconnectWallet } =
    useContext(WalletContext);
  const [balance, setBalance] = useState<number>(0);
  const navigate = useNavigate();
  const [nftCollection, setCollection] = useState<any[]>([]);
  const [activeNft, setActiveNFT] = useState<any>(null);
  const [sentModalShow, setSendModalShow] = useState<boolean>(false);
  const [targetAddress, setTargetAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [nftClaimStatus, setNftClaimStatus] = useState<string>("none");
  const [activeDetailImg, setActiveDetailImg] = useState<string>("");
  const [receiveStatus, setReceiveStatus] = useState<boolean>(false);
  const [returnStatus, setReturnStatus] = useState<boolean>(false);
  const [buyStatus, setBuyStatus] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn]);
  useEffect(() => {
    console.log({ activeNft });
  }, [activeNft]);

  useEffect(() => {
    if (publicAddress) {
      getBalance(publicAddress);
      getNft(publicAddress);
    } else {
      getBalance(accountId?.toString() || "");
    }
    if (token) {
      setReceiveStatus(true);
      setReturnStatus(true);
    }
  }, []);

  const getBalance = async (address: string) => {
    const res = await axios.get(
      `${process.env.REACT_APP_HEDERA_NET_BASEURL}api/v1/accounts?account.id=${address}`
    );
    console.log(res);
    if (
      res &&
      res.status === 200 &&
      res.data &&
      res.data.accounts &&
      res.data.accounts.length > 0
    ) {
      console.log();
      setBalance(
        Number(
          (res.data?.accounts[0].balance.balance / Math.pow(10, 8)).toFixed(2)
        )
      );
    }
  };

  const getNft = async (addr: string) => {
    const res = await axios.get(
      `${process.env.REACT_APP_HEDERA_NET_BASEURL}api/v1/accounts/${addr}/nfts`
    );
    console.log("getNft: ", res);
    if (res && res.status === 200 && res.data) {
      let collections = [];
      if (res.data.nfts?.length > 0) {
        let itr = 0;
        for (const collection of res.data.nfts) {
          let newNft: any = {};
          for (let key in collection) {
            if (
              key === "account_id" ||
              key === "serial_number" ||
              key === "token_id"
            ) {
              newNft[key] = collection[key];
            }
            if (key === "metadata") {
              let str = atob(collection[key]);
              str = str.replace("ipfs://", "");
              console.log({ str });
              const ipfsRes = await axios.get(`https://ipfs.io/ipfs/${str}`);
              console.log(ipfsRes);

              newNft = {
                ...newNft,
                ...ipfsRes.data,
                _ipfs: `ipfs://${str}`,
                checked: false,
              };
            }
          }
          collections.push({ ...newNft, id: itr });
          itr++;
        }
      }
      setCollection(collections);
    }
  };

  const ipfsUtil = (src: string): string => {
    let ipfsImg = src.replace("ipfs://", "ipfs/");
    return "https://ipfs.io/" + ipfsImg;
  };

  const getUsdAmount = (value: number): number => {
    return Number((value * hBarPrice).toFixed(2));
  };

  const handleClickTabBtn = (position: boolean) => {
    setLeft(position);
  };
  const handleClickDisconnect = async () => {
    console.log("handleClickDisconnect");
    disConnectMagic();
  };

  const receiveNFTWithMagic = async () => {
    try {
      if (token) {
        if (nftClaimStatus === "redeemed") {
          // toast.info("You already redeemed this NFT.");
          setNotificationState({ type: NotificationTypeValue.INFO, text: "You already redeemed this NFT.", timeout: 3000 })
          return;
        }
        // else if (nftClaimStatus === "returned") {
        //   toast.info("You already returned this NFT.");
        //   return;
        // }
        setLoading(true);
        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}nftdata`,
          { redemptionUrl: token }
        );
        if (res && res.status === 200 && res.data) {
          console.log("NFT data to receive: ", res);
          //add redemption status filed in response from api then not allow following transactions for the NFT which is already redeemed or returen.
          const {
            id,
            serial_number,
            hedera_token_id,
            hedera_id,
            hedera_private_key,
            redemption_status,
            is_sent_transaction_fee,
          } = res.data;
          console.log({ res });
          if (redemption_status === "redeemed") {
            // toast.info("This NFT was already redeemed!");
            setNotificationState({ type: NotificationTypeValue.INFO, text: "This NFT was already redeemed!", timeout: 3000 })
            setLoading(false);
            setReceiveStatus(false);
            return;
          }
          const client =
            process.env.REACT_APP_HEDERA_NETWORK == "mainnet"
              ? Client.forMainnet()
              : Client.forTestnet();

          const { publicKeyDer } = await MagicClient.hedera.getPublicKey();
          const magicSign = (message: any): any =>
            MagicClient.hedera.sign(message);
          const magicWallet = new MagicWallet(
            publicAddress,
            new MagicProvider(process.env.REACT_APP_HEDERA_NETWORK),
            publicKeyDer,
            magicSign,
            () => { }
          );
          const treasuryId = AccountId.fromString(hedera_id);
          const treasuryKey = PrivateKey.fromString(hedera_private_key);
          client.setOperator(treasuryId, treasuryKey);
          if (!is_sent_transaction_fee) {
            const sendHbar = await new TransferTransaction()
              .addHbarTransfer(treasuryId, Hbar.fromTinybars(-150000000))
              .addHbarTransfer(publicAddress, Hbar.fromTinybars(150000000))
              .execute(client);
            const transactionReceipt = await sendHbar.getReceipt(client);
            console.log(
              "The HBAR transfer transaction from brand account to the new account was: " +
              transactionReceipt.status.toString()
            );
            if (transactionReceipt.status.toString() === "SUCCESS") {
              const res = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}nftdata/update`,
                { id }
              );
            }
          }
          try {
            let associateBobTx = await new TokenAssociateTransaction()
              .setAccountId(publicAddress)
              .setTokenIds([hedera_token_id])
              .freezeWithSigner(magicWallet);

            let associateBobTxRes = await associateBobTx.executeWithSigner(
              magicWallet
            );
            const associatedBobTxReceipt =
              await associateBobTxRes.getReceiptWithSigner(magicWallet);
            console.log(
              "The token associated transaction status: " +
              associatedBobTxReceipt.status.toString()
            );
          } catch (e) {
            console.log(e);
          }
          let tokenTransferTx = await new TransferTransaction()
            .addNftTransfer(
              new NftId(hedera_token_id, serial_number),
              treasuryId,
              publicAddress
            )
            .freezeWith(client)
            .sign(treasuryKey);

          let tokenTransferTxRes = await tokenTransferTx.execute(client);
          let tokenTransferRx = await tokenTransferTxRes.getReceipt(client);
          if (tokenTransferRx.status.toString() === "SUCCESS") {
            await axios.post(
              `${process.env.REACT_APP_BACKEND_URL}change/status`,
              {
                redemptionUrl: token,
                status: "redeemed",
              }
            );
            // toast.success("Successfully claimed NFT!");
            setNotificationState({ type: NotificationTypeValue.SUCCESS, text: "Successfully claimed NFT!", timeout: 3000 })

            setNftClaimStatus("redeemed");
            setReceiveStatus(false);
            setTimeout(() => {
              getNft(publicAddress);
            }, 1000);
          } else {
            setNotificationState({ type: NotificationTypeValue.ERROR, text: "Failed to receive NFT.", timeout: 3000 })
          }
          getBalance(publicAddress);
        }
        setLoading(false);
      } else {
        setNotificationState({ type: NotificationTypeValue.ERROR, text: "No redemption token in the url!", timeout: 3000 })

      }
    } catch (e) {
      console.log(e);
      setLoading(false);
      getBalance(publicAddress);
      setNotificationState({ type: NotificationTypeValue.ERROR, text: "Failed to receive NFT.", timeout: 3000 })

    }
    console.log("handleClickSend", token);
  };
  const returnNFTWithMagic = async () => {
    try {
      if (token) {
        // if (nftClaimStatus === "redeemed") {
        //   toast.info("You already redeemed this NFT.");
        //   return;
        // }
        if (nftClaimStatus === "returned") {
          setNotificationState({ type: NotificationTypeValue.INFO, text: "You already returned this NFT.", timeout: 3000 })
          return;
        }
        setLoading(true);
        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}nftdata`,
          { redemptionUrl: token }
        );
        if (res && res.status === 200 && res.data) {
          const {
            serial_number,
            hedera_token_id,
            hedera_id,
            hedera_private_key,
            redemption_status,
            // is_sent_transaction_fee
          } = res.data;
          console.log({ res });
          //check if already returned or not
          if (redemption_status === "returned") {
            setNotificationState({ type: NotificationTypeValue.INFO, text: "This NFT was already returned!", timeout: 3000 })
            setReturnStatus(false);
            setLoading(false);
            return;
          }
          const client =
            process.env.REACT_APP_HEDERA_NETWORK == "mainnet"
              ? Client.forMainnet()
              : Client.forTestnet();

          const { publicKeyDer } = await MagicClient.hedera.getPublicKey();
          const magicSign = (message: any): any =>
            MagicClient.hedera.sign(message);
          const magicWallet = new MagicWallet(
            publicAddress,
            new MagicProvider(process.env.REACT_APP_HEDERA_NETWORK),
            publicKeyDer,
            magicSign,
            () => { }
          );
          const treasuryId = AccountId.fromString(hedera_id);
          const treasuryKey = PrivateKey.fromString(hedera_private_key);
          client.setOperator(treasuryId, treasuryKey);
          //comment send HBAR transaction to user account now
          // const sendHbar = await new TransferTransaction()
          //   .addHbarTransfer(treasuryId, Hbar.fromTinybars(-150000000))
          //   .addHbarTransfer(publicAddress, Hbar.fromTinybars(150000000))
          //   .execute(client);
          // const transactionReceipt = await sendHbar.getReceipt(client);
          // console.log(
          //   "The HBAR transfer transaction from brand account to the new account was: " +
          //     transactionReceipt.status.toString()
          // );

          let tokenTransferTx = await new TransferTransaction()
            .addNftTransfer(
              new NftId(hedera_token_id, serial_number),
              publicAddress,
              treasuryId
            )
            .freezeWithSigner(magicWallet);

          const tokenTransferTxRes = await tokenTransferTx.executeWithSigner(
            magicWallet
          );
          const tokenTransferTxReceipt =
            await tokenTransferTxRes.getReceiptWithSigner(magicWallet);
          console.log({ tokenTransferTxReceipt });
          if (tokenTransferTxReceipt.status.toString() === "SUCCESS") {
            await axios.post(
              `${process.env.REACT_APP_BACKEND_URL}change/status`,
              {
                redemptionUrl: token,
                status: "returned",
              }
            );
            setLoading(false);
            setNotificationState({ type: NotificationTypeValue.SUCCESS, text: "Successfully returned NFT!", timeout: 3000 })

            setNftClaimStatus("returned");
            setReturnStatus(false);
            setTimeout(() => {
              getNft(publicAddress);
            }, 1000);
          } else {
            setNotificationState({ type: NotificationTypeValue.ERROR, text: "Failed to return NFT.", timeout: 3000 })
          }
          getBalance(publicAddress);
        }
        setLoading(false);
      } else {
        setNotificationState({ type: NotificationTypeValue.ERROR, text: "No redemption token in the url!", timeout: 3000 })
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
      setNotificationState({ type: NotificationTypeValue.ERROR, text: "Failed to return NFT.", timeout: 3000 })
      getNft(publicAddress);
    }
  };
  const sendNFTWithMagic = async () => {
    console.log("sendModalShow");
    if (!validateHederaAddress(targetAddress)) {
      setNotificationState({ type: NotificationTypeValue.ERROR, text: "Invalid Hedera Address", timeout: 3000 })
      return;
    }
    try {
      setLoading(true);
      const { publicKeyDer } = await MagicClient.hedera.getPublicKey();
      const magicSign = (message: any): any => MagicClient.hedera.sign(message);
      const magicWallet = new MagicWallet(
        publicAddress,
        new MagicProvider(process.env.REACT_APP_HEDERA_NETWORK),
        publicKeyDer,
        magicSign,
        () => { }
      );
      const treasuryId = AccountId.fromString(publicAddress);
      let tokenTransferTx = await new TransferTransaction()
        .addNftTransfer(
          new NftId(activeNft.token_id, activeNft.serial_number),
          treasuryId,
          targetAddress
        )
        .freezeWithSigner(magicWallet);
      let tokenTransferTxRes = await tokenTransferTx.executeWithSigner(
        magicWallet
      );
      const receipt = await tokenTransferTxRes.getReceiptWithSigner(
        magicWallet
      );
      if (receipt.status.toString() === "SUCCESS") {
        console.log("1-", { receipt });
        setActiveNFT(null);
        setNotificationState({ type: NotificationTypeValue.SUCCESS, text: "Successfully sent NFT!", timeout: 3000 })
        setTimeout(() => {
          getNft(publicAddress);
        }, 1000);
      } else {
        setNotificationState({ type: NotificationTypeValue.ERROR, text: "Failed to send NFT.", timeout: 3000 })
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setNotificationState({ type: NotificationTypeValue.ERROR, text: "Failed to send NFT.", timeout: 3000 })
      console.log(e);
    }

    setSendModalShow(false);
  };

  const receiveNFTWithHashpack = async () => {
    if (token) {
      if (nftClaimStatus === "redeemed") {
        setNotificationState({ type: NotificationTypeValue.INFO, text: "You already redeemed this NFT.", timeout: 3000 })
        return;
      }
      // else if (nftClaimStatus === "returned") {
      //   toast.info("You already returned this NFT.");
      //   return;
      // }
      setLoading(true);
      const res = await claimNft(token);
      console.log("NFT claim result with hashpack = ", res);
      if (res) {
        setNotificationState({ type: NotificationTypeValue.SUCCESS, text: "Successfully claimed NFT!", timeout: 3000 })
        setNftClaimStatus("redeemed");
      } else {
        setNotificationState({ type: NotificationTypeValue.ERROR, text: "Failed to receive NFT.", timeout: 3000 })
      }
      setLoading(false);
      setTimeout(() => {
        getBalance(accountId?.toString() || "");
      }, 1000);
    } else {
      setNotificationState({ type: NotificationTypeValue.ERROR, text: "No redemption token in the url!", timeout: 3000 })
    }
  };
  const returnNFTWithHashpack = async () => {
    if (token) {
      if (nftClaimStatus === "returned") {
        setNotificationState({ type: NotificationTypeValue.INFO, text: "You already returned this NFT.", timeout: 3000 })
        return;
      }
      setLoading(true);
      const res = await returnNft(token);
      console.log("NFT return result with hashpack = ", res);
      if (res) {
        setNotificationState({ type: NotificationTypeValue.SUCCESS, text: "Successfully returned NFT!", timeout: 3000 })
        setNftClaimStatus("returned");
      } else {
        setNotificationState({ type: NotificationTypeValue.ERROR, text: "Failed to return NFT.", timeout: 3000 })
      }
      setLoading(false);
      setTimeout(() => {
        getBalance(accountId?.toString() || "");
      }, 1000);
    } else {
      setNotificationState({ type: NotificationTypeValue.ERROR, text: "No redemption token in the url!", timeout: 3000 })
    }
  };
  const download = (url: string) => {
    fetch(url, {
      method: "get",
      headers: {},
    })
      .then((response) => {
        response.arrayBuffer().then(function (buffer) {
          const url = window.URL.createObjectURL(new Blob([buffer]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "image.png"); //or any other extension
          document.body.appendChild(link);
          link.click();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  if (authMagic) {
    return (
      <Loader isLoading={loading}>
        <section className="bg-white sm:bg-[#F0E4FE] font-[Helvetica]">
          <div className="flex flex-wrap items-start justify-center min-h-screen sm:pt-20">
            {!activeNft ? (
              <div className="w-full sm:w-[384px] pt-8 sm:pt-0">
                <div className="rounded-[25px] border-0 sm:border-[1px] border-solid border-[#959595] mb-8">
                  <div className="text-center text-2xl font-bold mb-4 mt-6">
                    With{" "}
                    <span className="text-[#5E1DFC] font-bold">
                      Magic Wallet
                    </span>
                  </div>
                  <div className="flex justify-center mb-8">
                    <img src="/images/magicLogo.png" alt="magic logo" />
                  </div>
                </div>
                <div className="bg-white sm:bg-[#F5F5F5] rounded-[25px] min-w-[300px] pt-4 pb-8">
                  <div className="flex items-center justify-between px-4 mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="23"
                      height="24"
                      viewBox="0 0 23 24"
                      fill="none"
                    >
                      <circle cx="11.5" cy="11.5" r="11.5" fill="#CBCBCB" />
                      <mask
                        id="mask0_564_582"
                        style={{ maskType: "alpha" }}
                        maskUnits="userSpaceOnUse"
                        x="2"
                        y="3"
                        width="19"
                        height="21"
                      >
                        <g clipPath="url(#clip0_564_582)">
                          <path
                            d="M13.8725 14.499C13.1567 14.8626 12.3517 15.0675 11.5 15.0675C10.6483 15.0675 9.84332 14.8626 9.12746 14.499C5.02881 15.587 2 19.4281 2 23.9995H21C21 19.4281 17.9712 15.587 13.8725 14.499Z"
                            fill="#7A7AB8"
                          />
                          <path
                            d="M11.499 3C8.52565 3 6.11523 5.48879 6.11523 8.55888C6.11523 10.7496 7.34303 12.6436 9.12649 13.5492C9.84235 13.9128 10.6474 14.1178 11.499 14.1178C12.3507 14.1178 13.1557 13.9128 13.8716 13.5492C15.655 12.6436 16.8828 10.7496 16.8828 8.55888C16.8828 5.48879 14.4724 3 11.499 3Z"
                            fill="#7A7AB8"
                          />
                        </g>
                      </mask>
                      <g mask="url(#mask0_564_582)">
                        <circle cx="11.5" cy="11.5" r="11.5" fill="#1D1E1F" />
                      </g>
                      <defs>
                        <clipPath id="clip0_564_582">
                          <rect
                            width="19"
                            height="21"
                            fill="white"
                            transform="translate(2 3)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                    <span className="text-sm font-bold">Hedera</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="23"
                      height="23"
                      viewBox="0 0 23 23"
                      fill="none"
                      onClick={() => handleClickDisconnect()}
                      className="cursor-pointer"
                    >
                      <circle cx="11.5" cy="11.5" r="11.5" fill="#CBCBCB" />
                      <path
                        d="M7.36133 7.35938L15.6413 15.6394"
                        stroke="#1D1E1F"
                      />
                      <path
                        d="M15.6406 7.35938L7.36063 15.6394"
                        stroke="#1D1E1F"
                      />
                    </svg>
                  </div>
                  <div className="bg-white md:bg-[#f0e4fe] text-sm font-medium text-center text-[#696969] mb-4 py-2">
                    {userMetadata?.email}
                  </div>
                  <div className="text-sm font-medium text-center text-[#696969] mb-4">
                    {publicAddress}
                  </div>
                  <div className="text-4xl font-bold text-center mb-12">
                    ${getUsdAmount(balance)}
                  </div>
                  <div className="flex items-center justify-center mb-8">
                    <div className="flex flex-col items-center justify-center mr-10">
                      {/* <svg xmlns="http://www.w3.org/2000/svg" width="39" height="39" viewBox="0 0 39 39" fill="none" className="cursor-pointer" onClick={() => receiveNFTWithMagic()}>
                        <circle cx="19.4258" cy="19.4258" r="19.4258" fill={receiveStatus ? "#5E1DFC" : "#D9D9D9"} />
                        <g clip-path="url(#clip0_570_873)">
                          <path d="M19.7875 22.1872H18.3775C17.38 22.1872 16.5625 21.3472 16.5625 20.3122C16.5625 20.0047 16.8175 19.7497 17.125 19.7497C17.4325 19.7497 17.6875 20.0047 17.6875 20.3122C17.6875 20.7247 17.995 21.0622 18.3775 21.0622H19.7875C20.08 21.0622 20.3125 20.7997 20.3125 20.4772C20.3125 20.0722 20.2 20.0122 19.945 19.9222L17.6875 19.1347C17.2075 18.9697 16.5625 18.6172 16.5625 17.5147C16.5625 16.5772 17.305 15.8047 18.2125 15.8047H19.6225C20.62 15.8047 21.4375 16.6447 21.4375 17.6797C21.4375 17.9872 21.1825 18.2422 20.875 18.2422C20.5675 18.2422 20.3125 17.9872 20.3125 17.6797C20.3125 17.2672 20.005 16.9297 19.6225 16.9297H18.2125C17.92 16.9297 17.6875 17.1922 17.6875 17.5147C17.6875 17.9197 17.8 17.9797 18.055 18.0697L20.3125 18.8572C20.7925 19.0222 21.4375 19.3747 21.4375 20.4772C21.4375 21.4222 20.695 22.1872 19.7875 22.1872Z" stroke={receiveStatus ? "#ffffff" : "#696969"} />
                          <path d="M19 22.9375C18.6925 22.9375 18.4375 22.6825 18.4375 22.375V15.625C18.4375 15.3175 18.6925 15.0625 19 15.0625C19.3075 15.0625 19.5625 15.3175 19.5625 15.625V22.375C19.5625 22.6825 19.3075 22.9375 19 22.9375Z" stroke={receiveStatus ? "#ffffff" : "#696969"} />
                          <path d="M19 27.0625C14.5525 27.0625 10.9375 23.4475 10.9375 19C10.9375 14.5525 14.5525 10.9375 19 10.9375C19.3075 10.9375 19.5625 11.1925 19.5625 11.5C19.5625 11.8075 19.3075 12.0625 19 12.0625C15.175 12.0625 12.0625 15.175 12.0625 19C12.0625 22.825 15.175 25.9375 19 25.9375C22.825 25.9375 25.9375 22.825 25.9375 19C25.9375 18.6925 26.1925 18.4375 26.5 18.4375C26.8075 18.4375 27.0625 18.6925 27.0625 19C27.0625 23.4475 23.4475 27.0625 19 27.0625Z" stroke={receiveStatus ? "#ffffff" : "#696969"} />
                          <path d="M25.75 15.8125H22.75C22.4425 15.8125 22.1875 15.5575 22.1875 15.25V12.25C22.1875 11.9425 22.4425 11.6875 22.75 11.6875C23.0575 11.6875 23.3125 11.9425 23.3125 12.25V14.6875H25.75C26.0575 14.6875 26.3125 14.9425 26.3125 15.25C26.3125 15.5575 26.0575 15.8125 25.75 15.8125Z" stroke={receiveStatus ? "#ffffff" : "#696969"} />
                          <path d="M22.7501 15.8126C22.6076 15.8126 22.4651 15.7601 22.3526 15.6476C22.1351 15.4301 22.1351 15.0701 22.3526 14.8526L26.1026 11.1026C26.3201 10.8851 26.6801 10.8851 26.8976 11.1026C27.1151 11.3201 27.1151 11.6801 26.8976 11.8976L23.1476 15.6476C23.0351 15.7601 22.8926 15.8126 22.7501 15.8126Z" stroke={receiveStatus ? "#ffffff" : "#696969"} />
                        </g>
                        <defs>
                          <clipPath id="clip0_570_873">
                            <rect width="18" height="18" fill="white" transform="translate(10 10)" />
                          </clipPath>
                        </defs>
                      </svg> */}
                      <img
                        src={receiveStatus ? "/images/receive-enable.png" : "/images/receive-disable.png"}
                        alt="receive"
                        className="cursor-pointer"
                        onClick={() => receiveNFTWithMagic()}
                      />
                      <div className={`text-sm fonnormalum text-left text-[${receiveStatus ? "#5E1DFC" : "#696969"}] mt-3`}>
                        Receive
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center mr-10">
                      {/* <svg xmlns="http://www.w3.org/2000/svg" width="39" height="39" viewBox="0 0 39 39" fill="none" className="cursor-pointer" onClick={() => returnNFTWithMagic()}>
                        <circle cx="19.4258" cy="19.4258" r="19.4258" fill={returnStatus ? "#5E1DFC" : "#D9D9D9"} />
                        <path d="M19.85 22.2497H18.44C17.4425 22.2497 16.625 21.4097 16.625 20.3747C16.625 20.0672 16.88 19.8122 17.1875 19.8122C17.495 19.8122 17.75 20.0672 17.75 20.3747C17.75 20.7872 18.0575 21.1247 18.44 21.1247H19.85C20.1425 21.1247 20.375 20.8622 20.375 20.5397C20.375 20.1347 20.2625 20.0747 20.0075 19.9847L17.75 19.1972C17.27 19.0322 16.625 18.6797 16.625 17.5772C16.625 16.6397 17.3675 15.8672 18.275 15.8672H19.685C20.6825 15.8672 21.5 16.7072 21.5 17.7422C21.5 18.0497 21.245 18.3047 20.9375 18.3047C20.63 18.3047 20.375 18.0497 20.375 17.7422C20.375 17.3297 20.0675 16.9922 19.685 16.9922H18.275C17.9825 16.9922 17.75 17.2547 17.75 17.5772C17.75 17.9822 17.8625 18.0422 18.1175 18.1322L20.375 18.9197C20.855 19.0847 21.5 19.4372 21.5 20.5397C21.5 21.4847 20.7575 22.2497 19.85 22.2497Z" stroke={returnStatus ? "#ffffff" : "#696969"} />
                        <path d="M19.0625 23C18.755 23 18.5 22.745 18.5 22.4375V15.6875C18.5 15.38 18.755 15.125 19.0625 15.125C19.37 15.125 19.625 15.38 19.625 15.6875V22.4375C19.625 22.745 19.37 23 19.0625 23Z" stroke={returnStatus ? "#ffffff" : "#696969"} />
                        <path d="M19.0625 27.125C14.615 27.125 11 23.51 11 19.0625C11 14.615 14.615 11 19.0625 11C19.37 11 19.625 11.255 19.625 11.5625C19.625 11.87 19.37 12.125 19.0625 12.125C15.2375 12.125 12.125 15.2375 12.125 19.0625C12.125 22.8875 15.2375 26 19.0625 26C22.8875 26 26 22.8875 26 19.0625C26 18.755 26.255 18.5 26.5625 18.5C26.87 18.5 27.125 18.755 27.125 19.0625C27.125 23.51 23.51 27.125 19.0625 27.125Z" stroke={returnStatus ? "#ffffff" : "#696969"} />
                        <path d="M23.5605 11.002L26.5605 11.002C26.868 11.002 27.123 11.257 27.123 11.5645L27.123 14.5645C27.123 14.872 26.868 15.127 26.5605 15.127C26.253 15.127 25.998 14.872 25.998 14.5645L25.998 12.127L23.5605 12.127C23.253 12.127 22.998 11.872 22.998 11.5645C22.998 11.257 23.253 11.002 23.5605 11.002Z" stroke={returnStatus ? "#ffffff" : "#696969"} />
                        <path d="M26.5605 11.0019C26.703 11.0019 26.8455 11.0544 26.958 11.1669C27.1755 11.3844 27.1755 11.7444 26.958 11.9619L23.208 15.7119C22.9905 15.9294 22.6305 15.9294 22.413 15.7119C22.1955 15.4944 22.1955 15.1344 22.413 14.9169L26.163 11.1669C26.2755 11.0544 26.418 11.0019 26.5605 11.0019Z" stroke={returnStatus ? "#ffffff" : "#696969"} />
                      </svg> */}
                      <img
                        src={returnStatus ? "/images/return-enable.png" : "/images/return-disable.png"}
                        alt="receive"
                        className="cursor-pointer"
                        onClick={() => returnNFTWithMagic()}
                      />
                      <div className={`text-sm fonnormalum text-left text-[${returnStatus ? "#5E1DFC" : "#696969"}] mt-3`}>
                        returnStatus
                      </div>
                    </div>
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="39"
                        height="39"
                        viewBox="0 0 39 39"
                        fill="none"
                      >
                        <circle
                          cx="19.4258"
                          cy="19.4258"
                          r="19.4258"
                          fill={buyStatus ? "#5E1DFC" : "#D9D9D9"}
                        />
                        <path
                          d="M23.5 19.5625H14.5C14.1925 19.5625 13.9375 19.3075 13.9375 19C13.9375 18.6925 14.1925 18.4375 14.5 18.4375H23.5C23.8075 18.4375 24.0625 18.6925 24.0625 19C24.0625 19.3075 23.8075 19.5625 23.5 19.5625Z"
                          fill={buyStatus ? "#ffffff" : "#696969"}
                        />
                        <path
                          d="M19 24.0625C18.6925 24.0625 18.4375 23.8075 18.4375 23.5V14.5C18.4375 14.1925 18.6925 13.9375 19 13.9375C19.3075 13.9375 19.5625 14.1925 19.5625 14.5V23.5C19.5625 23.8075 19.3075 24.0625 19 24.0625Z"
                          fill={buyStatus ? "#ffffff" : "#696969"}
                        />
                      </svg>
                      <div className="text-sm font-normal text-center text-[#696969] mt-3">
                        Buy
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center mb-8">
                    <div className="bg-[#D9D9D9] flex items-center justify-center rounded-[50px] min-w-[240px]">
                      <div
                        className={
                          isLeft
                            ? "text-sm font-medium px-8 py-2 rounded-[50px] bg-white shadow-lg shadow-gray-300 cursor-pointer"
                            : "text-sm font-medium pl-8 pr-4 py-2 cursor-pointer"
                        }
                        onClick={() => handleClickTabBtn(true)}
                      >
                        Digital Twin
                      </div>
                      <div
                        className={
                          !isLeft
                            ? "text-sm font-medium px-12 py-2 rounded-[50px] bg-white shadow-lg shadow-gray-300 cursor-pointer"
                            : "text-sm font-medium pl-8 pr-12 py-2 rounded-[50px] cursor-pointer"
                        }
                        onClick={() => handleClickTabBtn(false)}
                      >
                        Token
                      </div>
                    </div>
                  </div>
                  <div className="flex md:block justify-center">
                    {isLeft ? (
                      <>
                        {nftCollection.length === 0 ? (
                          <div className="mb-8 rounded-[15px] bg-[#F0E4FE] pt-6 pb-4 min-w-[240px] px-0 md:px-16">
                            <div className="flex flex-wrap items-center justify-around px-6 mb-4">
                              <div className="rounded-full w-[23px] h-[23px] bg-[#5E1DFC]"></div>
                              <div className="rounded-full w-[23px] h-[23px] bg-[#5E1DFC]"></div>
                              <div className="rounded-full w-[23px] h-[23px] bg-[#5E1DFC]"></div>
                              <div className="rounded-full w-[23px] h-[23px] bg-[#5E1DFC]"></div>
                            </div>
                            <div className="text-base font-normal text-[#696969] text-center px-6">
                              No digital collectibles... Yet
                            </div>
                          </div>
                        ) : (
                          <div className="mb-8 flex justify-between flex-wrap rounded-[15px] px-[calc(50%-135px)]">
                            {nftCollection &&
                              nftCollection.length > 0 &&
                              nftCollection.map((collection, index) => (
                                <div
                                  key={index}
                                  className="rounded-[15px] flex items-center justify-between mx-1 my-2 cursor-pointer w-[120px] h-[120px]"
                                  onClick={() => setActiveNFT(collection)}
                                >
                                  <div className="w-full h-full">
                                    <img
                                      src={ipfsUtil(collection.image)}
                                      alt="nft img"
                                      // width={120}
                                      className="rounded-lg w-full h-full"
                                    />
                                  </div>
                                  {/* <div className="text-sm">
                                    <div className="flex items-center justify-between">
                                      <div className="mr-2 font-medium">Name</div>
                                      <div>{collection.name}</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="mr-2 font-medium">
                                        Collection
                                      </div>
                                      <div>
                                        {collection.properties.collectionName}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="mr-2 font-medium">
                                        Brand
                                      </div>
                                      <div>{collection.properties.brand}</div>
                                    </div>
                                  </div> */}
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="mb-8 rounded-[15px] bg-white pt-6 pb-4 min-w-[240px] mx-0 md:mx-14">
                        <div className="px-6 mb-4">
                          <div className="flex flex-wrap items-center justify-between">
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M11.9999 12H10.1255V8.29935H1.87452V12H0V0H1.87452V3.61161H10.1255V0H12L11.9999 12ZM1.96308 6.91488H10.2139V5.00288H1.96308V6.91488Z"
                                  fill="#696969"
                                />
                              </svg>
                              <span className="text-lg font-medium ml-2">
                                HBAR
                              </span>
                            </div>
                            <div>
                              <div className="text-right font-medium">
                                ${getUsdAmount(balance)}
                              </div>
                              <div className="text-right">{balance} HBAR</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-normal text-[#959595] text-center">
                    Secured by Designbook
                  </div>
                </div>
              </div>
            ) : (
              <>
                {!sentModalShow ? (
                  <div className="w-full sm:w-[384px] max-w-[calc(100%-20px)] pt-4 bg-white rounded-[25px] shadow-2xl">
                    <div className="flex items-start justify-end mb-2 px-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none" onClick={() => {
                        setActiveNFT(null);
                        setActiveDetailImg("");
                      }
                      }
                        className="cursor-pointer"
                      >
                        <circle cx="11.5" cy="11.5" r="11.5" fill="#CBCBCB" />
                        <path d="M7.36133 7.35938L15.6413 15.6394" stroke="#1D1E1F" />
                        <path d="M15.6406 7.35938L7.36063 15.6394" stroke="#1D1E1F" />
                      </svg>
                    </div>
                    <div className="px-8">
                      <div className="mb-4">
                        <img className="w-full border-[1px] border-solid border-gray rounded-2xl max-h-[354px]"
                          src={ipfsUtil(activeDetailImg || activeNft?.image)} alt="ipfs img" />
                        <div className="flex items-start mt-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"
                            className="mr-4 mt-1">
                            <circle cx="10" cy="10" r="10" fill="black" />
                          </svg>
                          <div className="text-lg font-bold">{`${activeNft?.name} ${activeNft?.properties.size}
                        ${activeNft?.properties.brand} ${activeNft.properties.category}`}</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <div className="text-base font-bold">{`${activeNft?.properties?.collectionName} - ${activeNft?.token_id}`}</div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none"
                              className="cursor-pointer">
                              <circle cx="7.5" cy="7.5" r="7.5" fill="#5E1DFC" />
                              <path
                                d="M7.48549 11.2852C9.42666 11.2852 11.0003 9.59048 11.0003 7.5C11.0003 5.40952 9.42666 3.71484 7.48549 3.71484C5.54433 3.71484 3.9707 5.40952 3.9707 7.5C3.9707 9.59048 5.54433 11.2852 7.48549 11.2852Z"
                                fill="#5E1DFC" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
                              <path
                                d="M7.48567 11.2852C8.41406 11.2852 9.16666 9.59048 9.16666 7.5C9.16666 5.40952 8.41406 3.71484 7.48567 3.71484C6.55729 3.71484 5.80469 5.40952 5.80469 7.5C5.80469 9.59048 6.55729 11.2852 7.48567 11.2852Z"
                                fill="#5E1DFC" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
                              <path d="M10.7187 6.01855H4.24805" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
                              <path d="M4.24805 8.98047H10.7187" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none"
                              className="ml-3 cursor-pointer">
                              <circle cx="7.5" cy="7.5" r="7.5" fill="#5E1DFC" />
                              <path fillRule="evenodd" clipRule="evenodd"
                                d="M10.9999 10.9148H8.82559L4.09961 4.08594H6.27395L10.9999 10.9148ZM9.08468 10.3357H9.95043L6.01486 4.66503H5.14912L9.08468 10.3357Z"
                                fill="white" />
                              <path fillRule="evenodd" clipRule="evenodd"
                                d="M4.78776 10.9141L7.22084 8.06514L6.90264 7.63867L4.09766 10.9141H4.78776Z" fill="white" />
                              <path fillRule="evenodd" clipRule="evenodd"
                                d="M7.6875 6.72222L7.9932 7.16234L10.6215 4.08594H9.94595L7.6875 6.72222Z" fill="white" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-sm">{`Serial #${activeNft.serial_number}`}</div>
                      </div>
                      <div className="text-base mb-8">
                        {activeNft?.properties?.description}
                      </div>
                      {activeNft.files && activeNft.files.length > 0 && (
                        <div className="mb-8">
                          <div className="font-bold text-base mb-2">Files</div>
                          <div className="rounded-lg border-[1px] border-solid border-black py-2 px-1 mb-4">
                            <div className={activeDetailImg == activeNft?.image
                              ? "flex items-center justify-between bg-[#e1dfdf91] rounded-lg px-1 py-1 cursor-pointer"
                              : "flex items-center justify-between hover:bg-[#e1dfdf91] rounded-lg px-1 py-1 cursor-pointer"} onClick={() =>
                                setActiveDetailImg(activeNft?.image)
                              }
                            >
                              <div className="flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                  <path fill="currentColor"
                                    d="M5 21q-.825 0-1.413-.588T3 19V5q0-.825.588-1.413T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.588 1.413T19 21H5Zm0-2h14V5H5v14Zm1-2h12l-3.75-5l-3 4L9 13l-3 4Zm-1 2V5v14Z" />
                                </svg>
                                <div className="text-base font-normal ml-2">
                                  {`Thumbnail`}
                                </div>
                              </div>
                              <div onClick={(e) => {
                                e.stopPropagation();
                                download(ipfsUtil(activeNft?.image));
                              }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
                                  <path fill="currentColor"
                                    d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z" />
                                  <path fill="currentColor"
                                    d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z" />
                                </svg>
                              </div>
                            </div>
                            {activeNft.files.map((file: any, index: number) => (
                              <div key={index} className={activeDetailImg == file.uri
                                ? "flex items-center justify-between bg-[#e1dfdf91] rounded-lg px-1 py-1 cursor-pointer"
                                : "flex items-center justify-between hover:bg-[#e1dfdf91] rounded-lg px-1 py-1 cursor-pointer"} onClick={() =>
                                  setActiveDetailImg(file.uri)}
                              >
                                <div className="flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path fill="currentColor"
                                      d="M5 21q-.825 0-1.413-.588T3 19V5q0-.825.588-1.413T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.588 1.413T19 21H5Zm0-2h14V5H5v14Zm1-2h12l-3.75-5l-3 4L9 13l-3 4Zm-1 2V5v14Z" />
                                  </svg>
                                  <div className="text-base font-normal ml-2">
                                    {`image ${index + 1}`}
                                  </div>
                                </div>
                                <div onClick={(e) => {
                                  e.stopPropagation();
                                  download(ipfsUtil(file.uri));
                                }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
                                    <path fill="currentColor"
                                      d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z" />
                                    <path fill="currentColor"
                                      d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z" />
                                  </svg>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mb-8">
                        <div className="font-bold text-base mb-2">
                          Collection Info
                        </div>
                        <div className="font-normal text-sm flex items-center justify-between">
                          <div>Name</div>
                          <div>{activeNft?.properties?.collectionName}</div>
                        </div>
                        <hr className="my-2" />
                        <div className="font-normal text-sm flex items-center justify-between">
                          <div>Token ID</div>
                          <div>{activeNft?.token_id}</div>
                        </div>
                      </div>
                      <div className="mb-8">
                        <div className="font-bold text-base mb-2 flex items-center">
                          Trade Fees
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" className="ml-2">
                            <circle cx="7.5" cy="7.5" r="7" stroke="black" />
                            <path
                              d="M8.5 9.46V11H6.93V9.46H8.5ZM5.32 6.16C5.32667 5.8 5.38667 5.47 5.5 5.17C5.62 4.87 5.78333 4.61 5.99 4.39C6.20333 4.17 6.45667 4 6.75 3.88C7.05 3.75333 7.38333 3.69 7.75 3.69C8.22333 3.69 8.61667 3.75667 8.93 3.89C9.25 4.01667 9.50667 4.17667 9.7 4.37C9.89333 4.56333 10.03 4.77333 10.11 5C10.1967 5.22 10.24 5.42667 10.24 5.62C10.24 5.94 10.1967 6.20333 10.11 6.41C10.03 6.61667 9.92667 6.79333 9.8 6.94C9.68 7.08667 9.54333 7.21333 9.39 7.32C9.24333 7.42 9.10333 7.52333 8.97 7.63C8.83667 7.73 8.71667 7.84667 8.61 7.98C8.51 8.11333 8.44667 8.28 8.42 8.48V8.86H7.07V8.41C7.09 8.12333 7.14333 7.88333 7.23 7.69C7.32333 7.49667 7.43 7.33333 7.55 7.2C7.67 7.06 7.79667 6.94 7.93 6.84C8.06333 6.74 8.18667 6.64 8.3 6.54C8.41333 6.44 8.50333 6.33 8.57 6.21C8.64333 6.09 8.67667 5.94 8.67 5.76C8.67 5.45333 8.59333 5.22667 8.44 5.08C8.29333 4.93333 8.08667 4.86 7.82 4.86C7.64 4.86 7.48333 4.89667 7.35 4.97C7.22333 5.03667 7.11667 5.13 7.03 5.25C6.95 5.36333 6.89 5.5 6.85 5.66C6.81 5.81333 6.79 5.98 6.79 6.16H5.32Z"
                              fill="#1D1E1F" />
                          </svg>
                        </div>
                        <div className="font-normal text-sm flex items-center justify-between">
                          No fees!
                        </div>
                      </div>
                      <div className="mb-8">
                        <div className="font-bold text-base mb-2 flex items-center">
                          Properties
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center justify-between mb-3">
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">
                                Collection Name
                              </div>
                              <div className="text-center text-sm">
                                {activeNft?.properties.collectionName}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">
                                Brand
                              </div>
                              <div className="text-center text-sm">
                                {activeNft?.properties.brand}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">
                                Edition
                              </div>
                              <div className="text-center text-sm">
                                {activeNft?.properties.edition}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between mb-3">
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">
                                VrCompliant
                              </div>
                              <div className="text-center text-sm">
                                {activeNft?.properties.vrOrMetaverseCompliant
                                  ? "True"
                                  : "False"}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">
                                NFT Name
                              </div>
                              <div className="text-center text-sm">
                                {activeNft?.properties.nftName}
                              </div>
                            </div>
                          </div>
                          {/* <div className="w-full bg-[#efefef] py-4 px-6 rounded-[5px] mb-3">
                            <div className="text-sm font-bold opacity-70 mb-3">
                              Description
                            </div>
                            <div className="text-sm">
                              {activeNft?.properties.description}
                            </div>
                          </div> */}
                          <div className="flex flex-wrap items-center justify-between mb-3">
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">
                                Price
                              </div>
                              <div className="text-center text-sm">
                                ${activeNft?.properties.price || 0}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">
                                Gender
                              </div>
                              <div className="text-center text-sm">
                                {activeNft?.properties.gender}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">
                                Category
                              </div>
                              <div className="text-center text-sm">
                                {activeNft?.properties.category}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between mb-3">
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">SKU</div>
                              <div className="text-center text-sm">
                                {activeNft?.properties.sku}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">Size</div>
                              <div className="text-center text-sm">
                                {activeNft?.properties.size}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">
                                Country
                              </div>
                              <div className="text-center text-sm">USA</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between mb-3">
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">
                                Color
                              </div>
                              <div className="text-center text-sm">
                                {activeNft?.properties.color}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">
                                Release Date
                              </div>
                              <div className="text-center text-sm">
                                {activeNft?.properties.releaseDate}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-sm font-bold opacity-70">
                                Royalty
                              </div>
                              <div className="text-center text-sm">
                                {activeNft?.properties.royalty}%
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-[#efefef] py-4 px-6 rounded-[5px] mb-3">
                            <div className="text-sm font-bold opacity-70 mb-1">
                              Perks
                            </div>
                            <div className="">
                              {Object.keys(
                                JSON.parse(activeNft?.properties.perks)
                              ).map((key, index) => {
                                return (
                                  <span className="block text-sm" key={index}>
                                    {key} :{" "}
                                    {
                                      JSON.parse(activeNft?.properties.perks)[
                                      key
                                      ]
                                    }
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#F0E4FE] pt-6 px-8">
                      <div className="flex items-center justify-center mb-6">
                        <div
                          className="bg-[#ecebff] text-[#6951ff]  text-white text-base font-medium mr-4 rounded-[25px] px-12 py-2 cursor-pointer"
                          onClick={() => setActiveNFT(null)}
                        >
                          Back
                        </div>
                        <div className="bg-[#6951FF] text-white text-base font-medium rounded-[25px] px-6 py-2 cursor-pointer" onClick={() =>
                          setSendModalShow(true)}
                        >
                          Transfer NFT
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center mb-1">
                        <div className="w-[130px] h-[4px] bg-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full md:w-auto max-w-[calc(100%-20px)] p-6 bg-white rounded-[25px] shadow-2xl">
                    <div className="text-2xl font-bold mb-4">Send NFT</div>
                    <div className="mb-6">
                      <div className="font-medium mb-1">Target Address</div>
                      <input
                        type="text"
                        className="w-full rounded-lg border-[1px] border-solid border-[#D9D9D9] px-2 py-1"
                        placeholder="URL Address"
                        value={targetAddress}
                        onChange={(e) => setTargetAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="pt-4">
                      <div className="flex items-center justify-center mb-6">
                        <div
                          className="cursor-pointer bg-[#ecebff] text-[#6951ff]  text-white text-lg font-medium mr-4 rounded-[25px] px-12 py-2 cursor-pointer"
                          onClick={() => setSendModalShow(false)}
                        >
                          Cancel
                        </div>
                        <div
                          className="cursor-pointer bg-[#6951FF] text-white text-lg font-medium rounded-[25px] px-6 py-2"
                          onClick={() => sendNFTWithMagic()}
                        >
                          Transfer NFT
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center mb-1">
                        <div className="w-[130px] h-[4px] bg-white" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </Loader>
    );
  }
  return (
    <Loader isLoading={loading}>
      <section className="bg-white md:bg-[#F0E4FE] font-[Helvetica]">
        <div className="flex items-start justify-center h-screen pt-8 sm:pt-20">
          <div className="w-full sm:w-[384px]">
            <div className="rounded-[25px] border-0 sm:border-[1px] border-solid border-[#959595] mb-8">
              <div className="text-center text-2xl font-bold mb-4 mt-6">
                With <span className="text-[#7A7BB8] font-bold">HashPack</span>
              </div>
              <div className="flex justify-center mb-8">
                <img src="/images/logo-hashpack.png" alt="magic logo" />
              </div>
            </div>
            <div className="bg-white sm:bg-[#F5F5F5] min-w-[270px] rounded-[25px] min-w-[300px] pt-4 pb-8">
              <div className="flex items-center justify-between px-4 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="23"
                  height="24"
                  viewBox="0 0 23 24"
                  fill="none"
                >
                  <circle cx="11.5" cy="11.5" r="11.5" fill="#CBCBCB" />
                  <mask
                    id="mask0_564_582"
                    style={{ maskType: "alpha" }}
                    maskUnits="userSpaceOnUse"
                    x="2"
                    y="3"
                    width="19"
                    height="21"
                  >
                    <g clipPath="url(#clip0_564_582)">
                      <path
                        d="M13.8725 14.499C13.1567 14.8626 12.3517 15.0675 11.5 15.0675C10.6483 15.0675 9.84332 14.8626 9.12746 14.499C5.02881 15.587 2 19.4281 2 23.9995H21C21 19.4281 17.9712 15.587 13.8725 14.499Z"
                        fill="#7A7AB8"
                      />
                      <path
                        d="M11.499 3C8.52565 3 6.11523 5.48879 6.11523 8.55888C6.11523 10.7496 7.34303 12.6436 9.12649 13.5492C9.84235 13.9128 10.6474 14.1178 11.499 14.1178C12.3507 14.1178 13.1557 13.9128 13.8716 13.5492C15.655 12.6436 16.8828 10.7496 16.8828 8.55888C16.8828 5.48879 14.4724 3 11.499 3Z"
                        fill="#7A7AB8"
                      />
                    </g>
                  </mask>
                  <g mask="url(#mask0_564_582)">
                    <circle cx="11.5" cy="11.5" r="11.5" fill="#1D1E1F" />
                  </g>
                  <defs>
                    <clipPath id="clip0_564_582">
                      <rect
                        width="19"
                        height="21"
                        fill="white"
                        transform="translate(2 3)"
                      />
                    </clipPath>
                  </defs>
                </svg>
                <span className="text-sm font-bold">Hedera</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="23"
                  height="23"
                  viewBox="0 0 23 23"
                  fill="none"
                  onClick={() => {
                    disconnectWallet(
                      provider || WalletServiceProviders.HASHPACK
                    );
                    setLoggedIn(false);
                  }}
                  className="cursor-pointer"
                >
                  <circle cx="11.5" cy="11.5" r="11.5" fill="#CBCBCB" />
                  <path d="M7.36133 7.35938L15.6413 15.6394" stroke="#1D1E1F" />
                  <path d="M15.6406 7.35938L7.36063 15.6394" stroke="#1D1E1F" />
                </svg>
              </div>
              <div className="text-sm font-medium text-center text-[#696969] mb-4">
                {accountId}
              </div>
              <div className="text-4xl font-bold text-center mb-12">
                ${getUsdAmount(balance)}
              </div>
              <div className="flex items-center justify-center gap-x-10 mb-8">
                <div className="flex flex-col items-center justify-center ">
                  {/* <svg xmlns="http://www.w3.org/2000/svg" width="39" height="39" viewBox="0 0 39 39" fill="none" className="cursor-pointer" onClick={() => receiveNFTWithHashpack()}>
                    <circle cx="19.4258" cy="19.4258" r="19.4258" fill={receiveStatus ? "#5E1DFC" : "#D9D9D9"} />
                    <g clip-path="url(#clip0_570_873)">
                      <path d="M19.7875 22.1872H18.3775C17.38 22.1872 16.5625 21.3472 16.5625 20.3122C16.5625 20.0047 16.8175 19.7497 17.125 19.7497C17.4325 19.7497 17.6875 20.0047 17.6875 20.3122C17.6875 20.7247 17.995 21.0622 18.3775 21.0622H19.7875C20.08 21.0622 20.3125 20.7997 20.3125 20.4772C20.3125 20.0722 20.2 20.0122 19.945 19.9222L17.6875 19.1347C17.2075 18.9697 16.5625 18.6172 16.5625 17.5147C16.5625 16.5772 17.305 15.8047 18.2125 15.8047H19.6225C20.62 15.8047 21.4375 16.6447 21.4375 17.6797C21.4375 17.9872 21.1825 18.2422 20.875 18.2422C20.5675 18.2422 20.3125 17.9872 20.3125 17.6797C20.3125 17.2672 20.005 16.9297 19.6225 16.9297H18.2125C17.92 16.9297 17.6875 17.1922 17.6875 17.5147C17.6875 17.9197 17.8 17.9797 18.055 18.0697L20.3125 18.8572C20.7925 19.0222 21.4375 19.3747 21.4375 20.4772C21.4375 21.4222 20.695 22.1872 19.7875 22.1872Z" stroke={receiveStatus ? "#ffffff" : "#696969"} />
                      <path d="M19 22.9375C18.6925 22.9375 18.4375 22.6825 18.4375 22.375V15.625C18.4375 15.3175 18.6925 15.0625 19 15.0625C19.3075 15.0625 19.5625 15.3175 19.5625 15.625V22.375C19.5625 22.6825 19.3075 22.9375 19 22.9375Z" stroke={receiveStatus ? "#ffffff" : "#696969"} />
                      <path d="M19 27.0625C14.5525 27.0625 10.9375 23.4475 10.9375 19C10.9375 14.5525 14.5525 10.9375 19 10.9375C19.3075 10.9375 19.5625 11.1925 19.5625 11.5C19.5625 11.8075 19.3075 12.0625 19 12.0625C15.175 12.0625 12.0625 15.175 12.0625 19C12.0625 22.825 15.175 25.9375 19 25.9375C22.825 25.9375 25.9375 22.825 25.9375 19C25.9375 18.6925 26.1925 18.4375 26.5 18.4375C26.8075 18.4375 27.0625 18.6925 27.0625 19C27.0625 23.4475 23.4475 27.0625 19 27.0625Z" stroke={receiveStatus ? "#ffffff" : "#696969"} />
                      <path d="M25.75 15.8125H22.75C22.4425 15.8125 22.1875 15.5575 22.1875 15.25V12.25C22.1875 11.9425 22.4425 11.6875 22.75 11.6875C23.0575 11.6875 23.3125 11.9425 23.3125 12.25V14.6875H25.75C26.0575 14.6875 26.3125 14.9425 26.3125 15.25C26.3125 15.5575 26.0575 15.8125 25.75 15.8125Z" stroke={receiveStatus ? "#ffffff" : "#696969"} />
                      <path d="M22.7501 15.8126C22.6076 15.8126 22.4651 15.7601 22.3526 15.6476C22.1351 15.4301 22.1351 15.0701 22.3526 14.8526L26.1026 11.1026C26.3201 10.8851 26.6801 10.8851 26.8976 11.1026C27.1151 11.3201 27.1151 11.6801 26.8976 11.8976L23.1476 15.6476C23.0351 15.7601 22.8926 15.8126 22.7501 15.8126Z" stroke={receiveStatus ? "#ffffff" : "#696969"} />
                    </g>
                    <defs>
                      <clipPath id="clip0_570_873">
                        <rect width="18" height="18" fill="white" transform="translate(10 10)" />
                      </clipPath>
                    </defs>
                  </svg> */}
                  <img
                    src={receiveStatus ? "/images/receive-enable.png" : "/images/receive-disable.png"}
                    alt="receive"
                    className="cursor-pointer"
                    onClick={() => receiveNFTWithHashpack()}
                  />
                  <div className={`text-sm fonnormalum text-left text-[${receiveStatus ? "#5E1DFC" : "#696969"}] mt-3`}>
                    Receive
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center ">
                  {/* <svg xmlns="http://www.w3.org/2000/svg" width="39" height="39" viewBox="0 0 39 39" fill="none" className="cursor-pointer" onClick={() => returnNFTWithHashpack()}>
                    <circle cx="19.4258" cy="19.4258" r="19.4258" fill={returnStatus ? "#5E1DFC" : "#D9D9D9"} />
                    <path d="M19.85 22.2497H18.44C17.4425 22.2497 16.625 21.4097 16.625 20.3747C16.625 20.0672 16.88 19.8122 17.1875 19.8122C17.495 19.8122 17.75 20.0672 17.75 20.3747C17.75 20.7872 18.0575 21.1247 18.44 21.1247H19.85C20.1425 21.1247 20.375 20.8622 20.375 20.5397C20.375 20.1347 20.2625 20.0747 20.0075 19.9847L17.75 19.1972C17.27 19.0322 16.625 18.6797 16.625 17.5772C16.625 16.6397 17.3675 15.8672 18.275 15.8672H19.685C20.6825 15.8672 21.5 16.7072 21.5 17.7422C21.5 18.0497 21.245 18.3047 20.9375 18.3047C20.63 18.3047 20.375 18.0497 20.375 17.7422C20.375 17.3297 20.0675 16.9922 19.685 16.9922H18.275C17.9825 16.9922 17.75 17.2547 17.75 17.5772C17.75 17.9822 17.8625 18.0422 18.1175 18.1322L20.375 18.9197C20.855 19.0847 21.5 19.4372 21.5 20.5397C21.5 21.4847 20.7575 22.2497 19.85 22.2497Z" stroke={returnStatus ? "#ffffff" : "#696969"} />
                    <path d="M19.0625 23C18.755 23 18.5 22.745 18.5 22.4375V15.6875C18.5 15.38 18.755 15.125 19.0625 15.125C19.37 15.125 19.625 15.38 19.625 15.6875V22.4375C19.625 22.745 19.37 23 19.0625 23Z" stroke={returnStatus ? "#ffffff" : "#696969"} />
                    <path d="M19.0625 27.125C14.615 27.125 11 23.51 11 19.0625C11 14.615 14.615 11 19.0625 11C19.37 11 19.625 11.255 19.625 11.5625C19.625 11.87 19.37 12.125 19.0625 12.125C15.2375 12.125 12.125 15.2375 12.125 19.0625C12.125 22.8875 15.2375 26 19.0625 26C22.8875 26 26 22.8875 26 19.0625C26 18.755 26.255 18.5 26.5625 18.5C26.87 18.5 27.125 18.755 27.125 19.0625C27.125 23.51 23.51 27.125 19.0625 27.125Z" stroke={returnStatus ? "#ffffff" : "#696969"} />
                    <path d="M23.5605 11.002L26.5605 11.002C26.868 11.002 27.123 11.257 27.123 11.5645L27.123 14.5645C27.123 14.872 26.868 15.127 26.5605 15.127C26.253 15.127 25.998 14.872 25.998 14.5645L25.998 12.127L23.5605 12.127C23.253 12.127 22.998 11.872 22.998 11.5645C22.998 11.257 23.253 11.002 23.5605 11.002Z" stroke={returnStatus ? "#ffffff" : "#696969"} />
                    <path d="M26.5605 11.0019C26.703 11.0019 26.8455 11.0544 26.958 11.1669C27.1755 11.3844 27.1755 11.7444 26.958 11.9619L23.208 15.7119C22.9905 15.9294 22.6305 15.9294 22.413 15.7119C22.1955 15.4944 22.1955 15.1344 22.413 14.9169L26.163 11.1669C26.2755 11.0544 26.418 11.0019 26.5605 11.0019Z" stroke={returnStatus ? "#ffffff" : "#696969"} />
                  </svg> */}
                  <img
                    src={returnStatus ? "/images/return-enable.png" : "/images/return-disable.png"}
                    alt="receive"
                    className="cursor-pointer"
                    onClick={() => returnNFTWithHashpack()}
                  />
                  <div className={`text-sm fonnormalum text-left text-[${returnStatus ? "#5E1DFC" : "#696969"}] mt-3`}>
                    Return
                  </div>
                </div>
              </div>
              <div className="text-sm font-normal text-[#959595] text-center">
                Secured by Designbook
              </div>
            </div>
          </div>
        </div>
      </section>
    </Loader>
  );
}

export default Wallet;
