import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import Feather from "react-native-vector-icons/Feather"
import { useNavigation, NavigationProp } from '@react-navigation/native';

import { moderateScale, verticalScale } from 'react-native-size-matters'; // Import scale functions
  

const index = (props) => {

  // YouTube video link
  const videoUrl = "https://youtu.be/1by5J7c5Vz4?si=THE1KQZWQabJTfeE"; // Replace with your actual YouTube video URL
  
  // Function to handle video link opening
  const handleVideoPress = () => {
    Linking.openURL(videoUrl).catch((err) => console.error("Error opening video: ", err));
  };
  const navigation = useNavigation();

  // Navigate to the Signup page
  const handleNavigation = () => {
   navigation.navigate("signup")
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SensiView</Text>

      <View style={styles.feature}>
        <FontAwesome5 name="compass" size={moderateScale(24)} color="#6C63FF" />
        <Text style={styles.featureText}>
          SensiView uses your camera to read text, find objects, Explore and More
        </Text>
      </View>

      <View style={styles.feature}>
        <MaterialCommunityIcons name="text" size={moderateScale(24)} color="#6C63FF" />
        <Text style={styles.featureText}>
          Read and analyze your text in detail
        </Text>
      </View>

      <View style={styles.feature}>
        <Feather name="navigation" size={moderateScale(24)} color="#6C63FF" />
        <Text style={styles.featureText}>
          Provide Navigation assistance to the user
        </Text>
      </View>

      <Text style={styles.introText}>Introduction to SensiView</Text>
      <TouchableOpacity style={styles.videoButton} onPress={handleVideoPress}>
        <FontAwesome5 name="play" size={moderateScale(48)} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.nextButton} onPress={handleNavigation}>
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: moderateScale(20),  
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',  
  },
  title: {
    fontSize: moderateScale(28), 
    fontWeight: 'bold',
    color: '#333', 
    marginBottom: verticalScale(40),  
    textAlign: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),  
    width: '100%',
    paddingHorizontal: moderateScale(15),  
  },
  featureText: {
    marginLeft: moderateScale(15), 
    fontSize: moderateScale(16),  
    color: '#333',
    flexShrink: 1,
  },
  introText: {
    fontSize: moderateScale(20),  
    fontWeight: '600',
    marginTop: verticalScale(30),  
    marginBottom: verticalScale(20),  
    color: '#333',
    textAlign: 'center',
  },
  videoButton: {
    marginBottom: verticalScale(40), 
    borderWidth: 1,
    borderColor: '#6C63FF',  
    borderRadius: moderateScale(50),  
    padding: moderateScale(30),  
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6C63FF', 
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nextButton: {
    backgroundColor: '#6C63FF',  
    borderRadius: moderateScale(25),  
    paddingHorizontal: moderateScale(40),  
    paddingVertical: verticalScale(15),  
    shadowColor: '#6C63FF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nextText: {
    color: '#fff',
    fontSize: moderateScale(18),  
    fontWeight: 'bold',
  },
});
