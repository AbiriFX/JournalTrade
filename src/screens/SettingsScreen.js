import { useEffect, useState } from 'react';
import { Alert, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getPremiumStatus, getTelegramSettings, saveTelegramSettings, setPremiumStatus } from '../helpers';

export default function SettingsScreen() {
  const [token, setToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  
  // State برای Modalها
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [codeModalVisible, setCodeModalVisible] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getTelegramSettings();
    if (settings.token !== 'YOUR_BOT_TOKEN_HERE') setToken(settings.token);
    if (settings.chatId !== '@YourChannelUsername') setChatId(settings.chatId);
    const premium = await getPremiumStatus();
    setIsPremium(premium);
  };

  const handleSaveTelegram = async () => {
    if (!token || !chatId) return Alert.alert('Error', 'Please fill both fields');
    await saveTelegramSettings(token, chatId);
    Alert.alert('Success', 'Telegram settings saved!');
  };

  // تابع فعال‌سازی با کد
  const handleActivatePremium = async () => {
    const validCodes = ['VIP-2024', 'PRO-TRADER', 'GOLD-USER']; 
    if (validCodes.includes(activationCode.toUpperCase())) {
      await setPremiumStatus(true);
      setIsPremium(true);
      setCodeModalVisible(false);
      Alert.alert('Success', 'Premium Activated! Enjoy unlimited access.');
    } else {
      Alert.alert('Error', 'Invalid activation code.');
    }
  };

  // باز کردن Modal خرید
  const openPurchaseModal = () => {
    setPurchaseModalVisible(true);
  };

  // هدایت به درگاه پرداخت
  const goToPayment = () => {
    setPurchaseModalVisible(false);
    const paymentUrl = 'https://zarinp.al/your_payment_link_here'; // لینک خودت را بگذار
    Linking.openURL(paymentUrl).catch(() => Alert.alert('Error', 'Could not open payment link.'));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      {/* بخش وضعیت اشتراک */}
      <View style={[styles.card, { borderColor: isPremium ? '#4CAF50' : '#D4AF37' }]}>
        <Text style={styles.sectionTitle}>Account Status</Text>
        <Text style={{ color: isPremium ? '#4CAF50' : '#F44336', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 }}>
          {isPremium ? '🌟 PREMIUM USER' : 'FREE USER'}
        </Text>
        
        {!isPremium && (
          <>
            <TouchableOpacity style={styles.btn3D} onPress={openPurchaseModal}>
              <Text style={styles.btnText}>Buy Premium License</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.btn3D, { backgroundColor: '#2C2C2C', borderWidth: 1, borderColor: '#4CAF50', marginTop: 10 }]} onPress={() => setCodeModalVisible(true)}>
              <Text style={[styles.btnText, { color: '#4CAF50' }]}>Enter Activation Code</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* تنظیمات تلگرام */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Telegram Integration</Text>
        {!isPremium ? (
          <Text style={{ color: '#F44336', textAlign: 'center', marginVertical: 10 }}>
            🔒 Upgrade to Premium to unlock Telegram sending.
          </Text>
        ) : (
          <>
            <Text style={styles.label}>Bot Token:</Text>
            <TextInput style={styles.input} value={token} onChangeText={setToken} placeholder="e.g. 123456789:ABC..." placeholderTextColor="#666" />
            <Text style={styles.label}>Channel ID:</Text>
            <TextInput style={styles.input} value={chatId} onChangeText={setChatId} placeholder="e.g. @MyChannel" placeholderTextColor="#666" />
            <TouchableOpacity style={styles.btn3D} onPress={handleSaveTelegram}>
              <Text style={styles.btnText}>Save Telegram Settings</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
      <Text style={styles.footer}>Journal Trade v1.0.0</Text>

      {/* Modal خرید */}
      <Modal visible={purchaseModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upgrade to Premium</Text>
            <Text style={{color: '#FFF', textAlign: 'center', marginBottom: 20}}>
              Unlock Telegram sending and Data Export features.{'\n\n'}
              Price: 500,000 Toman
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#9E9E9E'}]} onPress={() => setPurchaseModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#4CAF50'}]} onPress={goToPayment}>
                <Text style={styles.modalBtnText}>Pay Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal فعال‌سازی */}
      <Modal visible={codeModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Activate Premium</Text>
            <TextInput 
              style={styles.input} 
              value={activationCode} 
              onChangeText={setActivationCode} 
              placeholder="Enter your code..."
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#9E9E9E'}]} onPress={() => setCodeModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#4CAF50'}]} onPress={handleActivatePremium}>
                <Text style={styles.modalBtnText}>Activate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', marginTop: 10, marginBottom: 20 },
  card: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#333', marginBottom: 20 },
  sectionTitle: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  label: { color: '#FFF', fontSize: 16, marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#2C2C2C', color: '#FFF', padding: 12, borderRadius: 8, fontSize: 16 },
  btn3D: { backgroundColor: '#D4AF37', padding: 18, borderRadius: 12, marginTop: 20, elevation: 10 },
  btnText: { color: '#000', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  footer: { color: '#555', textAlign: 'center', marginTop: 20, marginBottom: 20 },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 20 },
  modalContent: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#D4AF37' },
  modalTitle: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});