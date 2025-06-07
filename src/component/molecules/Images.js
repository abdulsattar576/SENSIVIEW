import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { moderateScale, scale } from 'react-native-size-matters';

const Images = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require("../../app/assets/images/IMagaga.jpg")} style={styles.imageStyle} />

      <Text style={styles.textStyle}>
        Point your camera at an image, and Lookout will analyze and describe it.
        Recognizes faces, objects, and text.
      </Text>
      
      <Text style={styles.textStyle}>
        Having trouble? Hold your device steady or use the “Take photo” button 
        to process the image in view.
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
    marginTop: 10,
    paddingHorizontal: scale(20),
    textAlign: 'center',
  }
});

export default Images;
