 import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import HomeScreen from './index'; // Renamed from 'index' to 'HomeScreen'
import RecentActivityScreen from './RecentActivityScreen';
import { moderateScale, verticalScale } from 'react-native-size-matters';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: styles.label,
        
      }}
    >
      <Tab.Screen 
        name="Vision" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View style={focused ? styles.activeIconContainer : styles.iconContainer}>
              <FontAwesome 
                name="eye" 
                color={color} 
                size={moderateScale(22)} 
              />
            </View>
          ),
          tabBarLabel: 'Vision',
        }}
      />
      <Tab.Screen 
        name="Activity" 
        component={RecentActivityScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View style={focused ? styles.activeIconContainer : styles.iconContainer}>
              <FontAwesome 
                name="history" 
                color={color} 
                size={moderateScale(22)} 
              />
            </View>
          ),
          tabBarLabel: 'Activity',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: verticalScale(70),
    borderTopWidth: 0,
    backgroundColor: '#F3F0FF', // Light purple background
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    paddingHorizontal: moderateScale(20),
  },
  tabItem: {
    height: verticalScale(60),
    paddingBottom: verticalScale(5),
  },
  label: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginBottom: verticalScale(5),
    color: '#6C63FF', // Purple label color
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E1FF', // Subtle purple for inactive icon
    borderRadius: moderateScale(20),
  },
  activeIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.15)', // More visible purple for active icon
    borderRadius: moderateScale(20),
  },
});

export default TabNavigator;