import { fetchUsdRate } from "../../utils/utilsUpdated";
import { SET_SOLANA_USD_PRICE } from "../actionTypes";

export const fetchUsdRateOfTokens = symbol => async dispatch => {
  const usdRate = await fetchUsdRate(symbol);
  dispatch({ type: SET_SOLANA_USD_PRICE, payload: usdRate });
};
