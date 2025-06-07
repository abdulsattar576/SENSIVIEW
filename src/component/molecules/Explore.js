import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { moderateScale, scale } from 'react-native-size-matters';

const Explore = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image 
        source={require("../../app/assets/images/ExploreD.jpg")} 
        style={styles.imageStyle} 
      />

      <View style={styles.textContainer}>
        <Text style={styles.textStyle}>
          Point your camera around, and Lookout will describe your surroundings. 
          Detects objects, text, and people in real time.
        </Text>

        <Text style={styles.textStyle}>
          Having trouble? Try moving your device slowly or use the “Take photo” button 
          to explore the scene in view.
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
    height: moderateScale(250), 
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

export default Explore;
