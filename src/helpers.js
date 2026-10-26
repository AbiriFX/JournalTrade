import AsyncStorage from '@react-native-async-storage/async-storage';

const BOT_TOKEN = '8778169099:AAHt0ohThhUfWsFOpJ4YCu-nR4HzKD5tgDE'; // توکن خودت را بگذار
const CHAT_ID = '@Goldspikehunter'; // آیدی کانال خودت را بگذار

export const sendToTelegram = async (message) => {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' }),
    });
  } catch (error) { console.error(error); }
};

export const saveTrade = async (trade) => {
  const existing = await getTrades();
  const newTrades = [trade, ...existing];
  await AsyncStorage.setItem('trades', JSON.stringify(newTrades));
};

export const getTrades = async () => {
  const data = await AsyncStorage.getItem('trades');
  return data ? JSON.parse(data) : [];
};

export const updateTradeResult = async (id, newResult) => {
  const trades = await getTrades();
  const updatedTrades = trades.map(t => t.id === id ? { ...t, result: newResult } : t);
  await AsyncStorage.setItem('trades', JSON.stringify(updatedTrades));
  
  const trade = trades.find(t => t.id === id);
  const message = `🔔 <b>Trade Result</b> 🔔\n\n💰 Symbol: ${trade.symbol}\n📥 Entry: ${trade.entry}\n📊 Result: <b>${newResult}</b>`;
  await sendToTelegram(message);
};