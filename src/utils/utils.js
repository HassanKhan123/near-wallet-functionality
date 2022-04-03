// import axios from "axios";
// import { ethers } from "ethers";
// import Web3 from "web3";

// import {
//   BINANCE_OX_API,
//   BSC_SWAP_TOKENS_API,
//   ETHEREUM_OX_API,
//   GET_GAS_PRICE,
//   NATIVE_TOKEN_ADDRESS,
//   OPEN_IN_WEB,
//   POLYGON_OX_API,
//   POLYGON_SWAP_TOKENS_API,
//   SONAR_WALLET_ADDRESS,
//   STORAGE,
//   USD_CACHE_TIME,
// } from "../constants";
// import tokens from "../tokens.json";
// import { endpoint, getUSDPrice } from "../queries/query";

// import { abi } from "../abis/erc20abi.json";

// export const decrypt = async (data, hashedPassword) => {
//   try {
//     let decryptData = await ethers.Wallet.fromEncryptedJson(
//       data,
//       hashedPassword
//     );
//     return decryptData;
//   } catch (error) {
//     console.log(error);
//     return "";
//   }
// };

// export const fetchRates = async (coinId) => {
//   const { data } = await axios.get(
//     `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
//   );

//   let id = coinId;

//   return data.hasOwnProperty(id.toLowerCase()) ? data[id.toLowerCase()].usd : 0;
// };

// export const fetchAllHoldingTokens = async (
//   address,
//   url,
//   key,
//   nodeURL,
//   wrappedTokenPrice,
//   network,
//   wrappedAddress
// ) => {
//   const web3 = new Web3(nodeURL);
//   let response;
//   const txHistory = JSON.parse(
//     localStorage.getItem(network + "txHistory" + address)
//   );
//   const now = new Date();
//   let obj = {};
//   let erc20 = [];
//   console.log("TX============", txHistory);
//   if (txHistory && txHistory.expiry > now.getTime()) {
//     response = JSON.parse(txHistory.data);
//   } else {
//     response = await axios.get(
//       `${url}?module=account&action=tokentx&address=${address}&sort=asc&apikey=${key}`
//     );
//     console.log("RES==========================", response.data);
//     setDataWithExpiry(
//       network + "txHistory" + address,
//       JSON.stringify(response),
//       USD_CACHE_TIME
//     );
//   }

//   const { result } = response.data;
//   if (result.length > 0) {
//     erc20 = await Promise.all(
//       result.map(async (res) => {
//         if (!obj[res.contractAddress]) {
//           obj[res.contractAddress] = {
//             tokenName: res.tokenName,
//             tokenSymbol: res.tokenSymbol,
//             tokenDecimal: res.tokenDecimal,
//           };
//           const contract = new web3.eth.Contract(abi, res.contractAddress);
//           const tokenBalance = await contract.methods.balanceOf(address).call();
//           if (Number(tokenBalance) && res.tokenName) {
//             return {
//               tokenName: res.tokenName,
//               tokenSymbol: res.tokenSymbol,
//               tokenBalance:
//                 Number(tokenBalance) / 10 ** Number(res.tokenDecimal),
//               tokenAddress: res.contractAddress,
//               tokenDecimal: res.tokenDecimal,
//             };
//           }
//         }
//       })
//     );

//     let filtered = [];

//     erc20?.map((tk) => {
//       if (tk) {
//         filtered.push(tk);
//       }
//     });
//     let updatedData;
//     console.log("FILTER==========", filtered);
//     if (filtered.length > 20) {
//       filtered = filtered.splice(0, 15);
//     }
//     updatedData = await calculateUsdPrice(
//       filtered,
//       wrappedTokenPrice,
//       network,
//       wrappedAddress
//     );

//     return updatedData;
//   } else {
//     return [{ priceInUSD: 0 }];
//   }
// };

// export const fetchChainBalance = async (
//   address,
//   chainAPI,
//   chainAPIkey,
//   web3
// ) => {
//   const balance = await web3.eth.getBalance(address);

//   return ethers.utils.formatUnits(balance);
// };

// export const getGasPrice = async () => {
//   const { data } = await axios.get(GET_GAS_PRICE);
//   return data;
// };

// export const fetchBEPTokenData = async (address) => {
//   console.log("custom token");
//   // try {
//   //   let web3 = new Web3(
//   //     new Web3.providers.HttpProvider(
//   //       // BSC_MAINNET_NODE_URL
//   //       ETH_MAINNET_NODE_URL
//   //     )
//   //   );
//   //   const { data } = await axios.get(
//   //     `${ETHERSCAN_MAINNET_API}?module=contract&action=getabi&address=${address}&apikey=${ETHERSCAN_API_KEY}`
//   //   );
//   //   var contractABI = '';
//   //   contractABI = JSON.parse(data.result);
//   //   if (contractABI != '') {
//   //     var MyContract = new web3.eth.Contract(contractABI, address);

//   //     const [sym, deci, name] = await Promise.all([
//   //       MyContract.methods.symbol().call(),
//   //       MyContract.methods.decimals().call(),
//   //       MyContract.methods.name().call(),
//   //     ]);
//   //     return { sym, deci, name };
//   //   } else {
//   //     console.log('Error');
//   //   }
//   // } catch (error) {
//   //   console.log('ERROR===', error);
//   //   throw error;
//   // }
// };

// export const balanceInThatChain = async (
//   address,
//   nativeTokenNetwork,
//   chainAPI,
//   chainAPIkey,
//   web3
// ) => {
//   const usdRate = await fetchUsdRate(nativeTokenNetwork);
//   const balance = await fetchChainBalance(address, chainAPI, chainAPIkey, web3);
//   return {
//     balance,
//     balanceInUSD: usdRate * balance,
//   };
// };

// export const totalBalanceInThatChain = async (
//   addresses,
//   nativeTokenNetwork,
//   nativeTokenSymbol,
//   chainAPI,
//   chainAPIkey,
//   nodeURL,
//   wethToken,
//   wethTokenAddress,
//   web3
// ) => {
//   let sum = 0;
//   let balance = 0;
//   const tokenRate = await fetchUsdRate(nativeTokenNetwork);

//   let thatChainTokens = [];
//   for (let i in addresses) {
//     balance += Number(
//       await fetchChainBalance(addresses[i], chainAPI, chainAPIkey, web3)
//     );
//     let tokens = await fetchAllHoldingTokens(
//       addresses[i],
//       chainAPI,
//       chainAPIkey,
//       nodeURL,
//       wethToken,
//       nativeTokenSymbol,
//       wethTokenAddress
//     );

//     thatChainTokens.push(...tokens);

//     for (let i = 0; i < tokens.length; i++) {
//       const tk = tokens[i];
//       tk.priceInUSD ? (sum += Number(tk.priceInUSD)) : (sum += 0);
//     }
//   }

//   console.log("CHAIN=============", thatChainTokens);
//   return {
//     totalSum: Number(sum + tokenRate * balance),
//     tokens: thatChainTokens,
//   };
// };

// export const getSwapQuote = async (
//   buyToken,
//   sellToken,
//   amount,
//   takerAddress,
//   network,
//   isReflection
// ) => {
//   try {
//     let BASE_URL =
//       network === "homestead" || network === "ropsten"
//         ? ETHEREUM_OX_API
//         : network === "Polygon"
//         ? POLYGON_OX_API
//         : network === "Binance Smart Chain"
//         ? BINANCE_OX_API
//         : ETHEREUM_OX_API;
//     const { data } = await axios.get(
//       `${BASE_URL}/swap/v1/quote?takerAddress=${takerAddress}&buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${amount}&feeRecipient=${SONAR_WALLET_ADDRESS}&buyTokenPercentageFee=0.0025&skipValidation=true${
//         isReflection ? "&includedSources=PancakeSwap_V2,Uniswap" : ""
//       }`
//     );
//     data.gas = (Number(data.gas) * 4).toString();
//     return data;
//   } catch (error) {
//     console.log("error in swap quote ===", error.response);
//     if (error?.response?.data?.validationErrors?.length > 0) {
//       throw new Error(error?.response?.data?.validationErrors[0].reason);
//     }
//     if (error?.response?.data?.reason) {
//       throw new Error(error?.response?.data?.reason);
//     }
//     throw error;
//   }
// };

// export const getSwapTokens = async (network) => {
//   let url =
//     network === "homestead" || network === "ropsten"
//       ? `${ETHEREUM_OX_API}/swap/v1/tokens`
//       : network === "Polygon"
//       ? POLYGON_SWAP_TOKENS_API
//       : network === "Binance Smart Chain"
//       ? BSC_SWAP_TOKENS_API
//       : `${ETHEREUM_OX_API}/swap/v1/tokens`;
//   try {
//     const { data } = await axios.get(url);
//     return data.tokens || data.records;
//   } catch (error) {
//     console.log("error in swap quote ===", error);
//     throw error;
//   }
// };

// export const setDataWithExpiry = (key, data, expiry) => {
//   const now = new Date();

//   const item = {
//     data,
//     expiry: now.getTime() + expiry,
//   };
//   localStorage.setItem(key, JSON.stringify(item));
// };

// export const calculateUsdPrice = async (
//   data,
//   wrappedTokenPrice,
//   network,
//   wrappedAddress
// ) => {
//   return Promise.all(
//     data.map(async (d) => {
//       let symbol = d.tokenSymbol.toLowerCase();
//       let tokenPrice = JSON.parse(localStorage.getItem(symbol));
//       const now = new Date();

//       if (tokenPrice && tokenPrice.expiry > now.getTime()) {
//         console.log("FROM LOCAL=================");
//         d.priceInUSD = Number(d.tokenBalance) * Number(tokenPrice.data);
//       } else {
//         console.log("FROM API=====================");

//         // if (tokens[symbol]) {

//         const { data } = await axios.post(
//           endpoint,
//           {
//             query: getUSDPrice,
//             variables: {
//               network,
//               baseCurrency: d.tokenAddress,
//               quoteCurrency: wrappedAddress,
//             },
//             mode: "cors",
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//               "X-API-KEY": "BQYlfqc4mq1cfynsOXl42Bh8MfMsxMO6",
//             },
//           }
//         );
//         console.log("RESPONSE====================", data);
//         console.log("WRAPPED PRICE====================", wrappedTokenPrice);

//         let dexTrades = data.data.ethereum.dexTrades;
//         if (dexTrades && dexTrades.length > 0) {
//           let pairPrice = Number(dexTrades[0].quotePrice);
//           let usdPrice = pairPrice * wrappedTokenPrice;
//           d.priceInUSD = Number(usdPrice * d.tokenBalance).toFixed(4);
//           console.log(d.priceInUSD, typeof d.priceInUSD);
//           setDataWithExpiry(symbol, usdPrice, USD_CACHE_TIME);
//         } else if (tokens[symbol]) {
//           let usdPrice = await fetchRates(tokens[symbol].id);
//           d.priceInUSD = (Number(d.tokenBalance) * Number(usdPrice)).toFixed(4);
//           setDataWithExpiry(symbol, usdPrice, USD_CACHE_TIME);
//         } else {
//           d.priceInUSD = 0;
//         }
//       }

//       return d;
//     })
//   );
// };

// export const getStorageSyncValue = async (keyName) => {
//   try {
//     if (OPEN_IN_WEB) {
//       return new Promise((resolve, reject) => {
//         const item = localStorage.getItem(keyName);
//         resolve(JSON.parse(item));
//       });
//     }
//     return new Promise((resolve, reject) => {
//       STORAGE?.get([keyName], function (extractedValue) {
//         resolve(extractedValue[keyName]);
//       });
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// export const setStorageSyncValue = async (keyName, value) => {
//   try {
//     if (OPEN_IN_WEB) {
//       return new Promise((resolve, reject) => {
//         localStorage.setItem(keyName, JSON.stringify(value));
//         resolve();
//       });
//     }
//     return new Promise((resolve, reject) => {
//       STORAGE?.set({ [keyName]: value }, function () {
//         resolve();
//       });
//     });
//   } catch (error) {
//     console.log("error setting the sync storage ", error);
//   }
// };

// export const getBalanceFromContract = async (contract, address) => {
//   let balance = await contract.methods.balanceOf(address).call();
//   let numOfDecimals = await contract.methods.decimals().call();
//   var adjustedBalance = balance / Math.pow(10, numOfDecimals);
//   return adjustedBalance;
// };

// export const convertBalanceToBaseUnit = async (contract, value) => {
//   let numOfDecimals = await contract.methods.decimals().call();
//   let convertedValue = parseFloat(value) * Math.pow(10, numOfDecimals);
//   return convertedValue.toString();
// };

// export const mergeDuplicateTokensIntoSingle = (tokens) => {
//   let filteredTokens = {};
//   tokens.forEach((token) => {
//     if (!token["tokenSymbol"]) {
//       return;
//     }
//     let key = filteredTokens[token["tokenSymbol"]];
//     if (!key) {
//       filteredTokens[token["tokenSymbol"]] = { ...token };
//     } else {
//       filteredTokens[token["tokenSymbol"]]["tokenBalance"] +=
//         token["tokenBalance"];
//       filteredTokens[token["tokenSymbol"]]["priceInUSD"] += token["priceInUSD"];
//     }
//   });
//   console.log("filteredTokens", filteredTokens);
//   return Object.values(filteredTokens);
// };

// export const fetchUsdRate = async (symbol) => {
//   let usdRate;
//   let tokenPrice = JSON.parse(localStorage.getItem(symbol));
//   const now = new Date();

//   if (tokenPrice && tokenPrice.expiry > now.getTime()) {
//     console.log("FROM LOCAL=================");
//     usdRate = Number(tokenPrice.data);
//   } else {
//     usdRate = await fetchRates(symbol);

//     setDataWithExpiry(symbol, usdRate, USD_CACHE_TIME);
//   }

//   return usdRate;
// };

// export const checkAllowance = async (
//   web3,
//   abi,
//   address,
//   tokenAddress,
//   ProxyAddress
// ) => {
//   let contract;
//   let allowance;
//   if (tokenAddress && tokenAddress !== NATIVE_TOKEN_ADDRESS) {
//     contract = new web3.eth.Contract(abi, tokenAddress);
//     allowance = await contract.methods.allowance(address, ProxyAddress).call();
//     console.log("alloo=======", allowance);
//   } else {
//     allowance = 0;
//     contract = "";
//   }

//   return { allowance: Number(allowance), contract };
// };

// export const removeItemFromLocalStorage = (network, key) => {
//   let keyToRemove;
//   if (network === "homestead" || network === "ropsten") {
//     keyToRemove = `ethereumtxHistory${key}`;
//   } else if (network === "Polygon") {
//     keyToRemove = `matictxHistory${key}`;
//   } else if (network === "Binance Smart Chain") {
//     keyToRemove = `bsctxHistory${key}`;
//   } else {
//     keyToRemove = `ethereumtxHistory${key}`;
//   }

//   localStorage.removeItem(keyToRemove);
// };
