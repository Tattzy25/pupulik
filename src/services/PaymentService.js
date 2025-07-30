import Config from 'react-native-config';
import * as RNIap from 'react-native-iap';

const PRODUCT_ID = Config.PAYMENT_PRODUCT_ID || 'explicit_scan_operation_499';

class PaymentService {
  constructor() {
    this.connected = false;
    this.products = [];
  }

  async initialize() {
    try {
      await RNIap.initConnection();
      this.connected = true;
      
      // Get product details
      const products = await RNIap.getProducts([PRODUCT_ID]);
      this.products = products;
      
      console.log('Payment service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize payment service:', error);
      this.connected = false;
      throw new Error('Payment service initialization failed');
    }
  }

  async processPayment() {
    if (!this.connected) {
      throw new Error('Payment service not initialized');
    }

    try {
      // Request purchase
      const purchase = await RNIap.requestPurchase(PRODUCT_ID);
      
      // Validate receipt
      const validation = await this.validateReceipt(purchase);
      
      if (validation.valid) {
        // Finish transaction
        await RNIap.finishTransaction(purchase);
        
        return {
          success: true,
          transactionId: purchase.transactionId,
          receipt: purchase.transactionReceipt,
          productId: purchase.productId
        };
      } else {
        throw new Error('Receipt validation failed');
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  async validateReceipt(purchase) {
    try {
      // For production, you would validate with your backend
      // This is a simplified client-side validation
      const receipt = purchase.transactionReceipt;
      
      if (!receipt) {
        return { valid: false };
      }

      // In production, send to your backend for validation
      // For now, we'll consider it valid if receipt exists
      return { valid: true };
    } catch (error) {
      console.error('Receipt validation error:', error);
      return { valid: false };
    }
  }

  async getProductDetails() {
    if (!this.connected) {
      throw new Error('Payment service not initialized');
    }

    try {
      const products = await RNIap.getProducts([PRODUCT_ID]);
      if (products.length === 0) {
        throw new Error('Product not found in store');
      }

      const product = products[0];
      return {
        productId: product.productId,
        title: product.title,
        description: product.description,
        price: product.localizedPrice,
        currency: product.currency,
        priceAmount: product.price
      };
    } catch (error) {
      console.error('Failed to get product details:', error);
      throw new Error('Could not retrieve product information');
    }
  }

  async restorePurchases() {
    if (!this.connected) {
      throw new Error('Payment service not initialized');
    }

    try {
      const purchases = await RNIap.getAvailablePurchases();
      
      // Check if our product was purchased
      const hasPurchased = purchases.some(p => p.productId === PRODUCT_ID);
      
      return {
        success: true,
        purchases: purchases,
        hasPurchased: hasPurchased
      };
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw new Error('Could not restore purchases');
    }
  }

  async closeConnection() {
    try {
      await RNIap.endConnection();
      this.connected = false;
      console.log('Payment service connection closed');
    } catch (error) {
      console.error('Error closing payment connection:', error);
    }
  }

  addPurchaseListener(callback) {
    return RNIap.purchaseUpdatedListener(callback);
  }

  addPurchaseErrorListener(callback) {
    return RNIap.purchaseErrorListener(callback);
  }
}

export default new PaymentService();