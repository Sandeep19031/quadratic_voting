import React, { useEffect, useState } from "react";
import "./CastVote.css";
import useEth from "../../contexts/EthContext/useEth";
import Countdown, { zeroPad } from "react-countdown";
import Winner from "./Winner";
import { useLocation } from "react-router-dom";
import toast from "cogo-toast";

export default function CastVote() {
  const location = useLocation();

  const proposalID = location.state.proposalID;
  const description = location.state.description;
  const noOfOptions = location.state.noOfOptions;
  const optionsList = location.state.optionsList;
  const expTime = location.state.expirationTime;
  const proposalStatus = location.state.proposalStatus;

  const {
    state: { contract, accounts },
  } = useEth();

  const [remainingCredits, setRemainingCredits] = useState();
  const [totalCredits, setTotalCredits] = useState();
  const [subQuantity, setSubQuantity] = useState(Number(0));
  const [isComplete, setIsComplete] = useState(false);
  const [voted, setVoted] = useState();
  const [votesList, setVotesList] = useState(
    Array.from(new Array(noOfOptions))
  );
  const [update, setUpdate] = useState(false);
  let arr = [];
  for (let i = 1; i <= noOfOptions; i++) {
    arr.push(i);
  }
  useEffect(() => {
    const getRemainingCredits = async () => {
      try {
        const credits = await contract.methods.balanceOf(accounts[0]).call();
        console.log("res from balanceOf", credits);
        setRemainingCredits(Number(credits));
        setTotalCredits(Number(credits));
      } catch (err) {
        console.log("error in fetching proposal!");
      }
    };

    const checkVoted = async () => {
      try {
        const v = await contract.methods
          .userHasVoted(proposalID, accounts[0])
          .call();
        console.log("user voted", v);
        setVoted(v);
      } catch (err) {
        console.log("user voted err", err);
      }
    };

    const fetchData = async () => {
      if (remainingCredits === undefined && contract !== null) {
        await getRemainingCredits();
      }
      if (voted === undefined && contract !== null) {
        await checkVoted();
      }
    };
    fetchData();
  });

  const handleCasteButton = async () => {
    console.log("votesList", votesList);

    if (votesList.length !== noOfOptions) {
      return toast.error("Please vote to all the candidates. ");
    }
    try {
      const res = await contract.methods
        .castVote(proposalID, votesList)
        .send({ from: accounts[0] });

      console.log("res from castVote", res);
      if (res) {
        toast.success("Your votes are successfully casted ...");
        setVoted(true);
      }
    } catch (err) {
      //toast.err("Error in Vote Casting !!");
      console.log("Proposal has expired");
      toast.error("There is some error in casting your vote!!");
    }
  };

  const handleVoteInput = (e, index) => {
    if (isComplete) {
      toast.error("Proposal is ended..");
      return (e.target.value = null);
    }
    let name = e.target.name;
    let newValue = e.target.value;
    let sQ = newValue * newValue;

    let rc = remainingCredits + subQuantity - sQ;
    console.log(
      "subQuantity",
      subQuantity,
      "sQ",
      sQ,
      "remaing credit",
      remainingCredits,
      "totalCredits",
      totalCredits
    );
    if (totalCredits === 0 || totalCredits === null) {
      toast.error("You don't have credits to vote..");
      return (e.target.value = null);
    }
    if (rc < 0) {
      return toast.error(
        "You'll exceed the remaining credits, you can't vote more"
      );
    }

    votesList[index] = Number(newValue);

    setVotesList(votesList);
    setRemainingCredits(rc);
    setSubQuantity(sQ);
  };

  const VoteContainer = ({ key, index, optionName }) => {
    return (
      <div className="voteContainer" key={key}>
        <div className="descriptionContainer">
          <h3>{optionName}</h3>
        </div>

        <div className="voteToCandidate">
          <div className="voteInputBox" id={index}>
            <input
              type="number"
              value={votesList[index]}
              placeholder="Vote"
              min={0}
              name={index}
              onFocus={(e) => setSubQuantity(e.target.value * e.target.value)}
              onChange={(e) => {
                return handleVoteInput(e, index);
              }}
            />
          </div>
        </div>

        <div className="usedCreditContainer">
          <div className="usedCredit">
            <p>Credits Used: {votesList[index] * votesList[index]}</p>
          </div>
        </div>
      </div>
    );
  };

  const VoteContainerList = arr.map((number) => {
    let index = number - 1;
    let optionName = optionsList[index];
    return VoteContainer({ key: number, index: index, optionName: optionName });
  });

  const CastVoteContainer = () => {
    return (
      <div className="castVote" id={proposalID}>
        <br />
        <div className="proposalInfo">
          <h2>{description}</h2>
          <p></p>
        </div>
        {VoteContainerList}
        <div className="button-container">
          <div className="castButton" onClick={handleCasteButton}>
            <p>CAST</p>
          </div>
        </div>
      </div>
    );
  };

  // Renderer callback with condition
  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      setIsComplete(true);
    }
    // Render a countdown
    return (
      <span>
        Time-Left {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
      </span>
    );
  };

  return (
    <div>
      <div className="creditsLeft">
        <p style={{ fontSize: "20px" }}>
          Remaining credits: {remainingCredits}
        </p>
      </div>

      <Countdown date={expTime * 1000} renderer={renderer} />

      {CastVoteContainer()}
      {!isComplete && voted ? (
        <p>
          <b>Waiting for result...</b>
        </p>
      ) : (
        <></>
      )}

      {isComplete && (
        <Winner proposaID={proposalID} optionsList={optionsList} />
      )}
    </div>
  );
}
