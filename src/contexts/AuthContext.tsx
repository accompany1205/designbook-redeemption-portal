import React, { createContext, useState, useEffect } from "react";
import { Magic } from 'magic-sdk';
import { HederaExtension } from '@magic-ext/hedera';
import axios from "axios";

interface AuthContextState {
  isLoggedIn: boolean;
  setLoggedIn: Function;
  publicAddress: string;
  setPublicAddress: Function;
  userMetadata: any;
  setUserMetadata: Function;
  hBarPrice: number;
  disConnectMagic: Function;
  token: string;
  setToken: Function;
  authMagic: boolean;
  setAuthMagic: Function;
}

const HBAR_PRICE_URL = process.env.REACT_APP_COIN_PRICE_API_URL || `https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph,tether&vs_currencies=usd`;
export const AuthContext = createContext<AuthContextState>(
  {} as AuthContextState
);

export const MagicClient = new Magic(process.env.REACT_APP_MAGIC_PRIVATE_KEY || "", {
    extensions: [
      new HederaExtension({
        network: 'testnet',
      }),
    ],
});

const AuthProvider: React.FC = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState<boolean>(false);
  const [publicAddress, setPublicAddress] = useState('');
  const [userMetadata, setUserMetadata] = useState({});
  const [hBarPrice, setHBarPrice] = useState<number>(0.047);
  const [token, setToken] = useState<string>('');
  const [authMagic, setAuthMagic] = useState<boolean>(false);

  useEffect(()=>{
    const timer = setInterval(async()=>{
      const res = await axios.get(HBAR_PRICE_URL);
      if(res && res.status === 200 && res.data && res.data['hedera-hashgraph'] && res.data['hedera-hashgraph']['usd']){
        setHBarPrice(res.data['hedera-hashgraph'] && res.data['hedera-hashgraph']['usd']);
        clearInterval(timer);
      }
    }, 3000)
    return()=>{
      
    }
  },[])

  const initialize = () => {
    setLoggedIn(false);
    setPublicAddress('');
    setUserMetadata({});
  }

  const disConnectMagic = async () => {
    console.log('authcontext disConnectMagic')
    await MagicClient.user.logout();
    initialize();
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, setLoggedIn, publicAddress, setPublicAddress, userMetadata, setUserMetadata, hBarPrice, disConnectMagic, token, setToken, authMagic, setAuthMagic}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
