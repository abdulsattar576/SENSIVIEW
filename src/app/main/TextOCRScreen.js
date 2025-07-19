 import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Tts from 'react-native-tts';
import Icon from 'react-native-vector-icons/Ionicons';
import { saveActivity } from '../../services/ActivityService';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import {BASE_URL} from"@env"
Tts.setDefaultLanguage('en-US');

const TextOCRScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [detectedText, setDetectedText] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text) => {
    Tts.stop();
    setIsSpeaking(true);
    Tts.speak(text, {
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const speakResults = (results) => {
    if (results.length === 0) {
      speak('No text detected in this image');
    } else {
      speak(`Detected text: ${results.join(', ')}`);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleImageSelect = async (fromCamera = false) => {
    if (fromCamera) {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission required', 'Camera permission is needed to take photos');
        return;
      }
    }

    const result = fromCamera
      ? await launchCamera({ mediaType: 'photo', quality: 0.8 })
      : await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });

    if (result.didCancel) return;
    if (result.errorCode || !result.assets?.[0]) {
      Alert.alert('Error', result.errorMessage || 'Failed to select image');
      return;
    }

    const asset = result.assets[0];
    setImageUri(asset.uri);
    uploadImage(asset);
  };

  const uploadImage = async (asset) => {
    setLoading(true);
    setDetectedText([]);
    speak('Processing image for text detection...');

    const formData = new FormData();
    formData.append('image', {
      uri: asset.uri,
      name: 'photo.jpg',
      type: asset.type || 'image/jpeg',
    });

    try {
      const response = await fetch(`http://192.168.104.96:8000/api/detect-text/`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      const textResults = data.text || [];
      setDetectedText(textResults);

      await saveActivity({
        type: 'text_detection',
        timestamp: new Date().toISOString(),
        imageUri: asset.uri,
        results: textResults,
        summary: textResults.join(', ') || 'No text detected',
      });

      speakResults(textResults);
    } catch (error) {
      console.error('OCR Error:', error);
      speak('Failed to detect text. Please try again.');
      Alert.alert('Error', error.message || 'Text detection failed');
    } finally {
      setLoading(false);
    }
  };

  const clearDetection = () => {
    Alert.alert(
      'Clear Detection',
      'Are you sure you want to clear the current detection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setImageUri(null);
            setDetectedText([]);
            Tts.stop();
          },
        },
      ]
    );
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Text Recognition</Text>
        <Text style={styles.subtitle}>Extract text from images</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.cameraButton]}
          onPress={() => handleImageSelect(true)}
          disabled={loading || isSpeaking}
        >
          <Icon name="camera-outline" size={scale(20)} color="#fff" />
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.galleryButton]}
          onPress={() => handleImageSelect(false)}
          disabled={loading || isSpeaking}
        >
          <Icon name="images-outline" size={scale(20)} color="#fff" />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {(imageUri || loading) && (
        <View style={styles.contentContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#5E6DFF" />
              <Text style={styles.loadingText}>Processing image...</Text>
            </View>
          )}

          {imageUri && (
            <View style={styles.imageContainer}>
              <View style={styles.imageHeader}>
                <Text style={styles.sectionTitle}>Selected Image</Text>
                <TouchableOpacity onPress={clearDetection}>
                  <Icon name="close" size={scale(20)} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <Image 
                source={{ uri: imageUri }} 
                style={styles.previewImage}
                resizeMode="contain"
              />
            </View>
          )}

          {detectedText.length > 0 && (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Detected Text:</Text>
              <ScrollView style={styles.textResultsContainer}>
                {detectedText.map((text, index) => (
                  <Text key={index} style={styles.resultText}>
                    {text}
                  </Text>
                ))}
              </ScrollView>
            </View>
          )}

          {!loading && !detectedText.length && imageUri && (
            <Text style={styles.noResultsText}>No text detected in this image</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: moderateScale(20),
    backgroundColor: '#F9FAFB',
  },
  header: {
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: verticalScale(4),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: moderateScale(16),
    marginBottom: verticalScale(24),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(12),
    minWidth: moderateScale(140),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraButton: {
    backgroundColor: '#3B82F6',
  },
  galleryButton: {
    backgroundColor: '#6366F1',
  },
  buttonText: {
    color: '#fff',
    marginLeft: moderateScale(8),
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  contentContainer: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(20),
    marginVertical: verticalScale(16),
  },
  loadingText: {
    marginTop: verticalScale(12),
    color: '#6B7280',
    fontSize: moderateScale(16),
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
  },
  previewImage: {
    width: '100%',
    height: verticalScale(250),
    borderRadius: moderateScale(8),
    backgroundColor: '#f3f4f6',
  },
  resultBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultTitle: {
    fontWeight: '600',
    fontSize: moderateScale(18),
    marginBottom: verticalScale(12),
    color: '#1e40af',
  },
  textResultsContainer: {
    maxHeight: verticalScale(200),
  },
  resultText: {
    fontSize: moderateScale(16),
    color: '#111827',
    marginBottom: verticalScale(8),
    lineHeight: verticalScale(24),
  },
  noResultsText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
  },
});

export default TextOCRScreen;