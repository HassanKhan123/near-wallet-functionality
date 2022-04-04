import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  encryptMessage,
  getAccountIds,
  getStorageSyncValue,
  setStorageSyncValue,
} from "../../utils/utilsUpdated";
import { parseSeedPhrase } from "near-seed-phrase";
import { KeyPair, keyStores } from "near-api-js";
import { PublicKey } from "near-api-js/lib/utils";

const ImportAccount = () => {
  const [loading, setLoading] = useState(false);
  const [phrase, setPhrase] = useState("");

  const navigate = useNavigate();

  const importAccount = async () => {
    try {
      const { secretKey, seedPhrase } = parseSeedPhrase(phrase);

      const keyPair = KeyPair.fromString(secretKey);
      const publicKey = keyPair.publicKey.toString();

      const accountIdsByPublickKey = await getAccountIds(publicKey);
      if (!phrase) return;
      setLoading(true);

      let isExist = false;
      let userInfo = await getStorageSyncValue("userInfo");
      for (let info in userInfo) {
        if (userInfo[info].accountID === accountIdsByPublickKey) {
          isExist = true;
        }
      }

      if (isExist) {
        alert("Account already imported");
        setLoading(false);
        return;
      }
      let hashedPassword = await getStorageSyncValue("hashedPassword");
      const cipherPrivateKey = encryptMessage(secretKey, hashedPassword);
      const cipherPhrase = encryptMessage(seedPhrase, hashedPassword);
      let keys = userInfo ? Object.keys(userInfo) : null;
      let walletName = `wallet${keys.length + 1}`;
      userInfo = {
        ...userInfo,
        [walletName]: {
          name: walletName,
          accountID: accountIdsByPublickKey,
          accounts: {
            [publicKey]: {
              data: cipherPhrase,
              address: publicKey,
              secretKey: cipherPrivateKey,
            },
          },
        },
      };

      await setStorageSyncValue("userInfo", userInfo);
      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      console.log("err===", error.message);
      setLoading(false);
      alert(error.message);
    }
  };

  return (
    <div>
      <h3>Import Account from Private Key</h3>
      <input value={phrase} onChange={e => setPhrase(e.target.value)} />
      {loading ? (
        <p>Loading!!!</p>
      ) : (
        <button onClick={importAccount}>Import</button>
      )}
      <button style={{ marginTop: 10 }} onClick={() => navigate("/dashboard")}>
        {" "}
        {"<"} Go Back
      </button>
    </div>
  );
};

export default ImportAccount;
