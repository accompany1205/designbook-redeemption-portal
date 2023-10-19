import React, { createContext, useState, useEffect } from "react";
import { Magic } from 'magic-sdk';
import { HederaExtension } from '@magic-ext/hedera';

interface AuthContextState {
  isLoggedIn: boolean;
  setLoggedIn: Function;
  publicAddress: string;
  setPublicAddress: Function;
  userMetadata: any;
  setUserMetadata: Function;
}

export const AuthContext = createContext<AuthContextState>(
  {} as AuthContextState
);

export const MagicClient = new Magic('pk_live_C8037E2E6520BBDF', {
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
  return (
    <AuthContext.Provider value={{ isLoggedIn, setLoggedIn, publicAddress, setPublicAddress, userMetadata, setUserMetadata }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
