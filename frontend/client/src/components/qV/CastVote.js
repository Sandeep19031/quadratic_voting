import React, { useState, useEffect } from "react";
import "./CastVote.css";
import useEth from "../../contexts/EthContext/useEth";

export default function CastVote() {
  const {
    state: { contract, accounts, proposalID, description },
  } = useEth();

  const [voteBool, setVoteBool] = useState();
  const [yesVote, setYesVote] = useState(0);
  const [noVote, setNoVote] = useState(0);

  const handleRadioButton = (e) => {
    setVoteBool(e.target.value);
  };

  const handleVoteInputYes = (e) => {
    setYesVote(e.target.value);
  };

  const handleVoteInputNo = (e) => {
    //setNoVote(e.target.value);
  };

  const handleCasteButton = async () => {
    const mint = await contract.methods
      .mint(accounts[0], 1000)
      .send({ from: accounts[0] });
    console.log("mint res", mint);
    if (voteBool == "Yes") {
      const res = await contract.methods
<<<<<<< HEAD
        .castVote(proposalID, yesVote, true)
=======
        .castVote(1, yesVote, true)
>>>>>>> f6e08abe85e8bdf9d78a1cf373e0602d77bf433d
        .send({ from: accounts[0] });

      console.log("castvote res", res);
    } else if (voteBool == "No") {
      const res = await contract.methods
        .castVote(proposalID, noVote, false)
        .send({ from: accounts[0] });
    }
  };
  return (
    <div className="castVote" id={proposalID}>
      <div className="voteContainer">
        <div className="descriptionContainer">
          <h2>{description}</h2>
        </div>

        <div className="voteToCandidate">
          <div className="radioClass" onChange={handleRadioButton}>
            <input type="radio" value="Yes" name="vote" /> Yes
            <input type="radio" value="No" name="vote" /> No
          </div>

          {voteBool == "Yes" ? (
            <div className="voteInputBoxYes">
              <input
                type="number"
                value={yesVote}
                placeholder="Vote"
                min={0}
                onChange={handleVoteInputYes}
              />
            </div>
          ) : (
            <div className="voteInputBoxNo">
              <input
                type="number"
                value={noVote}
                placeholder="Vote"
                min={0}
                onChange={handleVoteInputNo}
              />
            </div>
          )}
        </div>
      </div>

      <div className="button-container">
        <div className="castButton" onClick={handleCasteButton}>
          <p>CAST</p>
        </div>
      </div>
    </div>
  );
}
