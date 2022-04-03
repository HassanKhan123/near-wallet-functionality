import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import * as web3 from "@solana/web3.js";
import b58 from "b58";
import * as Bip39 from "bip39";

import {
  accountFromSeed,
  decryptMessage,
  encryptMessage,
  fetchBalance,
  getStorageSyncValue,
  handleAirdrop,
  initialTasks,
  setStorageSyncValue,
  showAllHoldings,
} from "../../utils/utilsUpdated";
import {
  SHOW_ALL_CUSTOM_TOKENS,
  SWITCH_ACCOUNT,
} from "../../redux/actionTypes";
import {
  COMMITMENT,
  CONFIG,
  CURRENT_NETWORK,
  SOLANA_SYMBOL,
} from "../../constants";
import { fetchUsdRateOfTokens } from "../../redux/actions/walletActions";
import { connect } from "near-api-js";

let near;

const Dashboard = () => {
  const [privateKey, setPrivateKey] = useState("");
  const [address, setAddress] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");

  const [balance, setBalance] = useState(0);

  const currentWalletName = useSelector(
    ({ walletEncrypted }) => walletEncrypted?.currentWalletName
  );
  const allTokens = useSelector(
    ({ walletEncrypted }) => walletEncrypted?.allTokens
  );

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      near = await connect(CONFIG);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { address, mnemonic, secret, accountID } = await initialTasks(
        currentWalletName
      );
      const account = await near.account(accountID);
      const availableBalance = await fetchBalance(account);
      const allTokens = await showAllHoldings(accountID, near);
      dispatch({
        type: SHOW_ALL_CUSTOM_TOKENS,
        payload: allTokens,
      });

      setAddress(address);
      setPrivateKey(secret);
      setSeedPhrase(mnemonic);
      setBalance(availableBalance);
    })();
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     if (keypair.publicKey) {
  //       try {
  //         let balance = await fetchBalance(CURRENT_NETWORK, keypair.publicKey);
  //         setBalance(balance);
  //       } catch (error) {
  //         console.log("ERR===", error);
  //       }
  //     }
  //   })();
  // }, [airdropLoading, keypair.publicKey]);

  return (
    <>
      <h3 style={{ overflowWrap: "break-word" }}>PRIVATE KEY: {privateKey}</h3>
      <h3 style={{ overflowWrap: "break-word" }}>Address: {address}</h3>
      <h3>SEED PHRASE: {seedPhrase}</h3>

      {/* <select onChange={e => changeAccount(e)}>
        {Object.keys(allAccounts).map((add, i) => (
          <option key={i} value={add}>
            {add}
          </option>
        ))}
      </select> */}

      <h4>NEAR Balance: {balance} NEAR</h4>
      <Link to="/send">
        <button>Send</button>
      </Link>

      {/* <button onClick={createAccount}>Create Account</button>
      <Link to="/import-account">
        <button>Import Account</button>
      </Link> */}

      <h2>Your Holdings</h2>
      <ul>
        {allTokens?.map(tk => (
          <li key={tk.address}>
            {tk.name} - {tk.balance} {tk.symbol}
          </li>
        ))}
      </ul>
    </>
  );
};

export default Dashboard;
