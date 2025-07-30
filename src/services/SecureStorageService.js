import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import CryptoJS from 'crypto-js';
import Config from 'react-native-config';

const VAULT_DIR = `${RNFS.DocumentDirectoryPath}/secure_vault`;
const METADATA_KEY = '@vault_metadata';
const ENCRYPTION_KEY = Config.VAULT_ENCRYPTION_KEY || 'pupulik-secure-vault-key-2024';

class SecureStorageService {
  constructor() {
    this.initialized = false;
  }

  async initializeVault() {
    try {
      // Ensure vault directory exists
      const exists = await RNFS.exists(VAULT_DIR);
      if (!exists) {
        await RNFS.mkdir(VAULT_DIR);
      }

      // Initialize metadata
      const metadata = await AsyncStorage.getItem(METADATA_KEY);
      if (!metadata) {
        await AsyncStorage.setItem(METADATA_KEY, JSON.stringify({
          items: [],
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }));
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize vault:', error);
      throw new Error('Vault initialization failed');
    }
  }

  async storeMediaItem(originalPath, filename) {
    if (!this.initialized) {
      await this.initializeVault();
    }

    try {
      // Read file content
      const fileContent = await RNFS.readFile(originalPath, 'base64');
      
      // Encrypt content
      const encryptedContent = CryptoJS.AES.encrypt(fileContent, ENCRYPTION_KEY).toString();
      
      // Generate secure filename
      const secureFilename = this.generateSecureFilename(filename);
      const securePath = `${VAULT_DIR}/${secureFilename}`;
      
      // Write encrypted content
      await RNFS.writeFile(securePath, encryptedContent, 'utf8');
      
      // Update metadata
      await this.updateMetadata(originalPath, securePath, filename);
      
      // Delete original file
      await RNFS.unlink(originalPath);
      
      return {
        success: true,
        securePath: securePath,
        originalPath: originalPath
      };
    } catch (error) {
      console.error('Failed to store media item:', error);
      throw new Error('Failed to secure media item');
    }
  }

  async restoreMediaItem(securePath) {
    if (!this.initialized) {
      await this.initializeVault();
    }

    try {
      // Read encrypted content
      const encryptedContent = await RNFS.readFile(securePath, 'utf8');
      
      // Decrypt content
      const decryptedContent = CryptoJS.AES.decrypt(encryptedContent, ENCRYPTION_KEY);
      const base64Content = decryptedContent.toString(CryptoJS.enc.Utf8);
      
      if (!base64Content) {
        throw new Error('Decryption failed or corrupted data');
      }
      
      // Get original filename from metadata
      const metadata = await this.getMetadata();
      const item = metadata.items.find(i => i.securePath === securePath);
      
      if (!item) {
        throw new Error('Original file metadata not found');
      }
      
      // Write decrypted content back to original location
      const originalDir = item.originalPath.substring(0, item.originalPath.lastIndexOf('/'));
      const originalDirExists = await RNFS.exists(originalDir);
      if (!originalDirExists) {
        await RNFS.mkdir(originalDir);
      }
      
      await RNFS.writeFile(item.originalPath, base64Content, 'base64');
      
      // Remove from vault
      await RNFS.unlink(securePath);
      await this.removeFromMetadata(securePath);
      
      return {
        success: true,
        originalPath: item.originalPath
      };
    } catch (error) {
      console.error('Failed to restore media item:', error);
      throw new Error('Failed to restore media item');
    }
  }

  async getVaultContents() {
    if (!this.initialized) {
      await this.initializeVault();
    }

    try {
      const metadata = await this.getMetadata();
      return metadata.items;
    } catch (error) {
      console.error('Failed to get vault contents:', error);
      throw new Error('Failed to retrieve vault contents');
    }
  }

  async clearVault() {
    if (!this.initialized) {
      await this.initializeVault();
    }

    try {
      // Delete all files in vault
      const files = await RNFS.readDir(VAULT_DIR);
      for (const file of files) {
        if (file.isFile()) {
          await RNFS.unlink(file.path);
        }
      }
      
      // Clear metadata
      await AsyncStorage.setItem(METADATA_KEY, JSON.stringify({
        items: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Failed to clear vault:', error);
      throw new Error('Failed to clear vault');
    }
  }

  async getVaultSize() {
    if (!this.initialized) {
      await this.initializeVault();
    }

    try {
      const files = await RNFS.readDir(VAULT_DIR);
      let totalSize = 0;
      
      for (const file of files) {
        if (file.isFile()) {
          totalSize += file.size;
        }
      }
      
      return {
        totalFiles: files.filter(f => f.isFile()).length,
        totalSize: totalSize
      };
    } catch (error) {
      console.error('Failed to get vault size:', error);
      throw new Error('Failed to calculate vault size');
    }
  }

  async exportVault() {
    if (!this.initialized) {
      await this.initializeVault();
    }

    try {
      const metadata = await this.getMetadata();
      const zipPath = `${RNFS.DocumentDirectoryPath}/vault_export_${Date.now()}.json`;
      
      const exportData = {
        metadata: metadata,
        exportDate: new Date().toISOString(),
        appVersion: Config.APP_VERSION || '1.0.0'
      };
      
      await RNFS.writeFile(zipPath, JSON.stringify(exportData, null, 2), 'utf8');
      
      return {
        success: true,
        exportPath: zipPath
      };
    } catch (error) {
      console.error('Failed to export vault:', error);
      throw new Error('Failed to export vault data');
    }
  }

  async createTemporaryRestore(originalPath) {
    if (!this.initialized) {
      await this.initializeVault();
    }

    try {
      // This is a temporary restore that doesn't remove from vault
      const metadata = await this.getMetadata();
      const item = metadata.items.find(i => i.originalPath === originalPath);
      
      if (!item) {
        throw new Error('Media item not found in vault');
      }
      
      const encryptedContent = await RNFS.readFile(item.securePath, 'utf8');
      const decryptedContent = CryptoJS.AES.decrypt(encryptedContent, ENCRYPTION_KEY);
      const base64Content = decryptedContent.toString(CryptoJS.enc.Utf8);
      
      if (!base64Content) {
        throw new Error('Decryption failed');
      }
      
      const tempPath = `${RNFS.TemporaryDirectoryPath}/temp_restore_${Date.now()}.jpg`;
      await RNFS.writeFile(tempPath, base64Content, 'base64');
      
      return {
        success: true,
        tempPath: tempPath
      };
    } catch (error) {
      console.error('Failed to create temporary restore:', error);
      throw new Error('Failed to create temporary restore');
    }
  }

  generateSecureFilename(originalFilename) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = originalFilename.split('.').pop();
    return `secure_${timestamp}_${random}.${extension}`;
  }

  async updateMetadata(originalPath, securePath, filename) {
    const metadata = await this.getMetadata();
    
    metadata.items.push({
      originalPath: originalPath,
      securePath: securePath,
      filename: filename,
      addedAt: new Date().toISOString(),
      fileSize: await this.getFileSize(securePath)
    });
    
    metadata.lastUpdated = new Date().toISOString();
    await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  }

  async removeFromMetadata(securePath) {
    const metadata = await this.getMetadata();
    metadata.items = metadata.items.filter(item => item.securePath !== securePath);
    metadata.lastUpdated = new Date().toISOString();
    await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  }

  async getMetadata() {
    const metadata = await AsyncStorage.getItem(METADATA_KEY);
    return metadata ? JSON.parse(metadata) : { items: [] };
  }

  async getFileSize(filePath) {
    try {
      const stat = await RNFS.stat(filePath);
      return stat.size;
    } catch (error) {
      return 0;
    }
  }
}

export default new SecureStorageService();