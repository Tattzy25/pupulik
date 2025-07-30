import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import {Video} from 'react-native-video';
import {SecureStorageService} from '../services/SecureStorageService';
import {PhotoService} from '../services/PhotoService';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

export default function SecureVaultScreen() {
  const [vaultItems, setVaultItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [zipPassword, setZipPassword] = useState('');

  useEffect(() => {
    loadVaultItems();
  }, []);

  const loadVaultItems = async () => {
    try {
      const items = await SecureStorageService.getAllItems();
      setVaultItems(items);
    } catch (error) {
      console.error('Error loading vault items:', error);
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleShareItem = async (item) => {
    try {
      const shareOptions = {
        url: `file://${item.securePath}`,
        type: item.type === 'video' ? 'video/*' : 'image/*',
      };
      
      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error sharing item:', error);
    }
  };

  const handleRestorePermanently = async (item) => {
    Alert.alert(
      'Restore Permanently',
      'This will restore the item to your main gallery.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await PhotoService.restoreToGallery(item);
              await SecureStorageService.removeItem(item.id);
              loadVaultItems();
              Alert.alert('Success', 'Item restored to gallery');
            } catch (error) {
              Alert.alert('Error', 'Failed to restore item');
            }
          },
        },
      ]
    );
  };

  const handleTemporaryRestore = async (item) => {
    Alert.alert(
      'Temporary Restore',
      'Restore for 5 minutes then auto-hide?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Restore for 5 min',
          onPress: async () => {
            try {
              await PhotoService.temporaryRestore(item, 5 * 60 * 1000); // 5 minutes
              Alert.alert('Success', 'Item temporarily restored');
            } catch (error) {
              Alert.alert('Error', 'Failed to temporarily restore item');
            }
          },
        },
      ]
    );
  };

  const handleExportAsZip = async () => {
    if (!zipPassword.trim()) {
      Alert.alert('Error', 'Please enter a password for the ZIP file');
      return;
    }

    try {
      const zipPath = await SecureStorageService.exportToZip(zipPassword);
      
      const shareOptions = {
        url: `file://${zipPath}`,
        type: 'application/zip',
        filename: 'secure-vault-export.zip',
      };
      
      await Share.open(shareOptions);
      setExportModalVisible(false);
      setZipPassword('');
      
      Alert.alert('Success', 'ZIP file exported successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to export ZIP file');
    }
  };

  const handleDeleteItem = async (item) => {
    Alert.alert(
      'Delete Item',
      'This will permanently delete the item from secure vault.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await RNFS.unlink(item.securePath);
              await SecureStorageService.removeItem(item.id);
              loadVaultItems();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({item}) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => handleViewItem(item)}>
        {item.type === 'video' ? (
          <View style={styles.thumbnailContainer}>
            <Image source={{uri: item.thumbnailUri}} style={styles.thumbnail} />
            <View style={styles.videoOverlay}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </View>
        ) : (
          <Image source={{uri: item.securePath}} style={styles.thumbnail} />
        )}
      </TouchableOpacity>
      
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => handleShareItem(item)} style={styles.actionButton}>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleRestorePermanently(item)} style={styles.actionButton}>
          <Text style={styles.actionText}>Restore</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTemporaryRestore(item)} style={styles.actionButton}>
          <Text style={styles.actionText}>Temp Restore</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteItem(item)} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Secure Vault</Text>
        <Text style={styles.subtitle}>{vaultItems.length} item{vaultItems.length !== 1 ? 's' : ''} secured</Text>
        
        {vaultItems.length > 0 && (
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={() => setExportModalVisible(true)}
          >
            <Text style={styles.exportButtonText}>Export as ZIP</Text>
          </TouchableOpacity>
        )}
      </View>

      {vaultItems.length > 0 ? (
        <FlatList
          data={vaultItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items in secure vault</Text>
          <Text style={styles.emptySubtext}>Run a scan to find and secure explicit content</Text>
        </View>
      )}

      {/* Full-screen viewer modal */}
      <Modal visible={modalVisible} transparent={false} animationType="fade">
        <View style={styles.modalContainer}>
          {selectedItem && (
            <>
              {selectedItem.type === 'video' ? (
                <Video
                  source={{uri: selectedItem.securePath}}
                  style={styles.fullScreenMedia}
                  resizeMode="contain"
                  paused={false}
                  repeat
                />
              ) : (
                <Image 
                  source={{uri: selectedItem.securePath}} 
                  style={styles.fullScreenMedia}
                  resizeMode="contain"
                />
              )}
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

      {/* Export ZIP modal */}
      <Modal visible={exportModalVisible} transparent animationType="slide">
        <View style={styles.exportModalContainer}>
          <View style={styles.exportModalContent}>
            <Text style={styles.exportModalTitle}>Export Secure Vault</Text>
            <Text style={styles.exportModalText}>
              Enter a password for the ZIP file:
            </Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={zipPassword}
              onChangeText={setZipPassword}
              secureTextEntry
            />
            <View style={styles.exportModalButtons}>
              <TouchableOpacity 
                style={styles.cancelExportButton}
                onPress={() => {
                  setExportModalVisible(false);
                  setZipPassword('');
                }}
              >
                <Text style={styles.cancelExportText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmExportButton}
                onPress={handleExportAsZip}
              >
                <Text style={styles.confirmExportText}>Export</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    marginTop: 5,
  },
  exportButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  itemContainer: {
    marginBottom: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  videoOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -15}, {translateY: -15}],
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: 16,
  },
  itemActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    margin: 2,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    margin: 2,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenMedia: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  exportModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  exportModalContent: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  exportModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  exportModalText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 15,
  },
  passwordInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  exportModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelExportButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelExportText: {
    color: '#ccc',
    fontSize: 16,
  },
  confirmExportButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmExportText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});