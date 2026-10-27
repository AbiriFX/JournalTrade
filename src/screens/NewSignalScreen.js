import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { getPremiumStatus, saveTrade, sendToTelegram } from '../helpers';
import { calculateRR } from '../utils';

export default function NewSignalScreen({ navigation }) {
  const [symbol, setSymbol] = useState('XAUUSD');
  const [entry, setEntry] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'XAUUSD (طلا)', value: 'XAUUSD' },
    { label: 'EURUSD (یورو/دلار)', value: 'EURUSD' },
    { label: 'GBPUSD (پوند/دلار)', value: 'GBPUSD' },
    { label: 'USDJPY (دلار/ین)', value: 'USDJPY' },
    { label: 'BTCUSD (بیت‌کوین)', value: 'BTCUSD' },
    { label: 'ETHUSD (اتریوم)', value: 'ETHUSD' },
    { label: 'US30 (داوجونز)', value: 'US30' },
    { label: 'NAS100 (نزدک)', value: 'NAS100' },
  ]);

  useEffect(() => {
    checkPremium();
  }, []);

  const checkPremium = async () => {
    const premium = await getPremiumStatus();
    setIsPremium(premium);
  };

  const handleSubmit = async () => {
    if (!entry || !stopLoss || !takeProfit) return Alert.alert('Error', 'Please fill all fields');
    
    const type = parseFloat(takeProfit) > parseFloat(entry) ? 'Buy' : 'Sell';
    const rr = calculateRR(entry, stopLoss, takeProfit);
    const now = new Date().toLocaleString('en-US');
    
    const newTrade = { 
      id: Date.now().toString(), 
      symbol, entry, stopLoss, takeProfit, type, rr, 
      dateTime: now, result: 'Pending', exitPrice: null 
    };

    await saveTrade(newTrade);
    
    // فقط اگر کاربر پرمیوم بود، پیام ارسال شود
    if (isPremium) {
      const message = `🟢 <b>New Signal</b> 🟢\n\n💰 Symbol: ${symbol}\n📈 Type: <b>${type}</b>\n📥 Entry: ${entry}\n🛑 Stop Loss: ${stopLoss}\n🎯 Take Profit: ${takeProfit}\n⚖️ R:R = 1:${rr}\n🕒 Time: ${now}`;
      await sendToTelegram(message);
      Alert.alert('Success', `${type} signal registered and sent to Telegram.`);
    } else {
      Alert.alert('Success', `${type} signal registered (Saved locally).`);
    }
    
    setEntry(''); setStopLoss(''); setTakeProfit('');
    navigation.navigate('History');
  };

  return (
    <ScrollView style={styles.container} nestedScrollEnabled={true}>
      <Text style={styles.title}>New Signal</Text>
      
      {/* بنر تبلیغاتی (برای نسخه رایگان) */}
      {!isPremium && (
        <View style={styles.adBanner}>
          <Text style={styles.adText}>📢 Ad Space - Upgrade to remove ads!</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Symbol:</Text>
        <View style={{ zIndex: 1000 }}> 
          <DropDownPicker
            open={open}
            value={symbol}
            items={items}
            setOpen={setOpen}
            setValue={setSymbol}
            setItems={setItems}
            theme="DARK"
            dropDownContainerStyle={{ backgroundColor: '#2C2C2C', borderColor: '#D4AF37' }}
            style={{ backgroundColor: '#2C2C2C', borderColor: '#333' }}
            textStyle={{ color: '#FFF' }}
            labelStyle={{ color: '#FFF', fontWeight: 'bold' }}
          />
        </View>

        <Text style={styles.label}>Entry Price:</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={entry} onChangeText={setEntry} />
        <Text style={styles.label}>Stop Loss:</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={stopLoss} onChangeText={setStopLoss} />
        <Text style={styles.label}>Take Profit:</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={takeProfit} onChangeText={setTakeProfit} />
        
        {entry && stopLoss && takeProfit ? (
          <Text style={styles.rrText}>Risk/Reward: 1 : {calculateRR(entry, stopLoss, takeProfit)}</Text>
        ) : null}

        <TouchableOpacity style={styles.btn3D} onPress={handleSubmit}>
          <Text style={styles.btnText}>Register Signal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', marginTop: 10, marginBottom: 20 },
  adBanner: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  adText: { color: '#888', fontSize: 14 },
  card: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#333' },
  label: { color: '#FFF', fontSize: 16, marginBottom: 5, marginTop: 15 },
  input: { backgroundColor: '#2C2C2C', color: '#FFF', padding: 12, borderRadius: 8, fontSize: 16 },
  rrText: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 15 },
  btn3D: { backgroundColor: '#D4AF37', padding: 18, borderRadius: 12, marginTop: 20, elevation: 10 },
  btnText: { color: '#000', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});