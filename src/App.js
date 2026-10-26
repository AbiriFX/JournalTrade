import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HistoryScreen from './screens/HistoryScreen';
import HomeScreen from './screens/HomeScreen';
import NewSignalScreen from './screens/NewSignalScreen';
import ReportsScreen from './screens/ReportsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#D4AF37',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="NewSignal" component={NewSignalScreen} options={{ title: 'New Signal' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Trade History' }} />
        <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}