import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Tts from 'react-native-tts';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import { saveActivity } from '../../services/ActivityService';
import {BASE_URL} from"@env"
const BACKEND_URL = `${BASE_URL}:8000/api/detect/`;

const ImageBaseDetection = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [detections, setDetections] = useState([]);
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
      speak('No objects detected in this image');
    } else {
      const summary = results.reduce((acc, cur) => {
        const label = cur.class_name.toLowerCase();
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      }, {});
      
      const message = Object.entries(summary)
        .map(([label, count]) => `${count} ${label}${count > 1 ? 's' : ''}`)
        .join(', ');
      
      speak(`Detected ${message}`);
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

  const processImage = async (image) => {
    if (!image || !image.uri) {
      Alert.alert('Error', 'Invalid image selected');
      return;
    }

    const formData = new FormData();
    formData.append('image', {
      uri: image.uri,
      type: image.type || 'image/jpeg',
      name: image.fileName || 'photo.jpg',
    });

    try {
      setLoading(true);
      speak("Processing image, please wait");

      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Detection failed');

      const data = await res.json();
      if (!data.original_image || !data.annotated_image) {
        throw new Error('Invalid response from server');
      }

      const originalImgUri = `data:image/jpeg;base64,${data.original_image}`;
      const annotatedImgUri = `data:image/jpeg;base64,${data.annotated_image}`;
      const detectionsData = data.detections || [];

      setOriginalImage(originalImgUri);
      setAnnotatedImage(annotatedImgUri);
      setDetections(detectionsData);

      await saveActivity({
        type: 'object_detection',
        timestamp: new Date().toISOString(),
        imageUri: originalImgUri,
        results: detectionsData,
        summary: summarizeDetections(detectionsData),
      });

      speakResults(detectionsData);
    } catch (err) {
      console.error('Detection error:', err);
      speak("Failed to process image");
      Alert.alert('Error', err.message || 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  const summarizeDetections = (detections) => {
    const counts = detections.reduce((acc, cur) => {
      const label = cur.class_name.toLowerCase();
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([label, count]) => `${count} ${label}${count > 1 ? 's' : ''}`)
      .join(', ');
  };

  const handleImagePick = async (source) => {
    const options = { 
      mediaType: 'photo',
      quality: 0.8,
    };

    try {
      if (source === 'camera') {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          speak("Camera permission is required");
          return;
        }
      }

      const result = source === 'camera' 
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (result.didCancel) {
        speak("Image selection cancelled");
        return;
      }

      if (result.errorCode || !result.assets?.[0]) {
        speak("Failed to select image");
        Alert.alert('Error', result.errorMessage || 'Failed to select image');
        return;
      }

      processImage(result.assets[0]);
    } catch (error) {
      console.error('Image picker error:', error);
      speak("Error accessing images");
      Alert.alert('Error', error.message || 'Error accessing images');
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
            setOriginalImage(null);
            setAnnotatedImage(null);
            setDetections([]);
            Tts.stop();
          },
        },
      ]
    );
  };

  const groupedDetections = detections.reduce((acc, cur) => {
    const key = cur.class_name;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Object Detection</Text>
        <Text style={styles.subtitle}>For visually impaired assistance</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cameraButton]}
          onPress={() => handleImagePick('camera')}
          disabled={loading || isSpeaking}
        >
          <Icon name="camera-outline" size={scale(22)} color="#fff" />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.galleryButton]}
          onPress={() => handleImagePick('gallery')}
          disabled={loading || isSpeaking}
        >
          <Icon name="images-outline" size={scale(22)} color="#fff" />
          <Text style={styles.buttonText}>Choose Photo</Text>
        </TouchableOpacity>
      </View>

      {(originalImage || loading) && (
        <View style={styles.contentContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size={scale(40)} color="#5E6DFF" />
              <Text style={styles.loadingText}>Processing image...</Text>
            </View>
          )}

          {originalImage && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Original Image</Text>
                <TouchableOpacity onPress={clearDetection}>
                  <Icon name="close" size={scale(20)} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <Image 
                source={{ uri: originalImage }} 
                style={styles.image}
                accessibilityIgnoresInvertColors
              />
            </View>
          )}

          {annotatedImage && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Detection Results</Text>
              <Image 
                source={{ uri: annotatedImage }} 
                style={styles.image}
                accessibilityIgnoresInvertColors
              />
            </View>
          )}

          {detections.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Detected Objects</Text>
              <View style={styles.detectionsContainer}>
                {Object.entries(groupedDetections).map(([label, count], index) => (
                  <View key={index} style={styles.detectionItem}>
                    <Text style={styles.detectionCount}>{count}</Text>
                    <Text style={styles.detectionLabel}>
                      {label}{count > 1 ? 's' : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
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
    marginBottom: verticalScale(25),
    alignItems: 'center',
  },
  title: {
    fontSize: moderateScale(26),
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: '#6B7280',
    marginTop: verticalScale(4),
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: moderateScale(15),
    marginBottom: verticalScale(20),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(10),
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
    marginVertical: verticalScale(20),
    padding: moderateScale(20),
  },
  loadingText: {
    marginTop: verticalScale(10),
    color: '#6B7280',
    fontSize: moderateScale(16),
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  cardTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
  },
  image: {
    width: '100%',
    height: verticalScale(220),
    borderRadius: moderateScale(8),
    resizeMode: 'contain',
    backgroundColor: '#f3f4f6',
  },
  detectionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(12),
  },
  detectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingVertical: verticalScale(6),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(20),
  },
  detectionCount: {
    fontWeight: 'bold',
    color: '#4338CA',
    marginRight: moderateScale(4),
  },
  detectionLabel: {
    color: '#4338CA',
    fontSize: moderateScale(14),
  },
});

export default ImageBaseDetection;