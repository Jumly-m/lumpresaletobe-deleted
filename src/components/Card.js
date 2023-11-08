import React from "react";
import { Button } from "reactstrap";
import { useState } from "react";
import { Link } from "react-router-dom";

const Card = (props) => {
  const [
    percentage,
    // setPercentage
  ] = useState("16");
  // const [click, setClick] = useState();
  // let earning1 = "16";
  // let earning2 = "Matic";
  // let earning3 = "0.065";

  // function earningOne() {
  //   setPercentage(earning1);
  // }

  // function earningTwo() {
  //   setPercentage(earning2);
  // }

  // function earningThree() {
  //   setPercentage(earning3);
  // }

  // function handleClick() {
  //   setClick();
  // }

  return (
    <div className="pools-container">
      <div className="pool1 presaleCard">
        <div className="details">
          <div className="asset-imageContainer">
            <img className="usdt" src={props?.image} alt="usdt" />
          </div>
          <div className="asset-descriptionContainer">
            <p>{props?.name}</p>
            <p className="percentage">
              {props?.percentage} {percentage}
            </p>
          </div>
        </div>
        <div className="days">
          <p>{props?.days}</p>
          <h4>
          PLANNED EXCHANGES:
           
            </h4>
            <p className="exchanges">
               <button className="exchange-btn">Mexc</button>
               <button className="exchange-btn">Bitmart</button>
               <button className="exchange-btn">LBank</button>
               <button className="exchange-btn">Kucoin</button>
               <button className="exchange-btn">Gateio</button>
               <button className="exchange-btn">Binance</button>
            </p>
    
        </div>
        <div className="days-btnContainer"></div>

        <div className="check-container">
          {props?.name === "DAI-USDT" ? (
            <Link to="/presale">
              <div className="check-btn">
                <Button className="check" size="lg" color="success">
                  {props.stake}
                </Button>
              </div>
            </Link>
          ) : props.name === "LUM" ? (
            <Link to="/lum-staking">
              <div className="check-btn">
                <Button className="check" size="lg" color="success">
                  {props.stake}
                </Button>
              </div>
            </Link>
          ) : (
            <Link to="/presale">
              <div className="check-btn">
                <Button className="check" size="lg" color="success">
                  {" "}
                  {props?.stake}{" "}
                </Button>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
