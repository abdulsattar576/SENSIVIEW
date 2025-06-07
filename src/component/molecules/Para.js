import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { moderateScale, scale } from 'react-native-size-matters';

const Para = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image 
        source={require("../../app/assets/images/textD.jpg")} 
        style={styles.imageStyle} 
      />

      <View style={styles.textContainer}>
        <Text style={styles.textStyle}>
          Point your camera at a document and Lookout reads it. Includes handwriting. 
          The beeping sound guides you to the document.
        </Text>

        <Text style={styles.textStyle}>
          Having trouble? Hold your device vertically or use the “Take photo” button 
          to read the text in view.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: scale(20),
    paddingHorizontal: scale(10),
  },
  imageStyle: {
    width: moderateScale(200),
    height: moderateScale(200),
    marginBottom: scale(20),  
    resizeMode: 'contain',
  },
  textContainer: {
    width: '90%',  
    alignItems: 'center',  
  },
  textStyle: {
    fontSize: moderateScale(15),
    marginBottom: scale(15),
    textAlign: 'center',
  }
});

export default Para;
