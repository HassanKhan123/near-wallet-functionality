import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as Bip39 from "bip39";
import { Keypair } from "@solana/web3.js";
import { useNavigate } from "react-router-dom";
import b58 from "b58";

import {
  CREATE_WALLET,
  IMPORT_WALLET,
  SET_CURRENT_WALLET_NAME,
} from "../../redux/actionTypes";
import { encryptMessage, setStorageSyncValue } from "../../utils/utilsUpdated";

const Recover = () => {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onRecover = async () => {
    if (!password) {
      alert("Password is required");
    } else {
      try {
        setLoading(true);
        const inputMnemonic = seedPhrase.trim().toLowerCase();
        const split = seedPhrase.split(" ");
        if (split.length === 1) {
          throw new Error("Invalid Seed Phrase");
        }
        const seed = Bip39.mnemonicToSeedSync(inputMnemonic).slice(0, 32);
        const ciphertext = encryptMessage(inputMnemonic, password);
        const importedAccount = Keypair.fromSeed(seed);
        let cipherKey = encryptMessage(
          b58.encode(importedAccount.secretKey),
          password
        );
        let userInfo = {
          wallet1: {
            name: "wallet1",
            accounts: {
              [importedAccount.publicKey]: {
                data: ciphertext,
                address: importedAccount.publicKey,
                secretKey: cipherKey,
                keypair: importedAccount,
              },
            },
          },
        };
        dispatch({
          type: IMPORT_WALLET,
          payload: {
            walletImported: true,
          },
        });
        dispatch({
          type: CREATE_WALLET,
          payload: {
            isLoggedIn: true,
          },
        });
        dispatch({
          type: SET_CURRENT_WALLET_NAME,
          payload: "wallet1",
        });

        await setStorageSyncValue("userInfo", userInfo);
        await setStorageSyncValue("hashedPassword", password);
        await setStorageSyncValue("accounts", 0);
        localStorage.setItem("wallet", true);
        navigate("/dashboard");
      } catch (error) {
        setLoading(false);
        alert(error.message);
      }
    }
  };

  return (
    <div>
      <h3>Enter seed phrase</h3>
      <input value={seedPhrase} onChange={e => setSeedPhrase(e.target.value)} />
      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Enter Password"
        type="password"
      />
      {loading ? (
        <p>Loading!!</p>
      ) : (
        <button onClick={onRecover}>Recover</button>
      )}
      <button style={{ marginTop: 10 }} onClick={() => navigate("/popup.html")}>
        {" "}
        {"<"} Go Back
      </button>
    </div>
  );
};

export default Recover;
