# Crypto Convert Bot

Welcome to **MbotixTECH Crypto Convert Bot** 🚀 — A smart and powerful Telegram bot that instantly converts between crypto and fiat currencies, checks market trends, and provides real-time updates. Built for speed, accuracy, and reliability.

---

## 🌟 Features

- 💸 Convert any **crypto to fiat** or **fiat to crypto** easily.
- 📊 Check **Top 10 Coins by Market Cap**.
- 📈 Get **Top Gainers** and **Top Losers** in the last 24h.
- 🌎 View **Global Crypto Market Stats** (Market Cap, 24h Volume, BTC Dominance).
- 🔥 Discover **Trending Coins**.
- 🔄 **Refresh Button** to update prices live.
- ❌ **Delete Button** to remove messages for a cleaner chat.
- 🌍 Multi-currency support for all major crypto and fiat pairs.
- ✨ Powered by **Coinbase** and **CoinGecko** APIs.

---

## 🛠️ APIs Used

| API | Purpose |
|:---|:---|
| [Coinbase Spot Price API](https://developers.coinbase.com/api/v2#prices) | Real-time crypto/fiat spot prices |
| [CoinGecko API](https://www.coingecko.com/en/api) | Market data: Top coins, Gainers, Losers, Global Info |

No authentication required — fully public APIs.

---

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/crypto-convert-bot.git
cd crypto-convert-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```bash
BOT_TOKEN=your-telegram-bot-token-here
```

4. **Run the bot**
```bash
node bot.js
```

Or using PM2 (recommended for production):
```bash
pm install -g pm2
pm2 start bot.js --name "crypto-bot"
pm2 save
pm2 startup
```

---

## 🛋️ Usage Guide

| Command | Description |
|:---|:---|
| `/convert amount from_currency to_currency` | Convert between any crypto/fiat (e.g. `/convert 1 btc idr`) |
| `/top10` | Show Top 10 coins by market cap |
| `/gainers` | Top 10 coins with highest gain in last 24h |
| `/losers` | Top 10 coins with biggest loss in last 24h |
| `/global` | Global market statistics |
| `/trending` | Currently trending coins |

🔄 Use **Refresh** button to update the price live.  
❌ Use **Delete** button to clean up the chat.

---

## 🎉 Contributors

- [MbotixTECH](https://github.com/MbotixTech)) (Founder / Developer)

Feel free to open Pull Requests or Issues if you have suggestions!

---

## 📈 Preview

![Crypto Convert Bot Screenshot](https://github.com/user-attachments/assets/6a6fe606-a4ee-48b7-b300-862d9f9c2dfa)


---

## 🌍 License

This project is licensed under the [MIT License](./LICENSE) See `LICENSE` file for details.

---

> Built with 💙 by **MbotixTECH**

