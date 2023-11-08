import React, { useState, useEffect } from "react";

import { useContractRead, useContractWrite, useBalance } from "wagmi";
import { useAccount } from "wagmi";

import { contractData } from "../utils/web3-utils";
import { toWeiToDecimals, fromWeiToDecimals } from "../utils/web3-utils";
import { Progress } from "reactstrap";

const Presale = () => {
  const [lumAmount, setLumAmount] = useState(0);
  const [maticAmount, setMaticAmount] = useState(16);
  // const [walletBalance, setWalletBalance] = useState("");
  const [LumValuePerMatic, setLumValuePerMatic] = useState(0);

  const { address } = useAccount();

  const { data: walletBalance } = useBalance({
    address: address,
  });

  const { data: tokenPerMatic } = useContractRead({
    address: contractData?.luminaiPresale,
    abi: contractData?.luminaiPresaleABI,
    functionName: "tokenPerMatic",
  });

  console.log("token per matic", tokenPerMatic);

  const { data: totalUser } = useContractRead({
    address: contractData?.luminaiPresale,
    abi: contractData?.luminaiPresaleABI,
    functionName: "totalUsers",
  });

  const { data: totalSold } = useContractRead({
    address: contractData?.luminaiPresale,
    abi: contractData?.luminaiPresaleABI,
    functionName: "totalSold",
  });

  console.log(1000000 / fromWeiToDecimals(totalSold, 18));

  const { write: buy, isLoading: isBuyLoading } = useContractWrite({
    address: contractData?.luminaiPresale,
    abi: contractData?.luminaiPresaleABI,
    functionName: "buy",
    value: toWeiToDecimals(maticAmount, 18),
  });

  const { data: getBalance } = useContractRead({
    address: contractData?.luminaiAddress,
    abi: contractData?.luminaiABI,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
  });

  console.log("get balance", fromWeiToDecimals(getBalance, 18));

  useEffect(() => {
    if (maticAmount && tokenPerMatic) {
      const calculatedLumAmount =
        maticAmount * fromWeiToDecimals(tokenPerMatic || 0, 18);
      setLumAmount(calculatedLumAmount);
    } else {
      setLumAmount(0);
    }
  }, [maticAmount, tokenPerMatic]);

  useEffect(() => {
    setLumValuePerMatic(1 / fromWeiToDecimals(tokenPerMatic || 0, 18));
  }, [tokenPerMatic]);

  return (
    <div className="presale-main">
      <div className="presale-container">
        <div className="deposit-form ">
          <label>Amount in MATIC you pay</label>
          <div className="inputBox">
            <input
              className="inputamount"
              required=""
              type="number"
              step="any"
              min={16}
              max={10000000}
              placeholder="Enter Amount ..."
              value={maticAmount}
              onChange={(e) => setMaticAmount(e?.target?.value)}
            />
            <button className="usdt-btn">
              <img className="usdt-bep20" src="image/usdt.png" alt="matic" />
            </button>
          </div>

          <label>Amount in LUM you receive</label>
          <div className="inputBox">
            <input
              className="inputamount"
              required=""
              type="number"
              step="any"
              min={16}
              max={10000000}
              placeholder="Enter Amount ..."
              value={lumAmount}
            />
            <button className="usdt-btn">
              <img className="usdt-bep20" src="image/logo.png" alt="matic" />
            </button>
          </div>

          {walletBalance ? (
            <div>
              <label>
                Your Balance: {parseFloat(walletBalance?.formatted)?.toFixed(4)}{" "}
                {walletBalance?.symbol}
              </label>
            </div>
          ) : (
            <label>Please connect wallet to show balance</label>
          )}
          {/* <label >Your Balance : {parseFloat(walletBalance?.formatted)?.toFixed(4)} {walletBalance?.symbol}</label> */}
          <label>
            Your Balance :{" "}
            {Number(fromWeiToDecimals(getBalance || 0, 18))?.toFixed(2)} LUM
          </label>
          <button
            className="deposit-btn"
            onClick={buy}
            type="submit"
            disabled={isBuyLoading}
          >
            {isBuyLoading ? "Loading..." : "Buy Now"}
          </button>
        </div>

        <div className="presale-description">
          <h5>PRESALE DESCRIPTION</h5>
          <div className="presale-details">
            <p>
              Token Name: <b />
              <p className="details">Luminai</p>
            </p>
            <p>
              Token Ticker: <p className="details">LUM</p>
            </p>
            <p>
              Maximum Supply: <p className="details">1B</p>
            </p>
            <p>
              LUM Allocated: <p className="details">1,000,000</p>
            </p>
            <p>
              Rate :
              <p className="details">1 LUM = {LumValuePerMatic?.toFixed(2)}</p>
            </p>
            <p>
              Participants :<p className="details">{Number(totalUser)}</p>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Presale;
