import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { getTrades, sendToTelegram } from '../helpers';
import { getStats } from '../utils';

export default function ReportsScreen() {
  const [trades, setTrades] = useState([]);
  const [filter, setFilter] = useState('Monthly'); 
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadTrades();
    }
  }, [isFocused]);

  const loadTrades = async () => setTrades(await getTrades());

  const filteredTrades = trades.filter(t => {
    if (!t.dateTime) return false;
    
    const tradeDate = new Date(t.dateTime);
    const now = new Date();
    
    if (isNaN(tradeDate.getTime())) return true; 

    if (filter === 'Weekly') {
      const diffTime = Math.abs(now - tradeDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (filter === 'Monthly') {
      return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear();
    }
    if (filter === 'Yearly') {
      return tradeDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const stats = getStats(filteredTrades);

  const chartData = [
    { name: 'Win', population: stats.wins, color: '#4CAF50', legendFontColor: '#FFF', legendFontSize: 14 },
    { name: 'Loss', population: stats.losses, color: '#F44336', legendFontColor: '#FFF', legendFontSize: 14 },
    { name: 'BE', population: stats.breakEven, color: '#9E9E9E', legendFontColor: '#FFF', legendFontSize: 14 },
  ].filter(item => item.population > 0);

  const handleSendReport = async () => {
    const message = `📊 <b>${filter} Performance Report</b> 📊\n\n📈 Total Trades: ${stats.total}\n✅ Wins: ${stats.wins}\n❌ Losses: ${stats.losses}\n⚖️ Break Even: ${stats.breakEven}\n🎯 Win Rate: <b>${stats.winRate}%</b>`;
    await sendToTelegram(message);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reports</Text>
      
      {/* فیلترها */}
      <View style={styles.filterRow}>
        {['Weekly', 'Monthly', 'Yearly'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* آمار کلی */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}><Text style={styles.statNum}>{stats.total}</Text><Text style={styles.statLabel}>Total</Text></View>
        <View style={styles.statBox}><Text style={styles.statNum}>{stats.winRate}%</Text><Text style={styles.statLabel}>Win Rate</Text></View>
      </View>

      {/* آمار تفکیکی */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { borderColor: '#4CAF50' }]}>
          <Text style={[styles.statNum, { color: '#4CAF50' }]}>{stats.wins}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={[styles.statBox, { borderColor: '#F44336' }]}>
          <Text style={[styles.statNum, { color: '#F44336' }]}>{stats.losses}</Text>
          <Text style={styles.statLabel}>Losses</Text>
        </View>
        <View style={[styles.statBox, { borderColor: '#9E9E9E' }]}>
          <Text style={[styles.statNum, { color: '#9E9E9E' }]}>{stats.breakEven}</Text>
          <Text style={styles.statLabel}>Break Even</Text>
        </View>
      </View>

      {/* نمودار */}
      {chartData.length > 0 && (
        <View style={styles.chartContainer}>
          <PieChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      <TouchableOpacity style={styles.btn3D} onPress={handleSendReport}>
        <Text style={styles.btnText}>Send Report to Telegram</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', marginTop: 10, marginBottom: 20 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  filterBtn: { flex: 1, padding: 10, backgroundColor: '#1E1E1E', marginHorizontal: 5, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  filterBtnActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  filterText: { color: '#FFF', fontWeight: 'bold' },
  filterTextActive: { color: '#000' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statBox: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, flex: 1, marginHorizontal: 5, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  statNum: { color: '#D4AF37', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#FFF', fontSize: 14 },
  chartContainer: { backgroundColor: '#1E1E1E', borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  btn3D: { backgroundColor: '#D4AF37', padding: 18, borderRadius: 12, marginTop: 20, elevation: 10 },
  btnText: { color: '#000', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});