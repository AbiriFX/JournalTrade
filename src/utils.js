export const calculateRR = (entry, stopLoss, takeProfit) => {
  try {
    const e = parseFloat(entry);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);
    
    // ریسک فاصله ورود تا حد ضرر است
    const risk = Math.abs(e - sl);
    // ریوارد فاصله ورود تا حد سود است
    const reward = Math.abs(tp - e);
    
    if (risk === 0) return '0.00';
    return (reward / risk).toFixed(2);
  } catch (e) {
    return '0.00';
  }
};

export const getStats = (trades) => {
  const total = trades.length;
  const wins = trades.filter(t => t.result === 'Win').length;
  const losses = trades.filter(t => t.result === 'Loss').length;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
  return { total, wins, losses, winRate };
};