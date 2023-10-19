import React, { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AuthContext } from "../contexts/AuthContext";

// https://gigaland.io/register.html

function Wallet() {
  const [isLeft, setLeft] = useState<boolean>(true);
  const { userMetadata, publicAddress } = useContext(AuthContext);
  console.log(userMetadata, publicAddress);

  const handleClickTabBtn = (position: boolean) => {
    setLeft(position);
  };

  return (
    <section className="bg-[#F0E4FE]">
      <div className="flex items-center justify-center h-screen">
        <div>
          <div className="rounded-[25px] border-[1px] border-solid border-[#959595] mb-8">
            <div className="text-center text:xl  md:text-2xl font-bold mb-2 md:mb-4 mt-4 md:mt-6">
              With{" "}
              <span className="text-[#5E1DFC] font-bold">Magic Wallet</span>
            </div>
            <div className="flex justify-center mb-4 md:mb-8">
              <img src="/images/magicLogo.png" alt="magic logo" />
            </div>
          </div>
          <div className="bg-white rounded-[25px] minW-[300px] pt-4 pb-8">
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
              >
                <circle cx="11.5" cy="11.5" r="11.5" fill="#CBCBCB" />
                <path d="M7.36133 7.35938L15.6413 15.6394" stroke="#1D1E1F" />
                <path d="M15.6406 7.35938L7.36063 15.6394" stroke="#1D1E1F" />
              </svg>
            </div>
            <div className="text-sm font-medium text-center text-[#696969] mb-4">
              {publicAddress}
            </div>
            <div className="text-4xl font-bold text-center mb-12">$444.5</div>
            <div className="flex items-center justify-between px-16 mb-8">
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
                >
                  <circle
                    cx="19.4258"
                    cy="19.4258"
                    r="19.4258"
                    fill="#D9D9D9"
                  />
                  <path
                    d="M31.375 12.844C31.1815 12.551 30.8332 12.4075 30.4948 12.4809L8.73464 17.2093C8.38453 17.2853 8.11881 17.5777 8.07034 17.9399C8.0219 18.3022 8.20121 18.6567 8.51855 18.8258L13.2793 21.3639L13.3055 27.7258C13.3069 28.0646 13.5014 28.3715 13.8034 28.5115C13.9158 28.5636 14.0353 28.589 14.154 28.589C14.3545 28.589 14.5529 28.5165 14.7102 28.3771L19.1092 24.4806L22.3047 26.1754C22.6874 26.3782 23.1582 26.2559 23.3994 25.8908L31.375 13.8137C31.5685 13.5207 31.5685 13.137 31.375 12.844Z"
                    stroke="#696969"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.1934 21.2585L30.7866 12.4619"
                    stroke="#696969"
                    strokeWidth="2"
                  />
                  <path
                    d="M30.7866 12.8281L16.1256 22.7243L14.293 28.5887"
                    stroke="#696969"
                    strokeWidth="2"
                  />
                </svg>
                <div className="text-sm font-normal text-center text-[#696969] mt-3">
                  Send
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
                    fill="#D9D9D9"
                  />
                  <path
                    d="M25.9808 20.2285L19.588 26.6212L13.1953 20.2285"
                    stroke="#696969"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.5937 26.6209L19.5938 11.7285"
                    stroke="#696969"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-sm font-normal text-center text-[#696969] mt-3">
                  Buy
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="bg-[#D9D9D9] flex items-center justify-center rounded-[50px]">
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
            <div className="mx-16 mb-8 rounded-[15px] bg-[#F0E4FE] pt-6 pb-4">
              <div className="flex flex-wrap items-center justify-around px-6 mb-4">
                <div className="rounded-full w-[23px] h-[23px] bg-[#5E1DFC]"></div>
                <div className="rounded-full w-[23px] h-[23px] bg-[#5E1DFC]"></div>
                <div className="rounded-full w-[23px] h-[23px] bg-[#5E1DFC]"></div>
                <div className="rounded-full w-[23px] h-[23px] bg-[#5E1DFC]"></div>
              </div>
              <div className="text-base font-normal text-[#696969] text-center">
                No digital collectibles... Yet
              </div>
            </div>
            <div className="text-sm font-normal text-[#959595] text-center">
              Secured by Designbook
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Wallet;
