require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const chalk = require('chalk');
const https = require('https');
const { fetchTopCoins, fetchGainers, fetchLosers, fetchGlobalInfo, fetchTrendingCoins} = require('./utils/coinGecko');
const { fetchSpotPrice, fetchPriceChange, getCoinName, getCurrentTime } = require('./utils/fetchPriceInfo');

function timestamp() {
  return `[${new Date().toLocaleTimeString()}]`;
}

function logInfo(message) {
  console.log(chalk.cyan(`${timestamp()} ${message}`));
}

function logSuccess(message) {
  console.log(chalk.green(`${timestamp()} ${message}`));
}

function logWarn(message) {
  console.log(chalk.yellow(`${timestamp()} ${message}`));
}

function logError(message) {
  console.log(chalk.red(`${timestamp()} ${message}`));
}

const bot = new Telegraf(process.env.BOT_TOKEN);

let botInfo = null;
bot.telegram.getMe().then((info) => {
  botInfo = info;
  console.log(`🤖 Bot is running as @${botInfo.username}`);
});

bot.start(async (ctx) => {
  const fullName = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ') || 'User';

  try {
    const photos = await ctx.telegram.getUserProfilePhotos(botInfo.id, { limit: 1 });

    if (photos.total_count > 0) {
      const file_id = photos.photos[0][0].file_id;

      await ctx.replyWithPhoto(file_id, {
        caption: `🚀 <b>Welcome to Crypto Convert Bot <b>${fullName}</b>!</b>\n\nPlease select an option below.`,
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('📚 Help', 'show_help')],
          [Markup.button.url('🐞 Report Bug', 'https://t.me/xiaogarpu')]
        ])
      });
    } else {
      await ctx.replyWithHTML(
        `🚀 <b>Welcome to Crypto Convert Bot <b>${fullName}</b>!</b>\n\nPlease select an option below.`,
        Markup.inlineKeyboard([
          [Markup.button.callback('📚 Help', 'show_help')],
          [Markup.button.url('🐞 Report Bug', 'https://t.me/xiaogarpu')]
        ])
      );
    }
  } catch (error) {
    console.error('Failed to send start message:', error.message);
    await ctx.reply('❌ Sorry, something went wrong.');
  }
});

bot.command('conv', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);

  if (args.length !== 3) {
    logWarn('Format convert salah.');
    return ctx.reply('Invalid format. Example:\n/conv 1000 usd btc');
  }

  const [amountInput, fromInput, toInput] = args;
  const amount = parseFloat(amountInput);
  const from = fromInput.toUpperCase();
  const to = toInput.toUpperCase();

  if (isNaN(amount) || amount <= 0) {
    logWarn('Wrong number.');
    return ctx.reply('Amount must be a number and greater than 0.');
  }

  try {
    let spotPrice;
    try {
      spotPrice = await fetchSpotPrice(from, to);
    } catch (err1) {
      spotPrice = 1 / await fetchSpotPrice(to, from);
    }

    const result = amount * spotPrice;
    const coinName = getCoinName(from);
    const change24h = await fetchPriceChange(from);
    const time = getCurrentTime();

    let changeText = change24h !== null ? `📈 24h Change: ${change24h > 0 ? '+' : ''}${change24h}%\n` : '';

    await ctx.replyWithHTML(
      `💱 <b>${coinName} (${from}) ➔ ${to}</b>\n<code>${amount} ${from} = ${result.toFixed(6)} ${to}</code>\n${changeText}🕒 Updated at ${time}`,
      Markup.inlineKeyboard([
        Markup.button.callback('🔄 Refresh', `refresh-${amount}-${from}-${to}`),
        Markup.button.callback('❌ Delete', 'delete')
      ])
    );

    logSuccess(`Converted ${amount} ${from} to ${result.toFixed(6)} ${to}`);
  } catch (err) {
    logError(`Failed convert: ${err.message}`);
    ctx.reply('❌ Pair not found or failed to fetch price.');
  }
});

bot.command('top10', async (ctx) => {
  const coins = await fetchTopCoins();
  if (!coins) {
    return ctx.reply('❌ Failed to fetch Top 10 Coins.');
  }

  let message = '🏆 <b>Top 10 Coins by Market Cap</b>\n\n';
  coins.forEach((coin, index) => {
    message += `${index + 1}. <b>${coin.name}</b> (${coin.symbol.toUpperCase()}) - $${coin.current_price.toLocaleString()}\n`;
  });

  const sent = await ctx.replyWithHTML(message);

  setTimeout(() => {
    try {
      ctx.deleteMessage(sent.message_id);
    } catch (err) {
      console.error('Failed to delete top10 message:', err.message);
    }
  }, 180000);
});

bot.command('gainers', async (ctx) => {
  const coins = await fetchGainers();
  if (!coins) {
    return ctx.reply('❌ Failed to fetch Top Gainers.');
  }

  let message = '📈 <b>Top Gainers 24h</b>\n\n';
  coins.forEach((coin, index) => {
    const change = coin.price_change_percentage_24h?.toFixed(2) || 0;
    message += `${index + 1}. <b>${coin.name}</b> (${coin.symbol.toUpperCase()}) +${change}%\n`;
  });

  const sent = await ctx.replyWithHTML(message);

  setTimeout(() => {
    try {
      ctx.deleteMessage(sent.message_id);
    } catch (err) {
      console.error('Failed to delete gainers message:', err.message);
    }
  }, 180000);
});

bot.command('losers', async (ctx) => {
  const coins = await fetchLosers();
  if (!coins) {
    return ctx.reply('❌ Failed to fetch Top Losers.');
  }

  let message = '📉 <b>Top Losers 24h</b>\n\n';
  coins.forEach((coin, index) => {
    const change = coin.price_change_percentage_24h?.toFixed(2) || 0;
    message += `${index + 1}. <b>${coin.name}</b> (${coin.symbol.toUpperCase()}) ${change}%\n`;
  });

  const sent = await ctx.replyWithHTML(message);

  setTimeout(() => {
    try {
      ctx.deleteMessage(sent.message_id);
    } catch (err) {
      console.error('Failed to delete losers message:', err.message);
    }
  }, 180000);
});

bot.command('trending', async (ctx) => {
  const coins = await fetchTrendingCoins();
  if (!coins) {
    return ctx.reply('❌ Failed to fetch Trending Coins.');
  }

  let message = '🔥 <b>Trending Coins</b>\n\n';
  coins.forEach((coin, index) => {
    message += `${index + 1}. <b>${coin.item.name}</b> (${coin.item.symbol.toUpperCase()})\n`;
  });

  const sent = await ctx.replyWithHTML(message);

  setTimeout(() => {
    try {
      ctx.deleteMessage(sent.message_id);
    } catch (err) {
      console.error('Failed to delete trending message:', err.message);
    }
  }, 180000);
});

bot.command('global', async (ctx) => {
  const global = await fetchGlobalInfo();
  if (!global) {
    return ctx.reply('❌ Failed to fetch Global Market Info.');
  }

  const marketCap = `$${(global.total_market_cap.usd / 1e12).toFixed(2)} Trillion`;
  const volume24h = `$${(global.total_volume.usd / 1e9).toFixed(2)} Billion`;
  const btcDominance = `${global.market_cap_percentage.btc.toFixed(2)}%`;

  const message = `🌐 <b>Global Market Overview</b>\n\n` +
                  `<b>Total Market Cap:</b> ${marketCap}\n` +
                  `<b>24h Volume:</b> ${volume24h}\n` +
                  `<b>BTC Dominance:</b> ${btcDominance}`;

  const sent = await ctx.replyWithHTML(message);

  setTimeout(() => {
    try {
      ctx.deleteMessage(sent.message_id);
    } catch (err) {
      console.error('Failed to delete global message:', err.message);
    }
  }, 180000);
});


bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;
  console.log(`[${new Date().toLocaleTimeString()}] Callback query: ${data}`);

  if (data.startsWith('refresh')) {
    const parts = data.split('-');
    const amount = parseFloat(parts[1]);
    const from = parts[2];
    const to = parts[3];

    try {
      await ctx.answerCbQuery('🔄 Refreshing price...', { show_alert: false });

      let spotPrice;
      try {
        spotPrice = await fetchSpotPrice(from, to);
      } catch (err1) {
        spotPrice = 1 / await fetchSpotPrice(to, from);
      }

      const result = amount * spotPrice;
      const coinName = getCoinName(from);
      const change24h = await fetchPriceChange(from);
      const time = getCurrentTime();

      let changeText = change24h !== null ? `📈 24h Change: ${change24h > 0 ? '+' : ''}${change24h}%\n` : '';

      const newText = `💱 <b>${coinName} (${from}) ➔ ${to}</b>\n<code>${amount} ${from} = ${result.toFixed(6)} ${to}</code>\n${changeText}🕒 Updated at ${time}`;

      const currentMessageText = ctx.callbackQuery.message.text;
      if (currentMessageText && currentMessageText.replace(/\s+/g, '') === newText.replace(/\s+/g, '')) {
        await ctx.answerCbQuery('✅ Prices are up-to-date', { show_alert: false });
        console.log(`[${new Date().toLocaleTimeString()}] Prices are up-to-date.`);
        return;
      }

      await ctx.editMessageText(newText, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          Markup.button.callback('🔄 Refresh', `refresh-${amount}-${from}-${to}`),
          Markup.button.callback('❌ Delete', 'delete')
        ])
      });

    } catch (err) {
      console.error(`[${new Date().toLocaleTimeString()}] ❌ Refresh failed: ${err.message}`);
      await ctx.answerCbQuery('❌ Failed price refresh.', { show_alert: false });
    }
  }

  if (ctx.callbackQuery.data === 'show_help') {
    await ctx.answerCbQuery();

    try {
      await ctx.deleteMessage();
    } catch (err) {
      console.error('Failed to delete message:', err.message);
    }
    await ctx.replyWithHTML(
      `📚 <b>Available Commands:</b>\n\n` +
      `💱 <b>/conv amount from_currency to_currency</b>\n` +
      `➔ Example: /conv 1000 usd btc\n\n` +
      `🏆 <b>/top10</b>\n` +
      `➔ Top 10 coins by market cap\n\n` +
      `📈 <b>/gainers</b>\n` +
      `➔ Top 10 coins by 24h gain\n\n` +
      `📉 <b>/losers</b>\n` +
      `➔ Top 10 coins by 24h loss\n\n` +
      `🌐 <b>/global</b>\n` +
      `➔ Global crypto market stats\n\n` +
      `🔥 <b>/trending</b>\n` +
      `➔ Currently trending coins\n\n` +
      `🔄 Refresh button ➔ Update the latest price\n` +
      `❌ Delete button ➔ Remove the message\n\n` +
      `✨ Powered by MbotixTECH 🚀`,
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.url('⚠️ Report Bug', 'https://t.me/xiaogarpu')]
        ])
      }
    );
  }  

  if (data === 'delete') {
    try {
      await ctx.deleteMessage();
      console.log(`[${new Date().toLocaleTimeString()}] Deleted message.`);
    } catch (err) {
      console.error(`[${new Date().toLocaleTimeString()}] ❌ Delete failed: ${err.message}`);
    }
  }
});

bot.launch();
logSuccess('🚀 Bot launched and running...');
