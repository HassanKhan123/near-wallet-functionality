import React, { useState } from "react";
import b58 from "b58";
import { Keypair } from "@solana/web3.js";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  encryptMessage,
  getStorageSyncValue,
  setStorageSyncValue,
} from "../../utils/utilsUpdated";

const ImportAccount = () => {
  const [loading, setLoading] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const currentWalletName = useSelector(
    ({ walletEncrypted }) => walletEncrypted?.currentWalletName
  );

  const navigate = useNavigate();

  const importAccount = async () => {
    try {
      if (!privateKey) return;
      setLoading(true);
      const address = b58.decode(privateKey);
      const account = Keypair.fromSecretKey(address);

      let userInfo = await getStorageSyncValue("userInfo");
      const publicKey = account.publicKey.toString();
      let addresses = Object.keys(userInfo[currentWalletName]["accounts"]);
      let isExist = false;
      addresses.map(adr => {
        if (adr.includes(account.publicKey)) isExist = true;
      });

      if (isExist) {
        alert("Private key already imported");
        setLoading(false);
        return;
      }
      let hashedPassword = await getStorageSyncValue("hashedPassword");
      const ciphertext = encryptMessage(privateKey, hashedPassword);
      userInfo[currentWalletName]["accounts"] = {
        ...userInfo[currentWalletName]["accounts"],
        [publicKey]: {
          data: ciphertext,
          address: publicKey,
          keypair: account,
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
      <input value={privateKey} onChange={e => setPrivateKey(e.target.value)} />
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
