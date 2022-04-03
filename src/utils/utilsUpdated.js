import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import crypto from "crypto-js";
import * as Bip39 from "bip39";
import * as web3 from "@solana/web3.js";
import b58 from "b58";
import axios from "axios";
import { TokenListProvider } from "@solana/spl-token-registry";
import * as splToken from "@solana/spl-token";
import nacl from "tweetnacl";
import * as ed25519 from "ed25519-hd-key";
import { generateSeedPhrase, parseSeedPhrase } from "near-seed-phrase";
import { KeyPair } from "near-api-js";

import tokensJSON from "../tokens.json";
import {
  COMMITMENT,
  CURRENT_NETWORK,
  OPEN_IN_WEB,
  STORAGE,
  USD_CACHE_TIME,
} from "../constants";

export const getStorageSyncValue = async keyName => {
  try {
    if (OPEN_IN_WEB) {
      return new Promise((resolve, reject) => {
        const item = localStorage.getItem(keyName);
        resolve(JSON.parse(item));
      });
    }
    return new Promise((resolve, reject) => {
      STORAGE?.get([keyName], function (extractedValue) {
        resolve(JSON.parse(extractedValue[keyName]));
      });
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const setStorageSyncValue = async (keyName, value) => {
  try {
    if (OPEN_IN_WEB) {
      return new Promise((resolve, reject) => {
        localStorage.setItem(keyName, JSON.stringify(value));
        resolve();
      });
    }
    return new Promise((resolve, reject) => {
      STORAGE?.set({ [keyName]: JSON.stringify(value) }, function () {
        resolve();
      });
    });
  } catch (error) {
    console.log("error setting the sync storage ", error);
  }
};

export const encryptMessage = (message, secret) => {
  const ciphertext = crypto.AES.encrypt(
    JSON.stringify(message),
    secret
  ).toString();

  return ciphertext;
};

export const decryptMessage = (cipherText, secret) => {
  let bytes = crypto.AES.decrypt(cipherText, secret);
  let decryptedText = JSON.parse(bytes.toString(crypto.enc.Utf8));

  return decryptedText;
};

export const handleAirdrop = async (network, publicKey) => {
  console.log("air===", publicKey, new Uint8Array(publicKey));
  if (!publicKey) return;

  try {
    const connection = new Connection(clusterApiUrl(network), COMMITMENT);
    const confirmation = await connection.requestAirdrop(
      publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(confirmation, COMMITMENT);
    return await fetchBalance(network, publicKey);
  } catch (error) {
    console.log(error);
    return;
  }
};

export const initialTasks = async (
  currentWalletName,
  currentAccountAddress = ""
) => {
  let userInfo = await getStorageSyncValue("userInfo");
  console.log("info=========", userInfo, currentWalletName);
  let accountsList = userInfo[currentWalletName]["accounts"];
  let firstUser = currentAccountAddress
    ? accountsList[currentAccountAddress]
    : accountsList[Object.keys(accountsList)[0]];

  let { data, secretKey, address, accountID } = firstUser;
  let hashedPassword = await getStorageSyncValue("hashedPassword");
  console.log("DEC-----", data, secretKey);
  const mnemonic = await decryptMessage(data, hashedPassword);
  const privateKey = await decryptMessage(secretKey, hashedPassword);

  return {
    firstUser,
    secret: privateKey,
    mnemonic,
    address,
    accountID,
  };
};

const fetchTokens = async ({ account }) => {
  console.log("a", account);
  let address = account.data.parsed.info.mint;
  let { data } = await axios.get(
    "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json"
  );
  let tokenList = data.tokens;
  // return new TokenListProvider().resolve().then(tokens => {

  tokenList = await Promise.all(
    tokenList
      .filter(tk => tk.address === address)
      .map(async tk => {
        if (tk.address === address) {
          tk.amount = account.data.parsed.info.tokenAmount.uiAmount;
          let symbol = tk.symbol.toLowerCase();

          if (tokensJSON[symbol]) {
            let usdPrice = await fetchRates(tokensJSON[symbol].id);
            console.log("USD========", usdPrice);
            tk.priceInUSD = (Number(tk.amount) * Number(usdPrice)).toFixed(4);
            setDataWithExpiry(symbol, usdPrice, USD_CACHE_TIME);
          }
          return tk;
        }
      })
  );
  return tokenList.length > 0 ? tokenList : [];
  // });
};

export const showAllHoldings = async (accountID, near) => {
  const { data } = await axios.get(
    `https://helper.testnet.near.org/account/${accountID}/likelyTokens`
  );

  const account = await near.account(accountID);
  let tokensInfo = [];

  await Promise.all(
    data.map(async token => {
      let tokenInfo = await account.viewFunction(token, "ft_metadata", {
        account_id: accountID,
      });

      let balance = await account.viewFunction(token, "ft_balance_of", {
        account_id: accountID,
      });

      tokensInfo.push({
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        balance: balance / 10 ** tokenInfo.decimals,
        contractName: token,
        decimals: tokenInfo.decimals,
      });
    })
  );

  return tokensInfo;
};

export const fetchUsdRate = async symbol => {
  let usdRate;
  let tokenPrice = JSON.parse(localStorage.getItem(symbol));
  const now = new Date();

  if (tokenPrice && tokenPrice.expiry > now.getTime()) {
    console.log("FROM LOCAL=================");
    usdRate = Number(tokenPrice.data);
  } else {
    usdRate = await fetchRates(symbol);

    setDataWithExpiry(symbol, usdRate, USD_CACHE_TIME);
  }

  return usdRate;
};

export const fetchRates = async coinId => {
  const { data } = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
  );

  let id = coinId;

  return data.hasOwnProperty(id.toLowerCase()) ? data[id.toLowerCase()].usd : 0;
};

export const setDataWithExpiry = (key, data, expiry) => {
  const now = new Date();

  const item = {
    data,
    expiry: now.getTime() + expiry,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const accountFromSeed = (seed, walletIndex) => {
  const derivedSeed = deriveSeed(seed, walletIndex);
  console.log("DER---------", derivedSeed);
  const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);

  const acc = new web3.Keypair(keyPair);
  return acc;
};

export const deriveSeed = (seed, walletIndex) => {
  try {
    console.log("seed----------", seed);
    const path44Change = `m/44'/501'/${walletIndex}'/0'`;
    return ed25519.derivePath(path44Change, seed).key;
  } catch (error) {
    console.log("err===", error);
  }
};

export const generateSeed = entropy => {
  const { seedPhrase, publicKey, secretKey } = generateSeedPhrase();
  const recoveryKeyPair = KeyPair.fromString(secretKey);
  return {
    phrase: seedPhrase,
    address: recoveryKeyPair.getPublicKey().toString(),
    secret: recoveryKeyPair.secretKey,
  };
};

export const checkAccountStatus = async accountInfo => {
  try {
    await accountInfo.state();
    return true;
  } catch (error) {
    console.log("er=====", error);
    return false;
  }
};

export const fetchBalance = async account => {
  const balance = await account.getAccountBalance();
  console.log("BAL======", balance);
  return balance.available / 10 ** 24;
};
