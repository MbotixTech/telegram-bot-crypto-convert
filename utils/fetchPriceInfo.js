const axios = require('axios');
const https = require('https');
const coinNames = require('../coins/coinNames');

const agent = new https.Agent({  
  rejectUnauthorized: false,
});

async function fetchSpotPrice(base, quote) {
  const url = `https://api.coinbase.com/v2/prices/${base}-${quote}/spot`;
  console.log(`[${new Date().toLocaleTimeString()}] Requesting Spot Price: ${url}`);

  try {
    const res = await axios.get(url, {
      timeout: 10000,
      httpsAgent: agent,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
      }
    });
    const price = parseFloat(res.data.data.amount);
    console.log(`[${new Date().toLocaleTimeString()}] Spot Price 1 ${base} = ${price} ${quote}`);
    return price;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error(`[${new Date().toLocaleTimeString()}] ❌ Timeout fetching Spot Price ${base}-${quote}`);
    } else if (error.response && error.response.status === 404) {
      console.error(`[${new Date().toLocaleTimeString()}] ❌ Pair not found ${base}-${quote} (404)`);
    } else {
      console.error(`[${new Date().toLocaleTimeString()}] ❌ Fetch error: ${error.message}`);
    }
    throw new Error('Pair tidak tersedia atau request gagal.');
  }
}

async function fetchPriceChange(symbol) {
  try {
    const coinIdMapping = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      BNB: 'binancecoin',
      USDT: 'tether',
      XRP: 'ripple',
      DOGE: 'dogecoin',
      ADA: 'cardano',
      SOL: 'solana',
      TRX: 'tron',
      DOT: 'polkadot',
      LTC: 'litecoin',
      SHIB: 'shiba-inu',
      AVAX: 'avalanche-2',
      MATIC: 'polygon',
      APT: 'aptos',
      ARB: 'arbitrum',
      OP: 'optimism',
      SUI: 'sui',
      PEPE: 'pepe',
      TON: 'toncoin',
      FIL: 'filecoin',
      INJ: 'injective-protocol',
      NEAR: 'near',
      XLM: 'stellar',
      ATOM: 'cosmos',
      ALGO: 'algorand',
      VET: 'vechain',
      EGLD: 'elrond-erd-2',
      FTM: 'fantom',
      HBAR: 'hedera-hashgraph',
      MKR: 'maker',
      AAVE: 'aave',
      RUNE: 'thorchain',
      LDO: 'lido-dao',
      SAND: 'the-sandbox',
      MANA: 'decentraland',
      GALA: 'gala',
      FLOW: 'flow',
      CHZ: 'chiliz',
      XTZ: 'tezos',
      THETA: 'theta-token',
      ZIL: 'zilliqa',
      DASH: 'dash',
      COMP: 'compound-governance-token',
      CRV: 'curve-dao-token',
      ENS: 'ethereum-name-service'
    };

    const id = coinIdMapping[symbol.toUpperCase()];
    if (!id) {
      console.warn(`[${new Date().toLocaleTimeString()}] 24h change not available for ${symbol}`);
      return null;
    }

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`;

    const res = await axios.get(url);
    const change = res.data[id]?.usd_24h_change;

    if (change !== undefined) {
      return parseFloat(change.toFixed(2));
    } else {
      return null;
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Fetch change error: ${error.message}`);
    return null;
  }
}

function getCoinName(symbol) {
  return coinNames[symbol.toUpperCase()] || symbol.toUpperCase();
}

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

module.exports = {
  fetchSpotPrice,
  fetchPriceChange,
  getCoinName,
  getCurrentTime
};
