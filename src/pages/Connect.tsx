// https://gigaland.io/Connect-2.html

import React, { useState, useContext, useEffect } from "react";
import {
  useLinkClickHandler,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../contexts/AuthContext";
import WalletContext, { WalletServiceProviders } from "../lib/WalletService/WalletContext";
// import AuthContext from "../auth/WalletContext";
import GlowButton from "../components/buttons/GlowButton";
import TextInput from "../components/inputs/TextInput";
import { validateEmail } from "../helpers/form-validators";
import { MagicClient } from "../contexts/AuthContext";
import Loader from "../components/Loader";

function Connect() {
  const {
    isLoggedIn,
    setLoggedIn,
    publicAddress,
    setPublicAddress,
    setUserMetadata,
    setToken,
    authMagic,
    setAuthMagic,
  } = useContext(AuthContext);

  const { provider, connectWallet } = useContext(WalletContext);

  const state = useLocation().state;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("claim");
  // const [isValid, setValid ] = useState(true);

  useEffect(() => {
    if (!token) {
      // toast.error("No redemption token!");
      return;
    } else {
      setToken(token);
    }
  }, []);

  useEffect(() => {}, [isLoggedIn]);

  useEffect(() => {
    if (provider) {
      setAuthMagic(false);
      setLoggedIn(true);
      navigate("/wallet");
    }
  }, [provider]);
  const handleSubmit = async () => {
    try {
      if (validateEmail(email)) {
        setEmail("");
        toast.error(validateEmail(email));
        return;
      }
      setLoading(true);
      const res = await MagicClient.auth.loginWithEmailOTP({ email });
      if (res) {
        // setLoggedIn(true);
        MagicClient.user.isLoggedIn().then(async (magicIsLoggedIn) => {
          if (magicIsLoggedIn) {
            const publicAddress = (await MagicClient.user.getMetadata())
              .publicAddress;
            setLoggedIn(magicIsLoggedIn);
            setAuthMagic(true);
            setPublicAddress(publicAddress);
            setUserMetadata(await MagicClient.user.getMetadata());
            setLoading(false);
            navigate("/wallet");
          } else {
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const handleClickHashPack = () => {
    console.log("handleClickHashPack", provider);
    if (!provider) connectWallet(WalletServiceProviders.HASHPACK);
  };

  return (
    <Loader isLoading={loading}>
      <section className="bg-white md:bg-[#F0E4FE]">
        <div className="flex items-center justify-center h-screen">
          <div className="rounded-[25px] bg-white py-12 w-full md:w-[384px] max-w-[calc(100%-20px)]">
            <div className="text-center text-2xl font-medium mb-4">
              Log in <span className="text-[#5E1DFC] font-bold">to wallet</span>
            </div>
            <div className="text-center text-md font-normal mb-4">
              Sign in to{" "}
              <span className="text-[#5E1DFC] font-medium"> Magic</span>
            </div>
            <div className="flex justify-center mb-8">
              <img src="/images/magicLogo.png" alt="magic logo" />
            </div>
            <div className="flex justify-center mb-4 px-4 md:px-12">
              <input
                type="email"
                className="rounded-[15px] border-[1px] border-solid border-[#C8C7C7] text-center py-3 px-4 w-4/5"
                placeholder="Email Address"
                defaultValue={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-center px-4 md:px-12">
              <button
                onClick={() => handleSubmit()}
                className="rounded-[50px] border-[1px] border-solid border-[#C8C7C7] text-center py-3 px-4 w-4/5 text-white bg-[#6951FF] font-medium cursor-pointer"
              >
                {" "}
                Login / Sign up
              </button>
            </div>
            <div className="flex justify-center mt-4 text-[#696969] font-normal text-sm">
              OR
            </div>
            <div className="flex justify-center mt-4 px-4 md:px-12">
              <div
                className="flex justify-center items-center rounded-[50px] border-[1px] border-solid border-[#C8C7C7] text-center py-3 w-4/5 text-[#696969] font-medium cursor-pointer"
                onClick={() => handleClickHashPack()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="21"
                  height="26"
                  viewBox="0 0 21 26"
                  fill="none"
                  className="mr-2"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20.8996 4.01471C20.8996 9.71623 16.2434 14.3382 10.4996 14.3382C4.75585 14.3382 0.0996094 9.71623 0.0996094 4.01471C0.0996094 1.79745 1.91037 0 4.14405 0C6.37774 0 8.1885 1.79745 8.1885 4.01471V11.7116C9.68726 12.1544 11.312 12.1544 12.8107 11.7116V4.01471C12.8107 1.79745 14.6215 0 16.8552 0C19.0889 0 20.8996 1.79745 20.8996 4.01471ZM4.14405 2.29412C5.10135 2.29412 5.87739 3.06445 5.87739 4.01471V10.6049C3.78181 9.15396 2.41072 6.74326 2.41072 4.01471C2.41072 3.06445 3.18676 2.29412 4.14405 2.29412ZM15.1218 4.01471V10.6049C17.2174 9.15396 18.5885 6.74326 18.5885 4.01471C18.5885 3.06445 17.8125 2.29412 16.8552 2.29412C15.8979 2.29412 15.1218 3.06445 15.1218 4.01471Z"
                    fill="#696969"
                  />
                  <path
                    d="M15.1218 21.2209V15.7725C12.1759 16.9147 8.82095 16.9138 5.87739 15.7725V21.2209C5.87739 22.1711 5.10135 22.9414 4.14405 22.9414C3.18676 22.9414 2.41072 22.1711 2.41072 21.2209V13.7486C1.53381 13.0296 0.755699 12.1963 0.0996094 11.2715V21.2209C0.0996094 23.4381 1.91037 25.2356 4.14405 25.2356C6.37774 25.2356 8.1885 23.4381 8.1885 21.2209V18.7514C9.71687 18.9856 11.2824 18.9856 12.8107 18.7514V21.2209C12.8107 23.4381 14.6215 25.2356 16.8552 25.2356C19.0889 25.2356 20.8996 23.4381 20.8996 21.2209V11.2715C20.2435 12.1963 19.4654 13.0296 18.5885 13.7486V21.2209C18.5885 22.1711 17.8125 22.9414 16.8552 22.9414C15.8979 22.9414 15.1218 22.1711 15.1218 21.2209Z"
                    fill="#696969"
                  />
                </svg>
                Connect Wallet
              </div>
            </div>
            <div className="text-center mt-4 text-sm font-normal text-[#0F91D2] cursor-pointer">
              <a href="https://www.hashpack.app/download">
                Open the Hashpack extension
              </a>
            </div>
            <div className="text-center mt-8 text-sm font-normal text-[#696969]">
              Privacy - Terms
            </div>
            <div className="text-center mt-4 text-xs font-normal text-[#959595]">
              Powered by Designbook
            </div>
          </div>
        </div>
      </section>
    </Loader>
  );
}

export default Connect;
