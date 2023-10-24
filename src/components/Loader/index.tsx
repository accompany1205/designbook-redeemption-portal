import React from "react";

type Props = {};

const Loader = (props: Props) => {
  return (
    <section className="bg-[#F0E4FE]">
        <div className="flex items-center justify-center min-h-screen">
            <div className="min-w-[200px] pt-8">
                <div className="flex justify-center">
                    <img src="./images/loader.png" className="animate-spin" alt="loader png" />
                </div>
            </div>
        </div>
    </section>
  );
};

export default Loader;
