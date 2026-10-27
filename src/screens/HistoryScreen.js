import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { deleteTrade, getTrades, updateTradeResult } from '../helpers';

export default function HistoryScreen() {
  const [trades, setTrades] = useState([]);
  const [filter, setFilter] = useState('Active');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [manualExitPrice, setManualExitPrice] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) loadTrades();
  }, [isFocused]);

  const loadTrades = async () => setTrades(await getTrades());

  const confirmDelete = (trade) => {
    setTradeToDelete(trade);
    setDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    if (tradeToDelete) {
      await deleteTrade(tradeToDelete.id);
      setDeleteModalVisible(false);
      setTradeToDelete(null);
      loadTrades();
    }
  };

  const handleManualResult = (trade) => {
    setSelectedTrade(trade);
    setManualExitPrice('');
    setModalVisible(true);
  };

  const saveManualResult = async () => {
    if (!manualExitPrice) return Alert.alert('Error', 'Please enter exit price');
    
    let result = 'Break Even';
    if (parseFloat(manualExitPrice) > parseFloat(selectedTrade.entry)) result = 'Win';
    if (parseFloat(manualExitPrice) < parseFloat(selectedTrade.entry)) result = 'Loss';
    
    await updateTradeResult(selectedTrade.id, result, manualExitPrice);
    setModalVisible(false);
    loadTrades();
  };

  const filteredTrades = trades.filter(t => {
    if (filter === 'Active') return t.result === 'Pending' || t.result === 'فعال نشد';
    if (filter === 'Win') return t.result === 'Win';
    if (filter === 'Loss') return t.result === 'Loss';
    if (filter === 'BE') return t.result === 'Break Even';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* تب‌های فیلتر */}
      <View style={styles.tabRow}>
        {['Active', 'Win', 'Loss', 'BE'].map(f => (
          <TouchableOpacity key={f} style={[styles.tabBtn, filter === f && styles.tabBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView>
        {filteredTrades.length === 0 && <Text style={styles.emptyText}>No trades found.</Text>}
        
        {filteredTrades.map(t => (
          <View key={t.id} style={styles.tradeItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.tradeText}>
                {t.symbol} | <Text style={{color: t.type === 'Buy' ? '#4CAF50' : '#F44336', fontWeight: 'bold'}}>{t.type}</Text>
              </Text>
              <TouchableOpacity onPress={() => confirmDelete(t)}>
                <Text style={{color: '#F44336', fontSize: 18}}>🗑️</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.detailText}>Entry: {t.entry} | R:R 1:{t.rr}</Text>
            <Text style={styles.detailText}>SL: {t.stopLoss} | TP: {t.takeProfit}</Text>
            <Text style={styles.detailText}>Date: {t.dateTime}</Text>
            {t.exitPrice && <Text style={styles.resultText}>Exit: {t.exitPrice} | Result: {t.result}</Text>}

            {t.result !== 'Win' && t.result !== 'Loss' && t.result !== 'Break Even' && (
              <View style={styles.resultRow}>
                <TouchableOpacity style={[styles.resBtn, {backgroundColor: '#4CAF50'}]} onPress={() => updateTradeResult(t.id, 'Win', t.takeProfit).then(loadTrades)}><Text style={styles.resBtnText}>Win</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.resBtn, {backgroundColor: '#F44336'}]} onPress={() => updateTradeResult(t.id, 'Loss', t.stopLoss).then(loadTrades)}><Text style={styles.resBtnText}>Loss</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.resBtn, {backgroundColor: '#9E9E9E'}]} onPress={() => updateTradeResult(t.id, 'Break Even', t.entry).then(loadTrades)}><Text style={styles.resBtnText}>BE</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.resBtn, {backgroundColor: '#D4AF37'}]} onPress={() => handleManualResult(t)}><Text style={styles.resBtnText}>Manual</Text></TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Modal برای ورود دستی قیمت خروج */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Exit Price</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              value={manualExitPrice} 
              onChangeText={setManualExitPrice} 
              placeholder="e.g. 2015.50"
              placeholderTextColor="#888"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#F44336'}]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#4CAF50'}]} onPress={saveManualResult}>
                <Text style={styles.modalBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal تایید حذف */}
      <Modal visible={deleteModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Trade?</Text>
            <Text style={{color: '#FFF', textAlign: 'center', marginBottom: 20}}>Are you sure you want to delete this trade?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#9E9E9E'}]} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#F44336'}]} onPress={executeDelete}>
                <Text style={styles.modalBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 15 },
  tabRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  tabBtn: { flex: 1, padding: 10, backgroundColor: '#1E1E1E', marginHorizontal: 3, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  tabBtnActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  tabText: { color: '#FFF', fontWeight: 'bold' },
  tabTextActive: { color: '#000' },
  emptyText: { color: '#FFF', textAlign: 'center', marginTop: 20 },
  tradeItem: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  tradeText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  detailText: { color: '#BBB', fontSize: 14, marginBottom: 3 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  resBtn: { flex: 1, padding: 8, borderRadius: 5, marginHorizontal: 3, alignItems: 'center' },
  resBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  resultText: { color: '#D4AF37', fontSize: 14, fontWeight: 'bold', marginTop: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 20 },
  modalContent: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#D4AF37' },
  modalTitle: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { backgroundColor: '#2C2C2C', color: '#FFF', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});