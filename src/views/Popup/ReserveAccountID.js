import React, { useState } from "react";
import { connect } from "near-api-js";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { CONFIG } from "../../constants";
import {
  checkAccountStatus,
  getStorageSyncValue,
  setStorageSyncValue,
} from "../../utils/utilsUpdated";

const ReserveAccountID = () => {
  const [accountID, setAccountID] = useState("");
  const navigate = useNavigate();

  const currentWalletName = useSelector(
    ({ walletEncrypted }) => walletEncrypted?.currentWalletName
  );

  const createAccountID = async () => {
    try {
      const near = await connect(CONFIG);
      const accountInfo = await near.account(accountID);
      const state = await checkAccountStatus(accountInfo);
      const userInfo = await getStorageSyncValue("userInfo");

      let publicKey = Object.keys(userInfo[currentWalletName]["accounts"])[0];
      let userDetails = userInfo[currentWalletName]["accounts"];

      if (state) {
        alert("Account with this name already present");
      } else {
        await near.createAccount(accountID, publicKey);
        userInfo[currentWalletName]["accounts"] = {
          ...userInfo[currentWalletName]["accounts"],
          [publicKey]: {
            ...userInfo[currentWalletName]["accounts"][publicKey],
            accountID,
          },
        };
        await setStorageSyncValue("userInfo", userInfo);
        alert(`Account Created!!! Your ID is ${accountID}`);
        navigate("/dashboard");
      }
    } catch (error) {
      console.log("err===", error);
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>Create Account ID</h1>

      <input
        value={accountID}
        placeholder="example.testnet"
        onChange={e => setAccountID(e.target.value)}
      />

      <button onClick={createAccountID}>Create Account ID</button>
    </div>
  );
};

export default ReserveAccountID;
