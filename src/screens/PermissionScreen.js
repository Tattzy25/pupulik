import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';

export default function PermissionScreen({navigation}) {
  const requestPermissions = async () => {
    try {
      let result;
      
      if (Platform.OS === 'ios') {
        result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      } else {
        result = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
        if (result === RESULTS.GRANTED) {
          const videoResult = await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
          if (videoResult !== RESULTS.GRANTED) {
            Alert.alert('Permission Required', 'Video access is required to scan all media.');
            return;
          }
        }
      }

      if (result === RESULTS.GRANTED) {
        navigation.replace('Scanner');
      } else {
        Alert.alert(
          'Permission Denied',
          'This app needs access to your photos and videos to scan for explicit content. Please grant permission in Settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => navigation.replace('Scanner')},
          ],
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Photo Library Access</Text>
        <Text style={styles.description}>
          This app needs access to your photos and videos to scan for explicit content. 
          Your media will never be uploaded to any server - all processing happens locally on your device.
        </Text>
        
        <View style={styles.features}>
          <Text style={styles.featureText}>✓ Local processing only</Text>
          <Text style={styles.featureText}>✓ No data uploaded</Text>
          <Text style={styles.featureText}>✓ Secure local storage</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  features: {
    marginBottom: 40,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});