import AsyncStorage from '@react-native-async-storage/async-storage';

// مقادیر پیش‌فرض (اگر کاربر تنظیمات را وارد نکرده باشد)
const DEFAULT_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; 
const DEFAULT_CHAT_ID = '@YourChannelUsername';

// --- توابع ذخیره و خواندن تنظیمات ---
export const saveTelegramSettings = async (token, chatId) => {
  await AsyncStorage.setItem('telegramSettings', JSON.stringify({ token, chatId }));
};

export const getTelegramSettings = async () => {
  const data = await AsyncStorage.getItem('telegramSettings');
  return data ? JSON.parse(data) : { token: DEFAULT_BOT_TOKEN, chatId: DEFAULT_CHAT_ID };
};

// --- تابع ارسال به تلگرام (حالا از تنظیمات می‌خواند) ---
export const sendToTelegram = async (message) => {
  try {
    const settings = await getTelegramSettings();
    
    // اگر کاربر تنظیمات را وارد نکرده باشد، پیام ارسال نمی‌شود
    if (!settings.token || settings.token === 'YOUR_BOT_TOKEN_HERE') {
      console.warn("Telegram settings not configured.");
      return false;
    }

    const url = `https://api.telegram.org/bot${settings.token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: settings.chatId, text: message, parse_mode: 'HTML' }),
    });
    return response.ok;
  } catch (error) { 
    console.error("Telegram Error:", error); 
    return false;
  }
};

// --- توابع دیتابیس معاملات ---
export const saveTrade = async (trade) => {
  const existing = await getTrades();
  const newTrades = [trade, ...existing];
  await AsyncStorage.setItem('trades', JSON.stringify(newTrades));
};

export const getTrades = async () => {
  const data = await AsyncStorage.getItem('trades');
  return data ? JSON.parse(data) : [];
};

export const updateTradeResult = async (id, newResult, exitPrice) => {
  const trades = await getTrades();
  const updatedTrades = trades.map(t => t.id === id ? { ...t, result: newResult, exitPrice: exitPrice } : t);
  await AsyncStorage.setItem('trades', JSON.stringify(updatedTrades));
  
  const trade = trades.find(t => t.id === id);
  const resultEmoji = newResult === 'Win' ? '✅' : newResult === 'Loss' ? '❌' : '⚖️';
  
  const message = `${resultEmoji} <b>Trade Result</b> ${resultEmoji}\n\n💰 Symbol: ${trade.symbol}\n📈 Type: ${trade.type}\n📥 Entry: ${trade.entry}\n🚪 Exit: <b>${exitPrice}</b>\n📊 Result: <b>${newResult}</b>\n🕒 Time: ${trade.dateTime}\n\n#JournalTrade #TradeResult #${trade.symbol}`;
  await sendToTelegram(message);
};

export const deleteTrade = async (id) => {
  const trades = await getTrades();
  const newTrades = trades.filter(t => t.id !== id);
  await AsyncStorage.setItem('trades', JSON.stringify(newTrades));
};

export const clearAllTrades = async () => {
  await AsyncStorage.removeItem('trades');
};

// --- توابع مدیریت نسخه پرمیوم ---
export const setPremiumStatus = async (isPremium) => {
  await AsyncStorage.setItem('isPremium', JSON.stringify(isPremium));
};

export const getPremiumStatus = async () => {
  const data = await AsyncStorage.getItem('isPremium');
  return data ? JSON.parse(data) : false;
};