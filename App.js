import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PermissionsAndroid, Platform, Alert} from 'react-native';
import PermissionScreen from './src/screens/PermissionScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import SecureVaultScreen from './src/screens/SecureVaultScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      const allGranted = Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED,
      );

      if (allGranted) {
        setHasPermission(true);
      } else {
        Alert.alert(
          'Permission Required',
          'This app needs access to your photos and videos to scan for explicit content.',
        );
      }
    } else {
      // iOS permissions are handled in PermissionScreen
      setHasPermission(true);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={hasPermission ? 'Scanner' : 'Permission'}
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Permission" component={PermissionScreen} />
        <Stack.Screen name="Scanner" component={ScannerScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="SecureVault" component={SecureVaultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}