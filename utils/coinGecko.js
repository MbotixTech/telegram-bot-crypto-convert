const axios = require('axios');

const agent = new (require('https').Agent)({
  rejectUnauthorized: false,
});

async function fetchTopCoins() {
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 10,
        page: 1,
        sparkline: false
      },
      timeout: 10000,
      httpsAgent: agent
    });
    return res.data;
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Fetch top coins error: ${error.message}`);
    return null;
  }
}

async function fetchGainers() {
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false
      },
      timeout: 10000,
      httpsAgent: agent
    });
    const sorted = res.data.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    return sorted.slice(0, 10);
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Fetch gainers error: ${error.message}`);
    return null;
  }
}

async function fetchLosers() {
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false
      },
      timeout: 10000,
      httpsAgent: agent
    });
    const sorted = res.data.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
    return sorted.slice(0, 10);
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Fetch losers error: ${error.message}`);
    return null;
  }
}

async function fetchGlobalInfo() {
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/global', {
      timeout: 10000,
      httpsAgent: agent
    });
    return res.data.data;
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Fetch global info error: ${error.message}`);
    return null;
  }
}
async function fetchTrendingCoins() {
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/search/trending', {
      timeout: 10000,
      httpsAgent: agent
    });
    return res.data.coins;
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Fetch trending coins error: ${error.message}`);
    return null;
  }
}


module.exports = {
  fetchTopCoins,
  fetchGainers,
  fetchLosers,
  fetchGlobalInfo,
  fetchTrendingCoins
};
