import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {PaymentService} from '../services/PaymentService';
import {PhotoService} from '../services/PhotoService';
import {SecureStorageService} from '../services/SecureStorageService';

export default function PaymentScreen({route, navigation}) {
  const {itemsToMove} = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [productDetails, setProductDetails] = useState(null);

  useEffect(() => {
    loadProductDetails();
    return () => {
      PaymentService.closeConnection();
    };
  }, []);

  const loadProductDetails = async () => {
    try {
      const details = await PaymentService.getProductDetails();
      setProductDetails(details);
    } catch (error) {
      console.error('Error loading product details:', error);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Process payment
      const paymentResult = await PaymentService.processPayment();

      if (paymentResult.success) {
        // Move items to secure vault
        await moveItemsToVault();
        
        Alert.alert(
          'Success',
          'Payment processed successfully. Moving items to secure vault...',
          [{text: 'OK', onPress: () => navigation.replace('SecureVault')}]
        );
      } else {
        Alert.alert(
          'Payment Failed',
          paymentResult.error || 'Payment processing failed. Please try again.'
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'An error occurred during payment processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const moveItemsToVault = async () => {
    try {
      const vaultPath = await SecureStorageService.initializeVault();
      
      for (const item of itemsToMove) {
        try {
          const movedItem = await PhotoService.moveToSecureVault(item, vaultPath);
          await SecureStorageService.storeMediaItem(movedItem, {
            originalUri: item.uri,
            type: item.type,
            detectedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error(`Error moving item ${item.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error moving items to vault:', error);
      throw error;
    }
  };

  const formatItemCount = () => {
    const photoCount = itemsToMove.filter(item => !item.duration).length;
    const videoCount = itemsToMove.filter(item => item.duration > 0).length;
    
    let countText = '';
    if (photoCount > 0) {
      countText += `${photoCount} photo${photoCount !== 1 ? 's' : ''}`;
    }
    if (videoCount > 0) {
      if (countText) countText += ' and ';
      countText += `${videoCount} video${videoCount !== 1 ? 's' : ''}`;
    }
    
    return countText;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Secure Your Content</Text>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Items to Secure</Text>
          <Text style={styles.itemCount}>{formatItemCount()}</Text>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceText}>$4.99</Text>
          <Text style={styles.priceSubtext}>One-time scan & secure</Text>
        </View>

        <View style={styles.features}>
          <Text style={styles.feature}>✓ Move to secure vault</Text>
          <Text style={styles.feature}>✓ Remove from gallery</Text>
          <Text style={styles.feature}>✓ Full control & privacy</Text>
          <Text style={styles.feature}>✓ Local storage only</Text>
        </View>

        <TouchableOpacity 
          style={[styles.payButton, isProcessing && styles.disabledButton]} 
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Pay $4.99 & Secure Content</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 5,
  },
  itemCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  priceCard: {
    backgroundColor: '#007AFF',
    padding: 25,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  priceSubtext: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  features: {
    marginBottom: 30,
    width: '100%',
  },
  feature: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 8,
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});