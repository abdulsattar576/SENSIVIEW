import React, { useState, useEffect, useCallback } from 'react';
import { View, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevices, CameraDevice } from 'react-native-vision-camera';
import Ionicons from "react-native-vector-icons/Ionicons"
type CameraPosition = 'front' | 'back';

const Selfie: React.FC = () => {
  const devices = useCameraDevices();
  const [cameraPermission, setCameraPermission] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>('back');

  // Find device by position in devices array
  const device: CameraDevice | undefined = devices.find(
    (d) => d.position === cameraPosition
  );

  const toggleCamera = useCallback(() => {
    setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  if (!cameraPermission) {
    return (
      <View style={styles.loading}>
        <Text>No camera permission granted.</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.loading}>
        <Text>No camera device found for {cameraPosition} camera.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />
      <View style={styles.buttonContainer}>
         
        <TouchableOpacity onPress={toggleCamera}>
          <Ionicons name='sync-outline' size={40} color="black"/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',      // fills parent width
    height: '100%',     // fills parent height
    justifyContent: 'center',
    alignItems: 'center',
   
    overflow: 'hidden',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#ffffffcc',
    borderRadius: 8,
    padding: 5,
  },
});

export default Selfie;
