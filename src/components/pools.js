import React from "react";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import Card from "./Card";
import { useState } from "react";

const Pool = () => {
  const [percentage, setPercentage] = useState("2");
  const [lendingAmount , setLendingAmount] = useState(100);
  // const [click, setClick] = useState();
  let earning4 = 2;
  let earning5 = 3;
  let earning6 = 5;

  //setting lending amount 
  let lending1 = 100;
  let lending2 = 5001;
  let lending3 = 15001;


  function lendingOne(){
    setLendingAmount(lending1)
  }

  function lendingTwo(){
    setLendingAmount(lending2)
  }

  function lendingThree(){
    setLendingAmount(lending3)
  }

//setting lending is over here



  function earningFour() {
    setPercentage(earning4);
  }

  function earningFive() {
    setPercentage(earning5);
  }

  function earningSix() {
    setPercentage(earning6);
  }
  return (
    <div className="card-container">
      <h1>
        {" "}
        LUM EARN UP TO <span className="heading">240% APY</span>
      </h1>
      <div className="poolscontainer">
        <div style={{ width: "100%" }} className="presale-pool-card">
          <Card
            className="dai-usdt-card"
            image="image/usdt.png"
            name="LUM PRESALE"
            stake="Join Presale"
            reminder="more➣"
            days="Expected Listing price  1$"
          />
        </div>

        <div className="lumdiv pool1" style={{ width: "100%" }}>
        <div className="details">
          <div className="asset-imageContainer">
             <img className="cardlogo" src="image/logo.png" alt="lumlogo"/>
          </div>
          <div className="asset-descriptionContainer">
            <p>LUM STAKING</p>
            <p className="percentage">
            {percentage}%
            </p>
          </div>
          </div>
          <div className="days">
          <p>Duration(Days)</p>
        </div>
        <div className="days-btnContainer">
          <div className="day15btn">
            <Button
              onClick={earningFour}
              className="daysbnt"
              size="lg"
              color="light"
            >
            15
            </Button>
          </div>
          <div >
            <Button
              onClick={earningFive}
              className="daysbnt"
              size="lg"
              color="light"
            >
            30
            </Button>
          </div>
          <div>
            <Button
              onClick={earningSix}
              className="daysbnt"
              size="lg"
              color="light"
            >
           45
            </Button>
          </div>
        </div>
        <div className="check-container">
  <Link to="/lum-staking">
    <div className="check-btn">
    <Button className="check" style={{ width: '100%' }} size="lg" color="success">
     Stake
</Button>

    </div>
  </Link>
        </div>
        </div>


        <div className="lumdiv pool1" style={{ width: "100%" }}>
        <div className="details">
          <div className="asset-imageContainer">
             <img className="cardlogo" src="image/logo.png" alt="lumlogo"/>
          </div>
          <div className="asset-descriptionContainer">
           
            <p className="percentage">
            LUM LEARN-2-EARN{}
            </p>
          </div>
          </div>
          <div className="days">
          <p>Duration(Days)</p>
        </div>
        <div className="days-btnContainer">
          <div>
            <Button
              onClick={lendingOne}
              className="daysbnt"
              size="lg"
              color="light"
            >
            15
            </Button>
          </div>
          <div >
            <Button
              onClick={lendingTwo}
              className="daysbnt"
              size="lg"
              color="light"
            >
            30
            </Button>
          </div>
          <div>
            <Button
              onClick={lendingThree}
              className="daysbnt"
              size="lg"
              color="light"
            >
           45
            </Button>
          </div>
        </div>
        <div className="check-container">

    <div className="check-btn">
    <Button className="check" style={{ width: '100%' }} size="lg" color="success">
     Coming soon...
</Button>

    </div>
 
        </div>
        </div>
      </div>
      <div className="Airdrop-section">
        <div>
          
        </div>
        <div className="Airdrop-card pool1">
        <p>LUM AIRDROP</p>
        <div className="airdrop-details">
        <p>Token Name: LUM</p>
          <p>Airdrop Amount: 20LUM = 20$</p>
          <p>Airdrop Refferal Bonus = 5%</p>
        </div>
          
          <Link to="/dashboard" className="link">
            <div className="airdrop-btn-div" style={{ width: "100%" }}>
              <Button active color="success" outline size="lg" style={{ width: '100%' }}>
                {" "}
                Claim  Airdrop Now
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pool;
