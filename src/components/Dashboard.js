import React, { useEffect, useState } from "react";
import { Collapse } from "reactstrap";
import {
  Container,
  Row,
  Col,
  Card,
  CardTitle,
  CardText,
  Button,
  Input,
  Form,
  FormGroup,
  CardImg,
  InputGroup,
  Spinner,
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  // useNetwork,
} from "wagmi";
import {
  contractData,
  fromWeiToDecimals,
  toWeiToDecimals,
} from "../utils/web3-utils";
import { getQueryVariable } from "../utils/utils";
import { formatEther } from "viem";
import { useLocation } from "react-router-dom";

export default function Dashboard() {
  const { address } = useAccount();
  const location = useLocation();
  // const urll = window.location.href;
  // console.log("header url", urll)
  const urll = window.location.href;
  const url = new URL(urll);
  const referralAddress = url.searchParams.get("ref");

  // console.log("header urll ",referralAddress);

  const { data: balance, loading } = useContractRead({
    abi: contractData?.usdtABI,
    address: contractData?.usdtAddress,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
    watch: true,
  });

  const { data: investorData } = useContractRead({
    abi: contractData?.luminaiStakingABI,
    address: contractData?.luminaiStakingAddress,
    functionName: "investors",
    args: [address || "0x0000000000000000000000000000000000000000"],
    select: (data) => ({
      user: data[0],
      totalStaked: fromWeiToDecimals(data[1]?.toString() || 0, 6),
      totalClaimed: fromWeiToDecimals(data[2]?.toString() || 0, 6),
      startDate: Number(data[3]) * 1000,
      referralCount: data[4]?.toString(),
      totalReferral: fromWeiToDecimals(data[5]?.toString() || 0, 6),
      referrer: data[6]?.toString(),
    }),
    watch: true,
  });

  const { data: totalReward } = useContractRead({
    abi: contractData?.luminaiStakingABI,
    address: contractData?.luminaiStakingAddress,
    functionName: "calculateTotalReward",
    args: [address || "0x0000000000000000000000000000000000000000"],
    watch: true,
  });

  const { data: airdropClaimFee } = useContractRead({
    abi: contractData?.luminaiAirdropABI,
    address: contractData?.luminaiAirdropAddress,
    functionName: "AIRDROP_CLAIM_FEE",
    args: [],
    watch: true,
  });

  const { data: airdropAmountClaimed } = useContractRead({
    abi: contractData?.luminaiAirdropABI,
    address: contractData?.luminaiAirdropAddress,
    functionName: "airdropClaimedAmount",
    args: [address || "0x0000000000000000000000000000000000000000"],
    watch: true,
    select: (data) => {
      const amountInEth = formatEther(data);
      return amountInEth;
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  const [stakeValue, setStakeValue] = useState(10);
  const [packageData, setPackageData] = useState({
    min: 10,
    apy: 90,
    days: 90,
  });
  const [activeCard, setActiveCard] = useState(-1);
  const [stakeActive, setStakeActive] = useState(false);
  const [, setApproved] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateCountdown = (endDate) => {
    const currentTime = new Date().getTime();
    const remainingTime = endDate - currentTime;

    if (remainingTime > 0) {
      const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    } else {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  useEffect(() => {
    if (stakeActive) {
      const endDate =
        investorData?.startDate + packageData.days * 24 * 60 * 60 * 1000;
      calculateCountdown(endDate);

      const countdownInterval = setInterval(() => {
        calculateCountdown(endDate);
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [stakeActive, packageData.days, investorData?.startDate]);

  const handlePackageClick = (min, apy, days) => {
    setPackageData({ min, apy, days });
    setStakeValue(min);
    setActiveCard(min);
    setStakeActive(false);
  };

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    abi: contractData?.usdtABI,
    address: contractData?.usdtAddress,
    functionName: "allowance",
    args: [address, contractData?.luminaiStakingAddress],
    watch: true,
  });

  const { writeAsync: approve, isLoading: isApproveLoading } = useContractWrite(
    {
      abi: contractData?.usdtABI,
      address: contractData?.usdtAddress,
      functionName: "approve",
      args: [
        contractData?.luminaiStakingAddress,
        toWeiToDecimals(stakeValue, 6),
      ],
      onError(error) {
        console.log("Error", error);
      },
    }
  );

  const { writeAsync: stakeAmount, isLoading: isStakeLoading } =
    useContractWrite({
      abi: contractData?.luminaiStakingABI,
      address: contractData?.luminaiStakingAddress,
      functionName: "stakeAmount",
      args: [
        toWeiToDecimals(stakeValue, 6),
        referralAddress || "0x0000000000000000000000000000000000000000",
      ],
      onError(error) {
        console.log("Error", error);
      },
    });

  const { writeAsync: claimReward, isLoading: isClaimRewardLoading } =
    useContractWrite({
      abi: contractData?.luminaiStakingABI,
      address: contractData?.luminaiStakingAddress,
      functionName: "claimTotalReward",
      args: [],
    });

  const { writeAsync: claimAirdrop, isLoading: isClaimAirdropLoading } =
    useContractWrite({
      abi: contractData?.luminaiAirdropABI,
      address: contractData?.luminaiAirdropAddress,
      functionName: "claimAirdrop",
      args: [
        getQueryVariable("ref") || "0x0000000000000000000000000000000000000000",
      ],
      value: airdropClaimFee?.toString(),
      onError(error) {
        console.log("Error", error);
      },
    });

  return (
    <Container id="dashboard">
      <p className="main-head"></p>
      <Row className="row1">
        <Col xs="12" md="12" lg="7" className="mb-5 second-container">
          <Card body className="card3 form ">
            {/* <Card> */}
            <Row className="">
              <Col xs="12">
                <h4>Pools</h4>
              </Col>
              <Col md="4">
                <Card
                  onClick={() => handlePackageClick(10, 90, 90)}
                  className={`package-card card-btn mb-2 mt-2 p-2 text-center ${
                    activeCard === 10 ? "active" : ""
                  }`}
                >
                  <CardTitle>POOL-1 </CardTitle>
                </Card>
                <Collapse isOpen={activeCard === 10}>
                  <Col className="text-white min-dep">
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Est.APY</h6>
                      <h6 className="mb-0 green"> 90%</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Earning</h6>
                      <h6 className="mb-0 green"> 1% Daily</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Minimum </h6>
                      <h6 className="mb-0 green"> 10$</h6>
                    </div>
                    <Button
                      onClick={() => setStakeActive(true)}
                      className="primary button mt-2"
                      size="sm"
                    >
                      Stake Now
                    </Button>
                  </Col>
                </Collapse>
              </Col>
              <Col md="4" className="mt-3 mt-md-0">
                <Card
                  onClick={() => handlePackageClick(5001, 180, 120)}
                  className={`package-card mb-2 mt-2 p-2 text-center ${
                    activeCard === 5001 ? "active" : ""
                  }`}
                >
                  <CardTitle>POOL-2</CardTitle>
                </Card>
                <Collapse isOpen={activeCard === 5001}>
                  <Col className="text-white min-dep">
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> APY</h6>
                      <h6 className="mb-0 green"> 180%</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Earning</h6>
                      <h6 className="mb-0 green"> 1.5% Daily</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Minimum </h6>
                      <h6 className="mb-0 green"> 5001$</h6>
                    </div>
                    <Button
                      onClick={() => setStakeActive(true)}
                      className="primary button mt-2"
                      size="sm"
                    >
                      Stake Now
                    </Button>
                  </Col>
                </Collapse>
              </Col>
              <Col md="4" className="mt-3 mt-md-0">
                <Card
                  onClick={() => handlePackageClick(15001, 240, 150)}
                  className={`package-card mb-2 mt-2 p-2 text-center ${
                    activeCard === 15001 ? "active" : ""
                  }`}
                >
                  <CardTitle>POOL-3</CardTitle>
                </Card>
                <Collapse isOpen={activeCard === 15001}>
                  <Col className="text-white min-dep">
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> APY</h6>
                      <h6 className="mb-0 green">240%</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Earning</h6>
                      <h6 className="mb-0 green"> 1.6% Daily</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Minimum </h6>
                      <h6 className="mb-0 green"> 15001$</h6>
                    </div>
                    <Button
                      onClick={() => setStakeActive(true)}
                      className="primary button mt-2"
                      size="sm"
                    >
                      Stake Now
                    </Button>
                  </Col>
                </Collapse>
              </Col>
            </Row>
            {/* </Card> */}
            <Collapse isOpen={stakeActive}>
              <Form className="form">
                <FormGroup className="mt-5">
                  <Row>
                    <Col xs="8">Enter Amount</Col>
                    <Col>
                      Balance:{" "}
                      {!loading ? fromWeiToDecimals(balance || 0, 6) : "0"}{" "}
                      <span className="spn">USDT</span>
                    </Col>
                  </Row>
                </FormGroup>
                <FormGroup className="mb-5">
                  <Row>
                    <Col>
                      <InputGroup className="inputGroup">
                        <Input
                          type="number"
                          placeholder={stakeValue}
                          value={stakeValue}
                          onChange={(e) => {
                            setStakeValue(e.target.value);
                            if (e?.target?.value <= 5000) {
                              setPackageData({ min: 10, apy: 90, days: 90 });
                              setActiveCard(10);
                            } else if (e?.target?.value <= 15000) {
                              setPackageData({
                                min: 5001,
                                apy: 180,
                                days: 120,
                              });
                              setActiveCard(5001);
                            } else {
                              setPackageData({
                                min: 15001,
                                apy: 240,
                                days: 150,
                              });
                              setActiveCard(15001);
                            }
                          }}
                          //   (e) => {
                          //   setStakeValue(e.target.value);
                          //   const packageValue = getPackageData(e.target.value);
                          //   console.log(packageValue);
                          //   setPackageData(packageValue);
                          // }
                          // }
                          className="custom-input"
                        />
                        <span className="input-group-text">USDT</span>
                      </InputGroup>
                      <Col xs="12" className="green">
                        {packageData?.apy}% apy for {packageData?.days} days
                      </Col>
                    </Col>
                  </Row>
                </FormGroup>
                <Container className="text-center">
                  <FormGroup>
                    <Row>
                      <Col>
                        Total Token Staked :
                        <span className="spn">
                          {" "}
                          {investorData?.totalStaked} USDT
                        </span>
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup className="mb-5">
                    <Row>
                      <Col>
                        <Button
                          color="primary"
                          className="button form-button approvebtn"
                          onClick={() => {
                            console.log(
                              allowance,
                              fromWeiToDecimals(allowance || 0, 6)
                            );
                            if (
                              fromWeiToDecimals(allowance || 0, 6) <
                              Number(stakeValue)
                            ) {
                              approve().then(() => {
                                refetchAllowance();
                                setApproved(true);
                              });
                            } else {
                              stakeAmount().then(() => {
                                setStakeValue(0);
                                setApproved(true);
                              });
                            }
                          }}
                          disabled={
                            stakeValue === "0" ||
                            stakeValue === "" ||
                            isStakeLoading ||
                            isApproveLoading ||
                            Number(stakeValue) >
                              Number(fromWeiToDecimals(balance || 0, 6)) ||
                            Number(stakeValue) < 10
                          }
                        >
                          {(isStakeLoading || isApproveLoading) && (
                            <Spinner size="sm" color="light" className="mr-2" />
                          )}
                          {fromWeiToDecimals(allowance || 0, 6) <
                          Number(stakeValue)
                            ? "Approve"
                            : "Stake"}
                        </Button>
                        <Button
                          className="button form-button my-3 refferalbtn"
                          disabled={!address}
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${
                                window?.location?.origin + location?.pathname
                              }?ref=${address}`
                            );
                            alert("Link copied");
                          }}
                        >
                          Copy Referral Link
                        </Button>
                        {address && (
                          <div>{`${
                            window?.location?.origin + location?.pathname
                          }?ref=${address}`}</div>
                        )}
                      </Col>
                    </Row>
                  </FormGroup>
                </Container>
              </Form>
            </Collapse>
            {stakeActive && (
              <Row className="countdown my-4 px-5">
                <Col>
                  Time remaining to Unstake:{" "}
                  <span className="spn">
                    {countdown.days} days, {countdown.hours} hours,{" "}
                    {countdown.minutes} minutes, {countdown.seconds} seconds
                  </span>
                </Col>
              </Row>
            )}
          </Card>
        </Col>

        <Col xs="12" md="12" lg="5" className="mb-5 ">
          <Card body className="card2 mb-3 mt-4">
            <Row>
              <Col xs="8">
                <CardTitle tag="h5">Airdrop Rewards</CardTitle>
              </Col>
            </Row>
            <Row>
              <Col>
                <CardImg />
              </Col>
            </Row>
            <CardText>
              <Row>
                <Col className="cardHead">{airdropAmountClaimed || 0}</Col>
              </Row>
              <Row>
                <Col>
                  <Button
                    color="secondary"
                    className="button"
                    disabled={isClaimAirdropLoading}
                    block
                    onClick={() => claimAirdrop()}
                  >
                    {isClaimAirdropLoading && (
                      <Spinner size="sm" color="light" />
                    )}
                    Claim Airdrop
                  </Button>
                  <Button
                    className="button form-button my-3 refferalbtn"
                    disabled={!address}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${
                          window.location?.origin + location?.pathname
                        }?ref=${address}`
                      );
                      alert("link copied");
                    }}
                  >
                    Copy Referral Link
                  </Button>
                  {address && (
                    <div>{`${
                      window.location?.origin + location?.pathname
                    }?ref=${address}`}</div>
                  )}
                </Col>
              </Row>
            </CardText>
          </Card>
          <Collapse isOpen={true}>
            {/* <div className="scrollable-cards"> */}
            <Card body className="card1 mb-3 ">
              <Row>
                <Col xs="12">
                  <CardTitle tag="h5"></CardTitle>
                </Col>
              </Row>
              <Row>
                <Col>
                  <CardImg />
                </Col>
              </Row>
              <CardText>
                <Row>
                  <Col className="cardHead">
                    {fromWeiToDecimals(totalReward?.toString() || 0, 6)}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button
                      color="primary"
                      className="button"
                      block
                      disabled={isClaimRewardLoading}
                      onClick={() => claimReward()}
                    >
                      {isClaimRewardLoading && (
                        <Spinner size="sm" color="light" />
                      )}
                      Claim All
                    </Button>
                  </Col>
                </Row>
              </CardText>
            </Card>
            <Card body className="card4">
              <Row>
                <Col xs="8">
                  <CardTitle tag="h5">Referral Count</CardTitle>
                </Col>
              </Row>
              <Row>
                <Col>
                  <CardImg />
                </Col>
              </Row>
              <CardText>
                <Row>
                  <Col className="cardHead">
                    {investorData ? investorData.referralCount ?? 0 : 0}
                  </Col>
                </Row>
              </CardText>
            </Card>
            <Card body className="card4">
              <Row>
                <Col xs="8">
                  <CardTitle tag="h5">Referral Rewards</CardTitle>
                </Col>
              </Row>
              <Row>
                <Col>
                  <CardImg />
                </Col>
              </Row>
              <CardText>
                <Row>
                  <Col className="cardHead">
                    {investorData ? investorData.totalReferral ?? 0 : 0}
                  </Col>
                </Row>
              </CardText>
            </Card>

            {/* <Card body className="card2 mb-5">
              <Row>
              <Col xs="8">
              <CardTitle tag="h5">You Stakes</CardTitle>
              </Col>
              <Col xs="4">
                  <Row>
                  <CardText>Stake Price:</CardText>
                  </Row>
                  <Row>
                  <Col>
                  <CardText className="text-right green">0.56%</CardText>
                  </Col>
                  <Col>
                  <CardImg src={vector2} height="14px" />
                  </Col>
                  </Row>{" "}
                  </Col>
                  </Row>
                  <Row>
                  <Col>
                  <CardImg />
                  </Col>
                  </Row>
              <CardText>
                <Row>
                  <Col className="cardHead">0.00</Col>
                  </Row>
                  <Row>
                  <Col xs="8" className="gray">
                  12% apy locked for 365 days And after 365 days 112% apy
                  </Col>
                  <Col xs="4">
                  <Button color="secondary">Withdraw</Button>
                  </Col>
                  </Row>
                  </CardText>
                  </Card>
                  
                  <Card body className="card1 mb-5">
                  <Row>
                  <Col xs="8">
                  <CardTitle tag="h5">Rewards</CardTitle>
                  </Col>
                  <Col xs="4">
                  <Row>
                    <CardText>Total Rewards:</CardText>
                    </Row>
                    <Row>
                    <Col>
                    <CardText className="text-right red">452542</CardText>
                    </Col>
                    <Col>
                    <CardImg src={vector1} height="14px" />
                    </Col>
                    </Row>
                    </Col>
                    </Row>
                    <Row>
                    <Col>
                    <CardImg />
                    </Col>
                    </Row>
                    <CardText>
                <Row>
                  <Col className="cardHead">0.00</Col>
                </Row>
                <Row>
                <Col xs="8" className="gray">
                    All your rewards will be shown here on this portal
                  </Col>
                  <Col xs="4">
                  <Button color="primary" className="button">
                  Claim All
                  </Button>
                  </Col>
                  </Row>
                  </CardText>
                  </Card>
                  
                  <Card body className="card2 mb-5">
                  <Row>
                  <Col xs="8">
                  <CardTitle tag="h5">You Stakes</CardTitle>
                  </Col>
                  <Col xs="4">
                  <Row>
                  <CardText>Stake Price:</CardText>
                  </Row>
                  <Row>
                  <Col>
                  <CardText className="text-right green">0.56%</CardText>
                  </Col>
                  <Col>
                      <CardImg src={vector2} height="14px" />
                      </Col>
                  </Row>{" "}
                  </Col>
              </Row>
              <Row>
                <Col>
                <CardImg />
                </Col>
                </Row>
                <CardText>
                <Row>
                <Col className="cardHead">0.00</Col>
                </Row>
                <Row>
                <Col xs="8" className="gray">
                12% apy locked for 365 days And after 365 days 112% apy
                </Col>
                  <Col xs="4">
                    <Button color="secondary">Withdraw</Button>
                  </Col>
                  </Row>
                  </CardText>
                </Card> */}
            {/* </div> */}
          </Collapse>
        </Col>
      </Row>
    </Container>
  );
}
