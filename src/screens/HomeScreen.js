import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/icon.png')} 
          style={styles.logo} 
        />
        <Text style={styles.title}>Journal Trade</Text>
        <Text style={styles.subtitle}>Professional Trading Journal</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('NewSignal')}>
          <Text style={styles.cardIcon}>📈</Text>
          <Text style={styles.cardText}>Register Signal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('History')}>
          <Text style={styles.cardIcon}>📜</Text>
          <Text style={styles.cardText}>Trade History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Reports')}>
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardText}>Reports & Analytics</Text>
        </TouchableOpacity>

        {/* دکمه جدید تنظیمات */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.cardIcon}>⚙️</Text>
          <Text style={styles.cardText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { alignItems: 'center', marginTop: 30, marginBottom: 20 },
  logo: { width: 120, height: 120, marginBottom: 10, resizeMode: 'contain' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#D4AF37', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 5 },
  menu: { flex: 1, justifyContent: 'center' },
  card: { 
    backgroundColor: '#1E1E1E', 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
  },
  cardIcon: { fontSize: 26, marginRight: 20 },
  cardText: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },
});