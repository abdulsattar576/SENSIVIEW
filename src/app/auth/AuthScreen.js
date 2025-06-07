import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen'; // Adjusted import name to match convention
import SignupScreen from './Signup';
import LoginScreen from './login';

const Stack = createNativeStackNavigator();

const AuthScreen = ({ onLoginSuccess }) => {
  return (
    <Stack.Navigator initialRouteName='home' screenOptions={{ headerShown: false }}>
      <Stack.Screen name='home' component={HomeScreen} />
      <Stack.Screen name='signup'>
        {(props) => <SignupScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </Stack.Screen>
      <Stack.Screen name='login'>
        {(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AuthScreen;