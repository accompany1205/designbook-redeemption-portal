import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useContext } from "react";
import WalletContext, {
  WalletServiceProviders,
} from "../../lib/WalletService/WalletContext";
// import WalletContext from "../../auth/WalletContext";

type Props = {
  isShown: boolean;
  onClose: () => void;
};

const WalletConnectorContainer = ({ isShown, onClose }: Props) => {
  const connectWallet = useContext(WalletContext).connectWallet;

  return (
    <Transition appear show={isShown} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform text-white overflow-hidden rounded-2xl bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg md:text-2xl font-medium leading-6 text-center">
                  Connect to a wallet
                </Dialog.Title>
                <div className="mt-2">
                  <div className="flex my-4">
                    <div className="w-full py-3 flex flex-col justify-center items-center hover:scale-105 transition-transform cursor-pointer">
                      <div
                        className="flex flex-col justify-center items-center"
                        onClick={() =>
                          connectWallet(WalletServiceProviders.HASHPACK)
                        }>
                        <img
                          src="/images/hash-logo.png"
                          alt="Hash Logo"
                          className="w-12 h-14"
                        />
                        <span className="mt-1 md:text-xl">Hash Wallet</span>
                      </div>
                      <span className="text-blue-600 underline text-xs">
                        <a href="https://www.hashpack.app/download">
                          Click here to download the app
                        </a>
                      </span>
                    </div>
                    
                  </div>
                </div>

                {/* <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}>
                    Got it, thanks!
                  </button>
                </div> */}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default WalletConnectorContainer;
