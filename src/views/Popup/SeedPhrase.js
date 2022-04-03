import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  CREATE_WALLET,
  SET_CURRENT_WALLET_NAME,
} from "../../redux/actionTypes";
import {
  decryptMessage,
  encryptMessage,
  generateSeed,
  getStorageSyncValue,
  setStorageSyncValue,
} from "../../utils/utilsUpdated";

const Seedphrase = () => {
  const [mnemonics, setMnemonics] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    setMnemonicPhrase();
  }, []);

  const setMnemonicPhrase = async () => {
    const { phrase, address, secret } = generateSeed();
    setMnemonics(phrase);
    const hashedPassword = await getStorageSyncValue("hashedPassword");
    const cipherMnemonic = encryptMessage(phrase, hashedPassword);
    const cipherPrivate = encryptMessage(secret, hashedPassword);

    let userInfo = {
      wallet1: {
        name: "wallet1",
        accounts: {
          [address]: {
            data: cipherMnemonic,
            address: address,
            secretKey: cipherPrivate,
          },
        },
      },
    };

    dispatch({
      type: CREATE_WALLET,
      payload: {
        isLoggedIn: true,
      },
    });
    localStorage.setItem("wallet", true);
    dispatch({ type: SET_CURRENT_WALLET_NAME, payload: "wallet1" });
    await setStorageSyncValue("userInfo", userInfo);
  };

  return (
    <div>
      <h1>Seed Phrase</h1>
      <h2>{mnemonics}</h2>

      <Link to="/reserve-account-id">
        <button>Next</button>
      </Link>
    </div>
  );
};

export default Seedphrase;
