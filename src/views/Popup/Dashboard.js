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
  const [allWallets, setAllWallets] = useState([]);
  const [currentAccountID, setCurrentAccountID] = useState("");

  const currentWalletName = useSelector(
    ({ walletEncrypted }) => walletEncrypted?.currentWalletName
  );
  const allTokens = useSelector(
    ({ walletEncrypted }) => walletEncrypted?.allTokens
  );
  const activeAccount = useSelector(
    ({ walletEncrypted }) => walletEncrypted?.activeAccount
  );

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      near = await connect(CONFIG);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { address, mnemonic, secret, accountID, allAccounts } =
        await initialTasks(activeAccount);
      console.log("accc", accountID);

      let userInfo = await getStorageSyncValue("userInfo");
      const account = await near.account(accountID);
      const availableBalance = await fetchBalance(account);
      const allTokens = await showAllHoldings(accountID, near);
      let wallets = [];
      allAccounts.map(acc => {
        wallets.push(userInfo[acc]);
      });
      setAllWallets(wallets);
      dispatch({
        type: SHOW_ALL_CUSTOM_TOKENS,
        payload: allTokens,
      });

      setAddress(address);
      setPrivateKey(secret);
      setSeedPhrase(mnemonic);
      setBalance(availableBalance);
      setCurrentAccountID(accountID);
    })();
  }, [activeAccount]);

  const changeAccount = async e => {
    let [walletName, accId] = e.target.value.split(":");
    console.log("ACCC============================", accId);
    setCurrentAccountID(accId);
    dispatch({
      type: SWITCH_ACCOUNT,
      payload: {
        walletName,
      },
    });
  };

  return (
    <>
      <h3 style={{ overflowWrap: "break-word" }}>PRIVATE KEY: {privateKey}</h3>
      <h3 style={{ overflowWrap: "break-word" }}>Address: {address}</h3>
      <h3>SEED PHRASE: {seedPhrase}</h3>

      <select onChange={e => changeAccount(e)}>
        {allWallets.map((add, i) => (
          <option
            key={i}
            value={`${add.name}:${add.accountID}`}
            selected={currentAccountID}
          >
            {add.accountID}
          </option>
        ))}
      </select>

      <h4>NEAR Balance: {balance} NEAR</h4>
      <Link to="/send">
        <button>Send</button>
      </Link>

      <Link to="/seed-phrase">
        <button>Create Account</button>
      </Link>

      <Link to="/import-account">
        <button>Import Account</button>
      </Link>

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
