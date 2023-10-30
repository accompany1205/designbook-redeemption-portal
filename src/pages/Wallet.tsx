import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
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
          toast.info("You already redeemed this NFT.");
          return;
        } else if (nftClaimStatus === "returned") {
          toast.info("You already returned this NFT.");
          return;
        }
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
            is_sent_transaction_fee
          } = res.data;
          console.log({res});
          if (redemption_status === "redeemed") {
            toast.info("This NFT was already redeemed!");
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
            () => {}
          );
          const treasuryId = AccountId.fromString(hedera_id);
          const treasuryKey = PrivateKey.fromString(hedera_private_key);
          client.setOperator(treasuryId, treasuryKey);
          if(!is_sent_transaction_fee){
            const sendHbar = await new TransferTransaction()
              .addHbarTransfer(treasuryId, Hbar.fromTinybars(-150000000))
              .addHbarTransfer(publicAddress, Hbar.fromTinybars(150000000))
              .execute(client);
            const transactionReceipt = await sendHbar.getReceipt(client);
            console.log(
              "The HBAR transfer transaction from brand account to the new account was: " +
                transactionReceipt.status.toString()
            );
            const res = await axios.post(
              `${process.env.REACT_APP_BACKEND_URL}nftdata/update`,
              { id }
            );
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
            toast.success("Successfully claimed NFT!");
            setNftClaimStatus("redeemed");
            setTimeout(() => {
              getNft(publicAddress);
            }, 2000);
          } else {
            toast.error("Failed to receive NFT.");
          }
          getBalance(publicAddress);
        }
        setLoading(false);
      } else {
        toast.error("No redemption token in the url!");
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
      getBalance(publicAddress);
      toast.error("Failed to receive NFT.");
    }
    console.log("handleClickSend", token);
  };
  const returnNFTWithMagic = async () => {
    try {
      if (token) {
        if (nftClaimStatus === "redeemed") {
          toast.info("You already redeemed this NFT.");
          return;
        } else if (nftClaimStatus === "returned") {
          toast.info("You already returned this NFT.");
          return;
        }
        setLoading(true);
        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}nftdata`,
          { redemptionUrl: token }
        );
        if (res && res.status === 200 && res.data) {
          //check if already returned or not
          const {
            serial_number,
            hedera_token_id,
            hedera_id,
            hedera_private_key,
            // redemption_status,
          } = res.data;
          // console.log({res});
          // if (redemption_status === "redeemed") {
          //   toast.info("This NFT was already redeemed!");
          //   return;
          // }
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
            () => {}
          );
          const treasuryId = AccountId.fromString(hedera_id);
          const treasuryKey = PrivateKey.fromString(hedera_private_key);
          client.setOperator(treasuryId, treasuryKey);
          const sendHbar = await new TransferTransaction()
            .addHbarTransfer(treasuryId, Hbar.fromTinybars(-150000000))
            .addHbarTransfer(publicAddress, Hbar.fromTinybars(150000000))
            .execute(client);
          const transactionReceipt = await sendHbar.getReceipt(client);
          console.log(
            "The HBAR transfer transaction from brand account to the new account was: " +
              transactionReceipt.status.toString()
          );

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
            toast.success("Successfully returned NFT!");
            setNftClaimStatus("returned");
            setTimeout(() => {
              getNft(publicAddress);
            }, 1000);
          } else {
            toast.error("Failed to return NFT.");
          }
          getBalance(publicAddress);
        }
        setLoading(false);
      } else {
        toast.error("No redemption token in the url!");
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
      toast.error("Failed to return NFT.");
      getNft(publicAddress);
    }
  };
  const sendNFTWithMagic = async () => {
    console.log("sendModalShow");
    if (!validateHederaAddress(targetAddress)) {
      toast.error("Invalid Hedera Address");
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
        () => {}
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
        toast.success("Successfully sent NFT!");
        setTimeout(() => {
          getNft(publicAddress);
        }, 1000);
      } else {
        toast.error("Failed to send NFT.");
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toast.error("Failed to send NFT.");
      console.log(e);
    }

    setSendModalShow(false);
  };

  const receiveNFTWithHashpack = async () => {
    if (token) {
      if (nftClaimStatus === "redeemed") {
        toast.info("You already redeemed this NFT.");
        return;
      } else if (nftClaimStatus === "returned") {
        toast.info("You already returned this NFT.");
        return;
      }
      const res = await claimNft(token);
      console.log("NFT claim result with hashpack = ", res);
      if (res) {
        setNftClaimStatus("redeemed");
      }
      setTimeout(() => {
        getBalance(accountId?.toString() || "");
      }, 1000);
    }
  };
  const returnNFTWithHashpack = async () => {
    if (token) {
      if (nftClaimStatus === "returned") {
        toast.info("You already returned this NFT.");
        return;
      }
      const res = await returnNft(token);
      console.log("NFT return result with hashpack = ", res);
      if (res) {
        setNftClaimStatus("returned");
      }
      setTimeout(() => {
        getBalance(accountId?.toString() || "");
      }, 1000);
    }
  };

  if (authMagic) {
    return (
      <Loader isLoading={loading}>
        <section className="bg-white md:bg-[#F0E4FE]">
          <div className="flex flex-wrap items-center justify-center min-h-screen">
            {!activeNft ? (
              <div className="w-full md:w-auto">
                <div className="rounded-[25px] border-0 md:border-[1px] border-solid border-[#959595] mb-8">
                  <div className="text-center text-2xl font-bold mb-4 mt-6">
                    With{" "}
                    <span className="text-[#5E1DFC] font-bold">Magic Wallet</span>
                  </div>
                  <div className="flex justify-center mb-8">
                    <img src="/images/magicLogo.png" alt="magic logo" />
                  </div>
                </div>
                <div className="bg-white md:bg-[#F5F5F5] rounded-[25px] minW-[300px] pt-4 pb-8">
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
                    <div className="mr-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="cursor-pointer"
                        width="39"
                        height="39"
                        viewBox="0 0 39 39"
                        fill="none"
                        onClick={() => receiveNFTWithMagic()}
                      >
                        <circle
                          cx="19.4258"
                          cy="19.4258"
                          r="19.4258"
                          fill="#D9D9D9"
                        />
                        <path
                          d="M17.4715 12.3975H13.1289V16.74H17.4715V12.3975Z"
                          stroke="#696969"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M25.8621 12.3975H21.5195V16.74H25.8621V12.3975Z"
                          stroke="#696969"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M17.4715 20.7861H13.1289V25.1287H17.4715V20.7861Z"
                          stroke="#696969"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21.5195 22.2263V20.7861H22.9597"
                          stroke="#696969"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M24.1863 25.1289H22.3945"
                          stroke="#696969"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M24.2891 20.7861H25.8604V25.1287"
                          stroke="#696969"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14.8905 9.53027H10.2617V14.1591"
                          stroke="#696969"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M28.7245 14.1591V9.53027H24.0957"
                          stroke="#696969"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M24.0977 27.995H28.7265V23.3662"
                          stroke="#696969"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10.2617 23.3662V27.995H14.8905"
                          stroke="#696969"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="text-sm fonnormalum text-left text-[#696969] mt-3">
                        Receive
                      </div>
                    </div>
                    <div className="mr-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="39"
                        height="39"
                        viewBox="0 0 39 39"
                        fill="none"
                        className="cursor-pointer"
                        onClick={() => returnNFTWithMagic()}
                      >
                        <circle
                          cx="19.4258"
                          cy="19.4258"
                          r="19.4258"
                          fill="#D9D9D9"
                        />
                        <path
                          d="M29.1645 14.3092C29.008 14.0721 28.7261 13.9559 28.4523 14.0154L10.8428 17.8418C10.5594 17.9034 10.3444 18.14 10.3052 18.4331C10.266 18.7263 10.4111 19.0131 10.6679 19.15L14.5206 21.2039L14.5418 26.3524C14.5429 26.6265 14.7003 26.8749 14.9447 26.9882C15.0356 27.0303 15.1323 27.0509 15.2284 27.0509C15.3907 27.0509 15.5512 26.9923 15.6785 26.8794L19.2384 23.7261L21.8244 25.0977C22.1341 25.2619 22.5151 25.1629 22.7103 24.8674L29.1645 15.0939C29.3212 14.8568 29.3212 14.5463 29.1645 14.3092Z"
                          stroke="#696969"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M14.4512 21.1187L28.6886 14" stroke="#696969" />
                        <path
                          d="M28.6894 14.2959L16.8249 22.3044L15.3418 27.0502"
                          stroke="#696969"
                        />
                      </svg>
                      <div className="text-sm font-normal text-center text-[#696969] mt-3">
                        Return
                      </div>
                    </div>
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="39"
                        height="39"
                        viewBox="0 0 39 39"
                        fill="none"
                        className="cursor-pointer"
                      >
                        <circle
                          cx="19.4258"
                          cy="19.4258"
                          r="19.4258"
                          fill="#D9D9D9"
                        />
                        <path
                          d="M29.1645 14.3092C29.008 14.0721 28.7261 13.9559 28.4523 14.0154L10.8428 17.8418C10.5594 17.9034 10.3444 18.14 10.3052 18.4331C10.266 18.7263 10.4111 19.0131 10.6679 19.15L14.5206 21.2039L14.5418 26.3524C14.5429 26.6265 14.7003 26.8749 14.9447 26.9882C15.0356 27.0303 15.1323 27.0509 15.2284 27.0509C15.3907 27.0509 15.5512 26.9923 15.6785 26.8794L19.2384 23.7261L21.8244 25.0977C22.1341 25.2619 22.5151 25.1629 22.7103 24.8674L29.1645 15.0939C29.3212 14.8568 29.3212 14.5463 29.1645 14.3092Z"
                          stroke="#696969"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M14.4512 21.1187L28.6886 14" stroke="#696969" />
                        <path
                          d="M28.6894 14.2959L16.8249 22.3044L15.3418 27.0502"
                          stroke="#696969"
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
                            : "text-sm font-medium pl-6 pr-10 py-2 rounded-[50px] cursor-pointer"
                        }
                        onClick={() => handleClickTabBtn(false)}
                      >
                        Token
                      </div>
                    </div>
                  </div>
                  <div className="flex md:block justify-center px-0 md:px-16">
                    {isLeft ? (
                      <>
                        {nftCollection.length === 0 ? (
                          <div className="mb-8 rounded-[15px] bg-[#F0E4FE] pt-6 pb-4 min-w-[240px]">
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
                          <div className="mb-8 grid grid-cols-2 gap-4 bg-[#F0E4FE] rounded-[15px]">
                            {nftCollection &&
                              nftCollection.length > 0 &&
                              nftCollection.map((collection, index) => (
                                <div
                                  key={index}
                                  className="rounded-[15px] flex items-center justify-between m-3 cursor-pointer"
                                  onClick={() => setActiveNFT(collection)}
                                >
                                  <div className="">
                                    <img
                                      src={ipfsUtil(collection.image)}
                                      alt="nft img"
                                      width={100}
                                      className="rounded-lg"
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
                      <div className="mb-8 rounded-[15px] bg-white pt-6 pb-4 min-w-[240px]">
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
                  <div className="w-full md:w-auto max-w-[calc(100%-20px)] pt-4 bg-white rounded-[25px] shadow-2xl">
                    <div className="flex items-center justify-end mb-2 px-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="23"
                        height="23"
                        viewBox="0 0 23 23"
                        fill="none"
                        onClick={() => setActiveNFT(null)}
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
                    <div className="px-8">
                      <div className="mb-4">
                        <img
                          className="w-full border-[1px] border-solid border-gray rounded-2xl"
                          src={ipfsUtil(activeNft?.image)}
                          alt="ipfs img"
                        />
                        <div className="flex items-start mt-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            className="mr-4 mt-1"
                          >
                            <circle cx="10" cy="10" r="10" fill="black" />
                          </svg>
                          <div className="text-xl font-bold">{`${activeNft?.name} ${activeNft?.properties.size} ${activeNft?.properties.brand} ${activeNft.properties.category}`}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {activeNft.files &&
                          activeNft.files.length > 0 &&
                          activeNft.files.map((file: any, index: number) => (
                            <div key={index} className="flex align-center">
                              <img src={ipfsUtil(file.uri)} alt="sub img" />
                            </div>
                          ))}
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xl font-medium">{`${activeNft?.properties?.collectionName} - ${activeNft?.token_id}`}</div>
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              className="cursor-pointer"
                            >
                              <circle cx="7.5" cy="7.5" r="7.5" fill="#5E1DFC" />
                              <path
                                d="M7.48549 11.2852C9.42666 11.2852 11.0003 9.59048 11.0003 7.5C11.0003 5.40952 9.42666 3.71484 7.48549 3.71484C5.54433 3.71484 3.9707 5.40952 3.9707 7.5C3.9707 9.59048 5.54433 11.2852 7.48549 11.2852Z"
                                fill="#5E1DFC"
                                stroke="white"
                                strokeWidth="0.5"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M7.48567 11.2852C8.41406 11.2852 9.16666 9.59048 9.16666 7.5C9.16666 5.40952 8.41406 3.71484 7.48567 3.71484C6.55729 3.71484 5.80469 5.40952 5.80469 7.5C5.80469 9.59048 6.55729 11.2852 7.48567 11.2852Z"
                                fill="#5E1DFC"
                                stroke="white"
                                strokeWidth="0.5"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10.7187 6.01855H4.24805"
                                stroke="white"
                                strokeWidth="0.5"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M4.24805 8.98047H10.7187"
                                stroke="white"
                                strokeWidth="0.5"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              className="ml-3 cursor-pointer"
                            >
                              <circle cx="7.5" cy="7.5" r="7.5" fill="#5E1DFC" />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M10.9999 10.9148H8.82559L4.09961 4.08594H6.27395L10.9999 10.9148ZM9.08468 10.3357H9.95043L6.01486 4.66503H5.14912L9.08468 10.3357Z"
                                fill="white"
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M4.78776 10.9141L7.22084 8.06514L6.90264 7.63867L4.09766 10.9141H4.78776Z"
                                fill="white"
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M7.6875 6.72222L7.9932 7.16234L10.6215 4.08594H9.94595L7.6875 6.72222Z"
                                fill="white"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>{`Serial #${activeNft.serial_number}`}</div>
                      </div>
                      <div className="text-lg mb-6">
                        {activeNft?.properties?.description}
                      </div>
                      <div className="mb-8">
                        <div className="font-medium text-xl mb-6">
                          Collection Info
                        </div>
                        <div className="font-normal text-xl flex items-center justify-between">
                          <div>Name</div>
                          <div>{activeNft?.properties?.collectionName}</div>
                        </div>
                        <hr className="my-4" />
                        <div className="font-normal text-xl flex items-center justify-between">
                          <div>Token ID</div>
                          <div>{activeNft?.token_id}</div>
                        </div>
                      </div>
                      <div className="mb-8">
                        <div className="font-medium text-xl mb-6 flex items-center">
                          Trade Fees
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            className="ml-2"
                          >
                            <circle cx="7.5" cy="7.5" r="7" stroke="black" />
                            <path
                              d="M8.5 9.46V11H6.93V9.46H8.5ZM5.32 6.16C5.32667 5.8 5.38667 5.47 5.5 5.17C5.62 4.87 5.78333 4.61 5.99 4.39C6.20333 4.17 6.45667 4 6.75 3.88C7.05 3.75333 7.38333 3.69 7.75 3.69C8.22333 3.69 8.61667 3.75667 8.93 3.89C9.25 4.01667 9.50667 4.17667 9.7 4.37C9.89333 4.56333 10.03 4.77333 10.11 5C10.1967 5.22 10.24 5.42667 10.24 5.62C10.24 5.94 10.1967 6.20333 10.11 6.41C10.03 6.61667 9.92667 6.79333 9.8 6.94C9.68 7.08667 9.54333 7.21333 9.39 7.32C9.24333 7.42 9.10333 7.52333 8.97 7.63C8.83667 7.73 8.71667 7.84667 8.61 7.98C8.51 8.11333 8.44667 8.28 8.42 8.48V8.86H7.07V8.41C7.09 8.12333 7.14333 7.88333 7.23 7.69C7.32333 7.49667 7.43 7.33333 7.55 7.2C7.67 7.06 7.79667 6.94 7.93 6.84C8.06333 6.74 8.18667 6.64 8.3 6.54C8.41333 6.44 8.50333 6.33 8.57 6.21C8.64333 6.09 8.67667 5.94 8.67 5.76C8.67 5.45333 8.59333 5.22667 8.44 5.08C8.29333 4.93333 8.08667 4.86 7.82 4.86C7.64 4.86 7.48333 4.89667 7.35 4.97C7.22333 5.03667 7.11667 5.13 7.03 5.25C6.95 5.36333 6.89 5.5 6.85 5.66C6.81 5.81333 6.79 5.98 6.79 6.16H5.32Z"
                              fill="#1D1E1F"
                            />
                          </svg>
                        </div>
                        <div className="font-normal text-xl flex items-center justify-between">
                          No fees!
                        </div>
                      </div>
                      <div className="mb-8">
                        <div className="font-medium text-xl mb-6 flex items-center">
                          Properties
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center justify-between mb-3">
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">
                                Collection Name
                              </div>
                              <div className="text-center">
                                {activeNft?.properties.collectionName}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">Brand</div>
                              <div className="text-center">
                                {activeNft?.properties.brand}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">
                                Edition
                              </div>
                              <div className="text-center">
                                {activeNft?.properties.edition}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between mb-3">
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">
                                vrOrMetaverseCompliant
                              </div>
                              <div className="text-center">
                                {activeNft?.properties.vrOrMetaverseCompliant
                                  ? "True"
                                  : "False"}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">
                                NFT Name
                              </div>
                              <div className="text-center">
                                {activeNft?.properties.nftName}
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-[#efefef] py-4 px-6 rounded-[5px] mb-3">
                            <div className="text-large font-medium mb-3">
                              Description
                            </div>
                            <div className="">
                              {activeNft?.properties.description}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between mb-3">
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">Price</div>
                              <div className="text-center">
                                ${activeNft?.properties.price || 0}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">Gender</div>
                              <div className="text-center">
                                {activeNft?.properties.gender}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">
                                Category
                              </div>
                              <div className="text-center">
                                {activeNft?.properties.category}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between mb-3">
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">SKU</div>
                              <div className="text-center">
                                {activeNft?.properties.sku}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">Size</div>
                              <div className="text-center">
                                {activeNft?.properties.size}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">
                                Country
                              </div>
                              <div className="text-center">USA</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between mb-3">
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">Color</div>
                              <div className="text-center">
                                {activeNft?.properties.color}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">
                                Release Date
                              </div>
                              <div className="text-center">
                                {activeNft?.properties.releaseDate}
                              </div>
                            </div>
                            <div className="inline-block bg-[#efefef] p-3 rounded-[5px]">
                              <div className="text-large font-medium">
                                Royalty
                              </div>
                              <div className="text-center">
                                {activeNft?.properties.royalty}%
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-[#efefef] py-4 px-6 rounded-[5px] mb-3">
                            <div className="text-large font-medium mb-3">
                              Perks
                            </div>
                            <div className="">
                              {Object.keys(
                                JSON.parse(activeNft?.properties.perks)
                              ).map((key, index) => {
                                return (
                                  <span className="block" key={index}>
                                    {key} :{" "}
                                    {JSON.parse(activeNft?.properties.perks)[key]}
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
                          className="bg-[#ecebff] text-[#6951ff]  text-white text-lg font-medium mr-4 rounded-[25px] px-12 py-2 cursor-pointer"
                          onClick={() => setActiveNFT(null)}
                        >
                          Back
                        </div>
                        <div
                          className="bg-[#6951FF] text-white text-lg font-medium rounded-[25px] px-6 py-2 cursor-pointer"
                          onClick={() => setSendModalShow(true)}
                        >
                          Send NFT
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
                          Send NFT
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
      <section className="bg-white md:bg-[#F0E4FE]">
        <div className="flex items-center justify-center h-screen">
          <div className="w-full md:w-auto">
            <div className="rounded-[25px] border-0 md:border-[1px] border-solid border-[#959595] mb-8">
              <div className="text-center text-2xl font-bold mb-4 mt-6">
                With <span className="text-[#7A7BB8] font-bold">Hashpack</span>
              </div>
              <div className="flex justify-center mb-8">
                <img src="/images/magicLogo.png" alt="magic logo" />
              </div>
            </div>
            <div className="bg-white md:bg-[#F5F5F5] min-w-[270px] rounded-[25px] minW-[300px] pt-4 pb-8">
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
                    disconnectWallet(provider || WalletServiceProviders.HASHPACK);
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
              <div className="flex items-center justify-center mb-8">
                <div className="mr-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="cursor-pointer"
                    width="39"
                    height="39"
                    viewBox="0 0 39 39"
                    fill="none"
                    onClick={() => receiveNFTWithHashpack()}
                  >
                    <circle
                      cx="19.4258"
                      cy="19.4258"
                      r="19.4258"
                      fill="#D9D9D9"
                    />
                    <path
                      d="M17.4715 12.3975H13.1289V16.74H17.4715V12.3975Z"
                      stroke="#696969"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M25.8621 12.3975H21.5195V16.74H25.8621V12.3975Z"
                      stroke="#696969"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17.4715 20.7861H13.1289V25.1287H17.4715V20.7861Z"
                      stroke="#696969"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21.5195 22.2263V20.7861H22.9597"
                      stroke="#696969"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M24.1863 25.1289H22.3945"
                      stroke="#696969"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M24.2891 20.7861H25.8604V25.1287"
                      stroke="#696969"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.8905 9.53027H10.2617V14.1591"
                      stroke="#696969"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M28.7245 14.1591V9.53027H24.0957"
                      stroke="#696969"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M24.0977 27.995H28.7265V23.3662"
                      stroke="#696969"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.2617 23.3662V27.995H14.8905"
                      stroke="#696969"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-sm fonnormalum text-left text-[#696969] mt-3">
                    Receive
                  </div>
                </div>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="39"
                    height="39"
                    viewBox="0 0 39 39"
                    fill="none"
                    className="cursor-pointer"
                    onClick={() => returnNFTWithHashpack()}
                  >
                    <circle
                      cx="19.4258"
                      cy="19.4258"
                      r="19.4258"
                      fill="#D9D9D9"
                    />
                    <path
                      d="M29.1645 14.3092C29.008 14.0721 28.7261 13.9559 28.4523 14.0154L10.8428 17.8418C10.5594 17.9034 10.3444 18.14 10.3052 18.4331C10.266 18.7263 10.4111 19.0131 10.6679 19.15L14.5206 21.2039L14.5418 26.3524C14.5429 26.6265 14.7003 26.8749 14.9447 26.9882C15.0356 27.0303 15.1323 27.0509 15.2284 27.0509C15.3907 27.0509 15.5512 26.9923 15.6785 26.8794L19.2384 23.7261L21.8244 25.0977C22.1341 25.2619 22.5151 25.1629 22.7103 24.8674L29.1645 15.0939C29.3212 14.8568 29.3212 14.5463 29.1645 14.3092Z"
                      stroke="#696969"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M14.4512 21.1187L28.6886 14" stroke="#696969" />
                    <path
                      d="M28.6894 14.2959L16.8249 22.3044L15.3418 27.0502"
                      stroke="#696969"
                    />
                  </svg>
                  <div className="text-sm font-normal text-center text-[#696969] mt-3">
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
