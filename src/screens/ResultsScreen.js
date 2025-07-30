import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';

export default function ResultsScreen({route, navigation}) {
  const {explicitItems} = route.params;

  const photoCount = explicitItems.filter(item => !item.duration).length;
  const videoCount = explicitItems.filter(item => item.duration > 0).length;

  const handleMoveItems = () => {
    if (explicitItems.length === 0) {
      Alert.alert('No Items', 'No explicit content found to move.');
      return;
    }

    navigation.navigate('Payment', {itemsToMove: explicitItems});
  };

  const renderItem = ({item}) => (
    <View style={styles.thumbnailContainer}>
      <Image 
        source={{uri: item.uri}} 
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <BlurView
        style={StyleSheet.absoluteFillObject}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
      {item.duration > 0 && (
        <View style={styles.videoIndicator}>
          <Text style={styles.videoText}>▶</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Results</Text>
        <Text style={styles.countText}>
          {photoCount} photo{photoCount !== 1 ? 's' : ''} and {videoCount} video{videoCount !== 1 ? 's' : ''} found
        </Text>
      </View>

      {explicitItems.length > 0 ? (
        <>
          <FlatList
            data={explicitItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.footer}>
            <TouchableOpacity style={styles.moveButton} onPress={handleMoveItems}>
              <Text style={styles.moveButtonText}>Move and Hide Now</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No explicit content found!</Text>
          <Text style={styles.emptySubtext}>
            Your media library appears to be clean.
          </Text>
        </View>
      )}
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  countText: {
    fontSize: 18,
    color: '#007AFF',
  },
  grid: {
    paddingHorizontal: 10,
  },
  thumbnailContainer: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#fff',
    fontSize: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  moveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  moveButtonText: {
    color: '#fff',
    fontSize: 18,
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
});