import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { moderateScale, scale } from 'react-native-size-matters';

const Currency = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image 
        source={require("../../app/assets/images/money.jpeg")} 
        style={styles.imageStyle} 
      />

      <Text style={styles.textStyle}>
        Point your camera at a currency note, and Lookout will recognize it. Supports multiple currencies. 
        The beeping sound helps you align it correctly.
      </Text>

      <Text style={styles.textStyle}>
        Having trouble? Ensure good lighting or use the “Take photo” button 
        to detect the currency note in view.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(20),
  },
  imageStyle: {
    width: moderateScale(200),
    height: moderateScale(200),
    marginTop: scale(50),  
    resizeMode: 'contain'
  },
  textStyle: {
    fontSize: moderateScale(15),
    marginTop: scale(15),
    paddingHorizontal: scale(20),
    textAlign: 'center'
  }
});

export default Currency;
