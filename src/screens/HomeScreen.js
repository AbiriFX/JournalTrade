import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* بخش هدر با لوگو و تیتر */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/icon.png')} 
          style={styles.logo} 
        />
        <Text style={styles.title}>Journal Trade</Text>
        <Text style={styles.subtitle}>Professional Trading Journal</Text>
      </View>

      {/* دکمه‌های منو */}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  logo: { width: 100, height: 100, marginBottom: 15, tintColor: '#D4AF37' }, // رنگ طلایی به لوگو می‌دهد
  title: { fontSize: 36, fontWeight: 'bold', color: '#D4AF37', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#888', marginTop: 5 },
  menu: { flex: 1, justifyContent: 'center' },
  card: { 
    backgroundColor: '#1E1E1E', 
    padding: 25, 
    borderRadius: 15, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardIcon: { fontSize: 30, marginRight: 20 },
  cardText: { fontSize: 20, color: '#FFF', fontWeight: 'bold' },
});