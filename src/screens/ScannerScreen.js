import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {PhotoService} from '../services/PhotoService';
import {SecureStorageService} from '../services/SecureStorageService';

export default function ScannerScreen({navigation}) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [currentFile, setCurrentFile] = useState(0);
  const [explicitItems, setExplicitItems] = useState([]);

  useEffect(() => {
    startScan();
  }, []);

  const startScan = async () => {
    setIsScanning(true);
    
    try {
      // Initialize secure vault
      await SecureStorageService.initializeVault();
      
      // Get all media files
      const allMedia = await PhotoService.getAllMedia();
      setTotalFiles(allMedia.length);
      
      const explicitFound = [];
      
      // Process files in batches to avoid memory issues
      const batchSize = 5;
      for (let i = 0; i < allMedia.length; i += batchSize) {
        const batch = allMedia.slice(i, i + batchSize);
        
        const results = await Promise.allSettled(
          batch.map(async (item) => {
            const isExplicit = await PhotoService.analyzeImageForExplicitContent(item.uri);
            return {item, isExplicit};
          })
        );
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.isExplicit) {
            explicitFound.push(result.value.item);
          }
        });
        
        // Update progress
        setCurrentFile(Math.min(i + batchSize, allMedia.length));
        setProgress((i + batchSize) / allMedia.length);
      }
      
      setExplicitItems(explicitFound);
      setIsScanning(false);
      
      // Navigate to results
      navigation.replace('Results', {explicitItems: explicitFound});
      
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert(
        'Scan Error',
        'Failed to scan your media. Please try again.',
        [{text: 'OK', onPress: () => navigation.goBack()}]
      );
      setIsScanning(false);
    }
  };

  const formatProgress = () => {
    if (totalFiles === 0) return 'No media found';
    return `Scanning ${currentFile} of ${totalFiles}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scanning Media</Text>
        
        {isScanning ? (
          <>
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            
            <Text style={styles.progressText}>{formatProgress()}</Text>
            
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, {width: `${progress * 100}%`}]} 
              />
            </View>
            
            <Text style={styles.subtitle}>
              This may take a few minutes depending on your library size
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.completeText}>Scan Complete</Text>
            <Text style={styles.resultText}>
              Found {explicitItems.length} explicit items
            </Text>
          </>
        )}
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
  loader: {
    marginBottom: 30,
  },
  progressText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
  completeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 18,
    color: '#007AFF',
  },
});