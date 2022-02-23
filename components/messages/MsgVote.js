import React, { useState } from "react";

import { useAppContext } from "../../context/AppContext";
import Input from "../../components/inputs/Input";
import Select from "../../components/inputs/Select";
import { checkAddress, exampleAddress } from "../../lib/displayHelpers";

// https://docs.cosmos.network/v0.44/core/proto-docs.html#cosmos.gov.v1beta1.VoteOption
const voteOptions = [
  { label: "Unspecified", value: 0 },
  { label: "Yes", value: 1 },
];
/*
  Unspecified: 0,
  Yes: 0,
  Abstain: 0,
  No: 0,
  "No With Veto": 0,
};
*/

const MsgVote = (props) => {
  const onMsgChange = props.onMsgChange || (() => {});
  const onCheck = props.onCheck || (() => {});
  const { state } = useAppContext();
  const [voterError, setVoterError] = useState("");
  // const [amountError, setAmountError] = useState("");

  function checkMsg(msg, updateInternalErrors) {
    if (!msg) return false;
    if (!msg.typeUrl) return false;
    if (!msg.value) return false;

    const v = msg.value;
    if (!v.proposalId) return false;
    if (!v.voter) return false;

    const toVoterError = checkAddress(v.voter, state.chain.addressPrefix);
    if (updateInternalErrors) {
      if (toVoterError) {
        const errorMsg = `Invalid voter address for network ${state.chain.chainId}: ${toVoterError}`;
        setVoterError(errorMsg);
      } else {
        setVoterError("");
      }
    }

    return true;
  }

  function checkAndSetDecision(decision) {
    const newMsg = JSON.parse(JSON.stringify(props.msg));
    newMsg.value.option = decision;
    onMsgChange(newMsg);
    onCheck(checkMsg(newMsg, true));
  }

  function checkAndSetProposalId(proposalId) {
    const newMsg = JSON.parse(JSON.stringify(props.msg));
    newMsg.value.proposalId = proposalId;
    onMsgChange(newMsg);
    onCheck(checkMsg(newMsg, true));
  }

  return (
    <div>
      <h2>Vote on Proposal</h2>
      <div className="form-item">
        <Input
          label="Voter"
          name="voter"
          value={props.msg.value.voter}
          disabled={true}
          error={voterError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Proposal ID"
          name="proposalId"
          type="text"
          value={props.msg.value.proposalId}
          onChange={(val) => checkAndSetProposalId(val)}
        />
      </div>
      <div className="form-item">
        <Select
          label={`Decision`}
          name="option"
          options={voteOptions}
          value={props.msg.value.option}
          onChange={(opt) => checkAndSetDecision(opt.value)}
        />
      </div>
      <style jsx>{`
        p {
          margin-top: 15px;
        }
        .form-item {
          margin-top: 1.5em;
        }
      `}</style>
    </div>
  );
};

export default MsgVote;
