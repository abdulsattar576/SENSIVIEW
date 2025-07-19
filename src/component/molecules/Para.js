 import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

/**
 * Documentation component with image and text paragraphs
 * @param {Object} props - Component props
 * @param {ImageSourcePropType} props.imageSource - Source for the image
 * @param {string[]} props.texts - Array of text paragraphs
 * @param {Object} props.containerStyle - Additional style for the main container
 * @param {Object} props.imageStyle - Additional style for the image
 * @param {Object} props.textStyle - Additional style for text
 * @param {Object} props.textContainerStyle - Additional style for text container
 */
const Para = ({
  imageSource = require("../../app/assets/images/textD.jpg"),
  texts = [
    "Point your camera at a document and Lookout reads it. Includes handwriting. The beeping sound guides you to the document.",
    "Having trouble? Hold your device vertically or use the 'Take photo' button to read the text in view."
  ],
  containerStyle,
  imageStyle,
  textStyle,
  textContainerStyle
}) => {
  return (
    <ScrollView 
      contentContainerStyle={[styles.container, containerStyle]}
      showsVerticalScrollIndicator={false}
      testID="para-scrollview"
    >
      <Image 
        source={imageSource} 
        style={[styles.imageStyle, imageStyle]} 
        accessibilityRole="image"
        accessibilityLabel="Document scanning illustration"
        testID="para-image"
      />

      <View style={[styles.textContainer, textContainerStyle]}>
        {texts.map((text, index) => (
          <Text 
            key={`para-text-${index}`}
            style={[styles.textStyle, textStyle]}
            testID={`para-text-${index}`}
            accessibilityRole="text"
          >
            {text}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

// Using StyleSheet.create for performance optimization
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(16), // Using standard 16px base for scaling
    backgroundColor: '#ffffff', // Explicit background color
  },
  imageStyle: {
    width: moderateScale(200),
    height: moderateScale(200),
    marginBottom: verticalScale(20),
    resizeMode: 'contain',
    borderRadius: moderateScale(4), // Subtle rounding
  },
  textContainer: {
    width: '90%',
    alignItems: 'center',
    paddingBottom: verticalScale(20), // Extra padding at bottom
  },
  textStyle: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22), // Better readability
    marginBottom: verticalScale(16),
    textAlign: 'center',
    color: '#333333', // Darker gray for better readability
    fontFamily: 'System', // Explicit system font
  }
});

export default React.memo(Para); // Optimize with memo