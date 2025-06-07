 import { View, Text } from 'react-native'
 import React from 'react'
 import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createStaticNavigation } from '@react-navigation/native'
import Profile from "./Profile"
import ChangePassword from './ChangePassword'
import Info from './Info'
import TabScreen from './Tabs/TabScreen'
import ImageBaseDetecion from './ImageBaseDetecion'
import TextOCRScreen from './TextOCRScreen'
import LiveDetectionScreen from './LiveDetectionScreen'
import CurrencyDetectionScreen from './CurrencyDetectionScreen'
import SeatDetectionScreen from './SeatDetectionScreen'
import FindObjectScreen from './FindObjectScreen'
 
const Stack = createNativeStackNavigator ();
 const MainScreen = () => {
   return (
      <Stack.Navigator initialRouteName='TabScreen' screenOptions={{headerShown:false}}>
        <Stack.Screen name='TabScreen' component={TabScreen}/>
        <Stack.Screen name='profile' component={Profile}/>
        <Stack.Screen name='changePassword' component={ChangePassword}/>
        <Stack.Screen name='Info' component={Info}/>
        <Stack.Screen name='ImageDetection' component={ImageBaseDetecion}/>
        <Stack.Screen name='TextDetection' component={TextOCRScreen}/>
        <Stack.Screen name='LiveDetect' component={LiveDetectionScreen}/>
        <Stack.Screen name='CurrencyDetect' component={CurrencyDetectionScreen}/>
        <Stack.Screen name='seatDetect' component={SeatDetectionScreen}/>
        <Stack.Screen name='find' component={FindObjectScreen}/>
       
      </Stack.Navigator>
   )
 }
 
 export default MainScreen