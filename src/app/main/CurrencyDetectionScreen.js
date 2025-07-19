import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useCameraPermission, useCameraDevices, Camera } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Tts from 'react-native-tts';
import {WEBSOCKET_URL} from '@env'
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Initialize TTS
Tts.setDefaultLanguage('en-US');
Tts.setDefaultRate(0.5);
Tts.setDefaultPitch(1.0);

const CurrencyDetectionScreen = () => {
  // State
  const [isFront, setIsFront] = useState(false);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs
  const camera = useRef(null);
  const ws = useRef(null);
  const frameInterval = useRef(null);
  const heartbeatInterval = useRef(null);
  const frameCounter = useRef(0);
  const lastDetections = useRef([]);

  // Camera permissions and devices
  const { hasPermission, requestPermission } = useCameraPermission();
  const devices = useCameraDevices(['wide-angle-camera']);
  const device = isFront ? devices.find((d) => d.position === 'front') : devices.find((d) => d.position === 'back');

  // Speak function
  const speak = useCallback((text) => {
    Tts.stop();
    Tts.speak(text);
  }, []);

  // WebSocket setup
  const setupWebSocket = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }

  ws.current = new WebSocket(`ws://192.168.104.96:8000/ws/currency/`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
      speak('Connected to server');
      heartbeatInterval.current = setInterval(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 5000);
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.detections) {
          setDetections(data.detections);
        } else if (data.error) {
          console.log('Server error:', data.error);
          speak(data.error);
        }
      } catch (e) {
        console.log('Data parse error');
        speak('Error receiving data');
      }
    };

    ws.current.onerror = () => {
      console.log('WebSocket connection failed');
      setError('Connection failed');
      setIsConnected(false);
      speak('Connection failed');
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      speak('Disconnected from server');
      clearInterval(heartbeatInterval.current);
      setTimeout(setupWebSocket, 3000);
    };
  }, [speak]);

  // Process camera frame
  const processFrame = useCallback(async () => {
    if (!camera.current || !ws.current || ws.current.readyState !== WebSocket.OPEN || isProcessing) {
      return;
    }

    frameCounter.current++;
    if (frameCounter.current % 3 !== 0) return;

    setIsProcessing(true);

    try {
      const photo = await camera.current.takePhoto({
        quality: 0.3,
        skipMetadata: true,
        flash: 'off',
      });

      const base64 = await RNFS.readFile(photo.path, 'base64');
      ws.current.send(
        JSON.stringify({
          frame: base64,
          width: 224,
          height: 224,
        })
      );

      await RNFS.unlink(photo.path).catch(() => console.log('File cleanup failed'));
    } catch (e) {
      console.log('Frame processing failed');
      speak('Error capturing image');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, speak]);

  // Announce detections
  useEffect(() => {
    if (detections.length > 0) {
      const currentDetections = detections.map((det) => ({
        label: det.label,
        confidence: det.confidence,
      }));
      const prevDetections = lastDetections.current;

      const hasChanged = currentDetections.some((curr, i) => {
        const prev = prevDetections[i];
        return !prev || curr.label !== prev.label || Math.abs(curr.confidence - prev.confidence) > 0.1;
      });

      if (hasChanged || currentDetections.length !== prevDetections.length) {
        const detectionText = detections.map((det) => `${det.label.replace('_', ' ')}`).join('. ');
        console.log('Detections:', detectionText);
        speak(detectionText);
        lastDetections.current = currentDetections;
      }
    } else if (lastDetections.current.length > 0) {
      console.log('No currency detected');
      speak('No currency detected');
      lastDetections.current = [];
    }
  }, [detections, speak]);

  // Cleanup on unmount
  useEffect(() => {
    setupWebSocket();
    return () => {
      Tts.stop();
      if (ws.current) ws.current.close();
      if (frameInterval.current) clearInterval(frameInterval.current);
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
    };
  }, [setupWebSocket]);

  // Frame processing interval
  useEffect(() => {
    if (!isConnected) {
      if (frameInterval.current) clearInterval(frameInterval.current);
      return;
    }

    frameInterval.current = setInterval(processFrame, 400);
    return () => {
      if (frameInterval.current) clearInterval(frameInterval.current);
    };
  }, [isConnected, processFrame]);

  // Render detection boxes
  const renderDetectionBoxes = useCallback(() => {
    return detections.map((det, index) => {
      const [xMin, yMin, xMax, yMax] = det.bbox;
      const normalizedX = (xMin / 224) * screenWidth;
      const normalizedY = (yMin / 224) * screenHeight;
      const normalizedWidth = ((xMax - xMin) / 224) * screenWidth;
      const normalizedHeight = ((yMax - yMin) / 224) * screenHeight;

      return (
        <View
          key={`detection-${index}`}
          style={[
            styles.detectionBox,
            {
              left: Math.max(0, normalizedX),
              top: Math.max(0, normalizedY),
              width: Math.min(normalizedWidth, screenWidth - normalizedX),
              height: Math.min(normalizedHeight, screenHeight - normalizedY),
            },
          ]}
        >
          <Text style={styles.label}>{det.label.replace('_', ' ')}</Text>
        </View>
      );
    });
  }, [detections]);

  // Permission and device checks
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please grant camera permission</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <View style={styles.button}>
            <Icon name="lock-open-outline" size={moderateScale(20)} color="#fff" />
            <Text style={styles.buttonText}>Grant Permission</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.message}>{error || 'No camera available'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
        enableZoomGesture={false}
      />

      {renderDetectionBoxes()}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.switchButton} onPress={() => setIsFront((prev) => !prev)}>
          <View style={styles.button}>
            <Icon name="camera-reverse-outline" size={moderateScale(20)} color="#fff" />
            <Text style={styles.buttonText}>Switch Camera</Text>
          </View>
        </TouchableOpacity>
      </View>

      {isProcessing && (
        <ActivityIndicator style={styles.processingIndicator} size="small" color="#22c55e" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  camera: {
    flex: 1,
  },
  detectionBox: {
    position: 'absolute',
    borderWidth: moderateScale(2),
    borderColor: '#22c55e',
    borderRadius: moderateScale(4),
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  label: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.75)',
    fontSize: moderateScale(10),
    fontWeight: '600',
    padding: moderateScale(4),
    borderRadius: moderateScale(2),
  },
  errorContainer: {
    position: 'absolute',
    bottom: verticalScale(100),
    left: scale(20),
    right: scale(20),
    backgroundColor: 'rgba(239,68,68,0.85)',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: verticalScale(40),
    width: '100%',
    alignItems: 'center',
  },
  switchButton: {
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  permissionButton: {
    marginTop: verticalScale(20),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(12),
    minWidth: moderateScale(150),
    gap: scale(8),
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    margin: scale(20),
    fontSize: moderateScale(16),
    color: '#fff',
    fontWeight: '500',
  },
  processingIndicator: {
    position: 'absolute',
    top: verticalScale(20),
    left: scale(20),
  },
});

export default CurrencyDetectionScreen;