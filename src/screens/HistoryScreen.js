import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getTrades, updateTradeResult } from '../helpers';

export default function HistoryScreen({ navigation }) {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTrades();
    });
    return unsubscribe;
  }, [navigation]);

  const loadTrades = async () => setTrades(await getTrades());

  const handleResultChange = async (id, result) => {
    await updateTradeResult(id, result);
    loadTrades();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Trade History</Text>
      {trades.length === 0 && <Text style={styles.emptyText}>No trades found.</Text>}
      
      {trades.map(t => (
        <View key={t.id} style={styles.tradeItem}>
          <Text style={styles.tradeText}>
            {t.dateTime} | {t.symbol} | <Text style={{color: t.type === 'Buy' ? '#4CAF50' : '#F44336', fontWeight: 'bold'}}>{t.type}</Text>
          </Text>
          <Text style={styles.detailText}>Entry: {t.entry} | R:R 1:{t.rr}</Text>
          
          <View style={styles.resultRow}>
            <TouchableOpacity style={[styles.resBtn, {backgroundColor: '#4CAF50'}]} onPress={() => handleResultChange(t.id, 'Win')}><Text style={styles.resBtnText}>Win</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.resBtn, {backgroundColor: '#F44336'}]} onPress={() => handleResultChange(t.id, 'Loss')}><Text style={styles.resBtnText}>Loss</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.resBtn, {backgroundColor: '#9E9E9E'}]} onPress={() => handleResultChange(t.id, 'Break Even')}><Text style={styles.resBtnText}>BE</Text></TouchableOpacity>
          </View>
          <Text style={styles.resultText}>Result: {t.result}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', marginTop: 10, marginBottom: 20 },
  emptyText: { color: '#FFF', textAlign: 'center', marginTop: 20 },
  tradeItem: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  tradeText: { color: '#FFF', fontSize: 15, marginBottom: 5 },
  detailText: { color: '#BBB', fontSize: 14, marginBottom: 10 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  resBtn: { flex: 1, padding: 8, borderRadius: 5, marginHorizontal: 3, alignItems: 'center' },
  resBtnText: { color: '#FFF', fontWeight: 'bold' },
  resultText: { color: '#D4AF37', fontSize: 15, fontWeight: 'bold' }
});