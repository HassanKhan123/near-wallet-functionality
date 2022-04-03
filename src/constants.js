/*global chrome*/
import { keyStores } from "near-api-js";

export const CURRENTLY_IN_DEVELOPMENT = true;

export const OPEN_IN_WEB = chrome.storage ? false : true;

export const STORAGE = OPEN_IN_WEB ? undefined : chrome.storage.sync;
export const COMMITMENT = "confirmed";
export const SOLANA_SYMBOL = "solana";
export const CACHE_TIME = 60000;
export const USD_CACHE_TIME = 120000;

export const CURRENT_NETWORK = "testnet";
export const CONFIG = {
  networkId: CURRENT_NETWORK,
  keyStore: new keyStores.InMemoryKeyStore(),
  nodeUrl: `https://rpc.${CURRENT_NETWORK}.near.org`,
  walletUrl: `https://wallet.${CURRENT_NETWORK}.near.org`,
  helperUrl: `https://helper.${CURRENT_NETWORK}.near.org`,
  explorerUrl: `https://explorer.${CURRENT_NETWORK}.near.org`,
};
