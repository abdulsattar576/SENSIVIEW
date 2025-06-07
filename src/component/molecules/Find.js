import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { moderateScale, scale } from 'react-native-size-matters';

const Find = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require("../../app/assets/images/finds.jpeg")} style={styles.imageStyle} />

      <Text style={styles.textStyle}>
        Point your camera at an object, and Lookout will identify it. Includes keys, wallets, and more.
        The beeping sound helps you locate it.
      </Text>

      <Text style={styles.textStyle}>
        Having trouble? Move your device around or use the “Take photo” button 
        to identify objects in view.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,  
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: scale(20),
  },
  imageStyle: {
    width: 200,
    height: 200,
    marginTop: scale(50),  
  },
  textStyle: {
    fontSize: moderateScale(15),
    marginTop: 20,
    paddingHorizontal: scale(20),
    textAlign: 'center',  
  },
});

export default Find;
