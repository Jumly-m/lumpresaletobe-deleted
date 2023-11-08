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
    //change lum
    abi: contractData?.luminaiABI,
    address: contractData?.luminaiAddress,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  const { data: investorData } = useContractRead({
    //change lum
    abi: contractData?.luminaiStakingABIV2,
    address: contractData?.luminaiStakingAddressV2,
    functionName: "investors",
    args: [address],
    select: (data) => ({
      user: data[0],
      totalStaked: fromWeiToDecimals(data[1]?.toString() || 0, 18),
      totalClaimed: fromWeiToDecimals(data[2]?.toString() || 0, 18),
      startDate: Number(data[3]) * 1000,
      referralCount: data[4]?.toString(),
      totalReferral: fromWeiToDecimals(data[5]?.toString() || 0, 18),
      referrer: data[6]?.toString(),
    }),
    watch: true,
  });

  const { data: totalReward } = useContractRead({
    abi: contractData?.luminaiStakingABIV2,
    address: contractData?.luminaiStakingAddressV2,
    functionName: "calculateTotalReward",
    args: [address],
    watch: true,
  });

  const { data: lumToken } = useContractRead({
    abi: contractData?.luminaiStakingABIV2,
    address: contractData?.luminaiStakingAddressV2,
    functionName: "lumTokenRate",
    args: [],
    watch: true,
  });

  console.log("tokennn", lumToken);

  const { data: airdropClaimFee } = useContractRead({
    abi: contractData?.luminaiAirdropABI,
    address: contractData?.luminaiAirdropAddress,
    functionName: "AIRDROP_CLAIM_FEE",
    args: [],
    watch: true,
  });

  const { data: stakeFee } = useContractRead({
    abi: contractData?.luminaiStakingABIV2,
    address: contractData?.luminaiStakingAddressV2,
    functionName: "stakingFee",
    args: [],
    watch: true,
  });

  const { data: airdropAmountClaimed } = useContractRead({
    abi: contractData?.luminaiAirdropABI,
    address: contractData?.luminaiAirdropAddress,
    functionName: "airdropClaimedAmount",
    args: [address],
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
    abi: contractData?.luminaiABI,
    address: contractData?.luminaiAddress,
    functionName: "allowance",
    args: [address, contractData?.luminaiStakingAddressV2],
    watch: true,
  });

  const { writeAsync: approve, isLoading: isApproveLoading } = useContractWrite(
    {
      abi: contractData?.luminaiABI,
      address: contractData?.luminaiAddress,
      functionName: "approve",
      args: [
        contractData?.luminaiStakingAddressV2,
        toWeiToDecimals(stakeValue, 18),
      ],
      onError(error) {
        console.log("Error", error);
      },
    }
  );

  const { writeAsync: stakeAmount, isLoading: isStakeLoading } =
    useContractWrite({
      abi: contractData?.luminaiStakingABIV2,
      address: contractData?.luminaiStakingAddressV2,
      functionName: "stakeAmount",
      args: [
        toWeiToDecimals(stakeValue, 18),
        referralAddress || "0x0000000000000000000000000000000000000000",
      ],
      value: stakeFee?.toString(),
      onError(error) {
        console.log("Error", error);
      },
    });

  const { writeAsync: claimReward, isLoading: isClaimRewardLoading } =
    useContractWrite({
      abi: contractData?.luminaiStakingABIV2,
      address: contractData?.luminaiStakingAddressV2,
      functionName: "claimTotalReward",
      args: [],
    });

  const {
    writeAsync: restakeTotalReward,
    isLoading: isrestakeTotalRewardLoading,
  } = useContractWrite({
    abi: contractData?.luminaiStakingABIV2,
    address: contractData?.luminaiStakingAddressV2,
    functionName: "restakeTotalReward",
    args: [],
  });

  const { writeAsync: swapTotalReward, isLoading: isswapTotalRewardLoading } =
    useContractWrite({
      abi: contractData?.luminaiStakingABIV2,
      address: contractData?.luminaiStakingAddressV2,
      functionName: "swapTotalReward",
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
                  onClick={() => handlePackageClick(1000, 30, 15)}
                  className={`package-card card-btn mb-2 mt-2 p-2 text-center ${
                    activeCard === 1000 ? "active" : ""
                  }`}
                >
                  <CardTitle>POOL-1 </CardTitle>
                </Card>
                <Collapse isOpen={activeCard === 1000}>
                  <Col className="text-white min-dep">
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Est.APY</h6>
                      <h6 className="mb-0 green"> 30%</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Earning</h6>
                      <h6 className="mb-0 green"> 2% Daily</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Minimum </h6>
                      <h6 className="mb-0 green"> 1,000 LUM</h6>
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
                  onClick={() => handlePackageClick(75001, 3 * 30, 30)}
                  className={`package-card mb-2 mt-2 p-2 text-center ${
                    activeCard === 75001 ? "active" : ""
                  }`}
                >
                  <CardTitle>POOL-2</CardTitle>
                </Card>
                <Collapse isOpen={activeCard === 75001}>
                  <Col className="text-white min-dep">
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> APY</h6>
                      <h6 className="mb-0 green"> 90%</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Earning</h6>
                      <h6 className="mb-0 green"> 3% Daily</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Minimum </h6>
                      <h6 className="mb-0 green"> 75001 LUM</h6>
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
                  onClick={() => handlePackageClick(500001, 5 * 45, 45)}
                  className={`package-card mb-2 mt-2 p-2 text-center ${
                    activeCard === 500001 ? "active" : ""
                  }`}
                >
                  <CardTitle>POOL-3</CardTitle>
                </Card>
                <Collapse isOpen={activeCard === 500001}>
                  <Col className="text-white min-dep">
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> APY</h6>
                      <h6 className="mb-0 green">225%</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Earning</h6>
                      <h6 className="mb-0 green"> 5% Daily</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0"> Minimum </h6>
                      <h6 className="mb-0 green"> 500001 LUM</h6>
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
                      {!loading ? fromWeiToDecimals(balance || 0, 18) : "0"}{" "}
                      <span className="spn">LUM</span>
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
                          className="custom-input"
                        />
                        <span className="input-group-text">LUM</span>
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
                          {investorData?.totalStaked} LUM
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
                              "allowance",

                              fromWeiToDecimals(allowance || 0, 18) <
                                Number(stakeValue)
                            );
                            console.log(
                              "wei",
                              fromWeiToDecimals(allowance || 0, 18)
                            );

                            console.log("number", Number(stakeValue));
                            if (
                              fromWeiToDecimals(allowance || 0, 18) <
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
                              Number(fromWeiToDecimals(balance || 0, 18)) ||
                            Number(stakeValue) < 10
                          }
                        >
                          {(isStakeLoading || isApproveLoading) && (
                            <Spinner size="sm" color="light" className="mr-2" />
                          )}
                          {fromWeiToDecimals(allowance || 0, 18) <
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
            <Card body className="card1 mb-3 mt-5 ">
              <Row>
                <Col xs="12">
                  <CardTitle tag="h5">Staking Rewards</CardTitle>
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
                    <p>{fromWeiToDecimals(totalReward?.toString() || 0, 18)}</p>
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
                <Row className="pt-2">
                  <Col>
                    <Button
                      color="primary"
                      className="button"
                      block
                      disabled={isrestakeTotalRewardLoading}
                      onClick={() => restakeTotalReward()}
                    >
                      {isrestakeTotalRewardLoading && (
                        <Spinner size="sm" color="light" />
                      )}
                      Reinvest
                    </Button>
                  </Col>
                </Row>
              </CardText>
            </Card>

            <Card body className="card1 mb-3 mt-5 ">
              <Row>
                <Col xs="12">
                  <CardTitle tag="h5">Staking Rewards in USDT</CardTitle>
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
                    <p>
                      {fromWeiToDecimals(lumToken?.toString() || 0, 6) *
                        fromWeiToDecimals(totalReward?.toString() || 0, 18)}
                    </p>
                  </Col>
                </Row>

                <Row className="pt-2">
                  <Col>
                    <Button
                      color="primary"
                      className="button"
                      block
                      disabled={isswapTotalRewardLoading}
                      onClick={() => swapTotalReward()}
                    >
                      {isswapTotalRewardLoading && (
                        <Spinner size="sm" color="light" />
                      )}
                      Swap into USDT
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
          </Collapse>
        </Col>
      </Row>
    </Container>
  );
}
