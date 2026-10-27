import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { clearAllTrades, getPremiumStatus, getTrades, sendToTelegram } from '../helpers';
import { getStats } from '../utils';

export default function ReportsScreen({ navigation }) {
  const [trades, setTrades] = useState([]);
  const [filter, setFilter] = useState('Monthly'); 
  const [isPremium, setIsPremium] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportedText, setExportedText] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadTrades();
      checkPremium();
    }
  }, [isFocused]);

  const loadTrades = async () => setTrades(await getTrades());
  const checkPremium = async () => setIsPremium(await getPremiumStatus());

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
    if (filter === 'Monthly') return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear();
    if (filter === 'Yearly') return tradeDate.getFullYear() === now.getFullYear();
    return true;
  });

  const stats = getStats(filteredTrades);
  const chartData = [
    { name: 'Win', population: stats.wins, color: '#4CAF50', legendFontColor: '#FFF', legendFontSize: 14 },
    { name: 'Loss', population: stats.losses, color: '#F44336', legendFontColor: '#FFF', legendFontSize: 14 },
    { name: 'BE', population: stats.breakEven, color: '#9E9E9E', legendFontColor: '#FFF', legendFontSize: 14 },
  ].filter(item => item.population > 0);

  const handleSendReport = async () => {
    if (!isPremium) return Alert.alert('Premium Feature', 'Upgrade to Premium to send reports to Telegram.');
    const message = `📊 <b>${filter} Report</b>\n\n📈 Total: ${stats.total}\n✅ Wins: ${stats.wins}\n❌ Losses: ${stats.losses}\n⚖️ BE: ${stats.breakEven}\n🎯 Win Rate: ${stats.winRate}%`;
    await sendToTelegram(message);
    Alert.alert('Success', 'Report sent to Telegram');
  };

  const handleExport = async () => {
    if (!isPremium) return Alert.alert('Premium Feature', 'Upgrade to Premium to export data.');
    if (filteredTrades.length === 0) return Alert.alert('Error', 'No trades to export');
    
    let csvContent = "Date,Symbol,Type,Entry,SL,TP,R:R,Result,ExitPrice\n";
    filteredTrades.forEach(t => {
      csvContent += `${t.dateTime},${t.symbol},${t.type},${t.entry},${t.stopLoss},${t.takeProfit},${t.rr},${t.result},${t.exitPrice || '-'}\n`;
    });
    setExportedText(csvContent);
    setExportModalVisible(true);
  };

  const confirmClearHistory = () => setModalVisible(true);
  const executeClearHistory = async () => { await clearAllTrades(); setModalVisible(false); loadTrades(); };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reports</Text>
      
      {/* بنر تبلیغاتی */}
      {!isPremium && (
        <TouchableOpacity style={styles.adBanner} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.adText}>📢 Remove Ads & Unlock Features - Go Premium!</Text>
        </TouchableOpacity>
      )}

      <View style={styles.filterRow}>
        {['Weekly', 'Monthly', 'Yearly'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}><Text style={styles.statNum}>{stats.total}</Text><Text style={styles.statLabel}>Total</Text></View>
        <View style={styles.statBox}><Text style={styles.statNum}>{stats.winRate}%</Text><Text style={styles.statLabel}>Win Rate</Text></View>
      </View>

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

      <TouchableOpacity style={[styles.btn3D, !isPremium && { opacity: 0.5 }]} onPress={handleSendReport}>
        <Text style={styles.btnText}>Send Report to Telegram {!isPremium && '🔒'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn3D, { backgroundColor: '#2C2C2C', borderWidth: 1, borderColor: '#D4AF37' }, !isPremium && { opacity: 0.5 }]} onPress={handleExport}>
        <Text style={[styles.btnText, { color: '#D4AF37' }]}>Export Trades (CSV) {!isPremium && '🔒'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn3D, { backgroundColor: '#F44336', marginBottom: 40 }]} onPress={confirmClearHistory}>
        <Text style={styles.btnText}>Clear All History</Text>
      </TouchableOpacity>

      {/* Modal حذف */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Clear All History?</Text>
            <Text style={{color: '#FFF', textAlign: 'center', marginBottom: 20}}>Are you sure? This cannot be undone.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#9E9E9E'}]} onPress={() => setModalVisible(false)}><Text style={styles.modalBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#F44336'}]} onPress={executeClearHistory}><Text style={styles.modalBtnText}>Delete All</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal خروجی */}
      <Modal visible={exportModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export Data</Text>
            <ScrollView style={{maxHeight: 200, marginBottom: 15}}>
              <Text style={{color: '#888', fontSize: 12}}>{exportedText}</Text>
            </ScrollView>
            <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#4CAF50', marginHorizontal: 0}]} onPress={() => setExportModalVisible(false)}>
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', marginTop: 10, marginBottom: 20 },
  adBanner: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#D4AF37' },
  adText: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
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
  btn3D: { backgroundColor: '#D4AF37', padding: 18, borderRadius: 12, marginTop: 15, elevation: 10 },
  btnText: { color: '#000', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 20 },
  modalContent: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#D4AF37' },
  modalTitle: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});