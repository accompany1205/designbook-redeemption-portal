import React, { ReactNode, ReactElement } from 'react';

type Props = {};
interface LoaderProps {
  children: ReactNode;
  isLoading: boolean;
}

const Loader = ({children, isLoading}: LoaderProps) => {
  return (
    <section>
        {isLoading && <div className="fixed w-full flex items-center justify-center min-h-screen bg-[#dfdede63]">
            <div className="min-w-[200px] pt-8">
                <div className="flex justify-center">
                    <img src="./images/loader.png" className="animate-spin" alt="loader png" />
                </div>
            </div>
        </div>}
        {children}
    </section>
  );
};

export default Loader;
