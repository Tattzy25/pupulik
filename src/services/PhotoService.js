import {PermissionsAndroid, Platform} from 'react-native';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import axios from 'axios';
import Config from 'react-native-config';

export class PhotoService {
  static async requestPermissions() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      return Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED,
      );
    }
    return true; // iOS handled separately
  }

  static async getAllMedia() {
    try {
      const photos = await CameraRoll.getPhotos({
        first: 999999999, // Get all photos
        assetType: 'All',
        include: ['fileSize', 'filename', 'playableDuration'],
      });

      return photos.edges.map(edge => ({
        id: edge.node.timestamp.toString(),
        uri: edge.node.image.uri,
        filename: edge.node.image.filename,
        type: edge.node.type,
        width: edge.node.image.width,
        height: edge.node.image.height,
        duration: edge.node.image.playableDuration,
        timestamp: edge.node.timestamp,
      }));
    } catch (error) {
      console.error('Error getting media:', error);
      return [];
    }
  }

  static async analyzeImageForExplicitContent(imageUri) {
    try {
      // Convert image to base64 for Groq API
      const base64Image = await RNFS.readFile(imageUri, 'base64');
      
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.2-11b-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image and determine if it contains explicit, nude, or adult content. Respond with only "EXPLICIT" or "SAFE".'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${Config.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data.choices[0].message.content.trim();
      return result === 'EXPLICIT';
    } catch (error) {
      console.error('Error analyzing image:', error);
      return false; // Default to safe if analysis fails
    }
  }

  static async moveToSecureVault(mediaItem, vaultPath) {
    try {
      const filename = mediaItem.filename || `media_${Date.now()}`;
      const newPath = `${vaultPath}/${filename}`;
      
      // Copy file to secure vault
      await RNFS.copyFile(mediaItem.uri, newPath);
      
      // Delete from camera roll
      await CameraRoll.deletePhotos([mediaItem.uri]);
      
      return {
        ...mediaItem,
        secureUri: newPath,
        originalUri: mediaItem.uri,
      };
    } catch (error) {
      console.error('Error moving to vault:', error);
      throw error;
    }
  }

  static async restoreFromVault(secureItem, originalLocation) {
    try {
      // Copy back to camera roll
      const restoredUri = await CameraRoll.save(secureItem.secureUri, {
        type: secureItem.type,
      });
      
      // Delete from secure vault
      await RNFS.unlink(secureItem.secureUri);
      
      return restoredUri;
    } catch (error) {
      console.error('Error restoring from vault:', error);
      throw error;
    }
  }

  static async createThumbnail(uri, width = 200, height = 200) {
    // This would use react-native-image-resizer for thumbnail generation
    // For now, return the original URI
    return uri;
  }
}